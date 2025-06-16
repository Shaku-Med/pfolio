'use client'

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Pencil, Check, RefreshCw, Loader2, Upload, Image as ImageIcon } from 'lucide-react';
import { FilePreviewDialog } from './FilePreviewDialog';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import Cookies from 'js-cookie';
import SetQuickToken from '@/app/Auth/Functions/SetQuickToken';
import { v4 as uuid } from 'uuid';
import { useChatContext } from '@/app/components/Context/ChatContext';
import { VideoThumbnailGenerator } from 'browser-video-thumbnail-generator';

/**
 * Interface defining the structure of file chunks for chunked uploads
 */
interface FileChunk {
  id: string;
  blob: Blob;
  name: string;
  index: number;
  totalChunks: number;
  objectUrl: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
  path?: string;
  url?: string;
  responseData?: any;
  length: number;
}

/**
 * Interface for generated video thumbnails
 */
interface VideoThumbnail {
  id: string;
  width: number;
  height: number;
  thumbnail: string; // Base64 data URL
  timeStamp: number;
  selected: boolean;
}

/**
 * Interface defining the structure of uploaded files with enhanced video thumbnail support
 */
interface UploadedFile {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error' | 'pending-thumbnail';
  error?: string;
  customName?: string;
  url?: string;
  retryCount?: number;
  responseData?: any;
  chunkLength?: number;
  totalChunks?: number;
  chunks: FileChunk[];
  chunkingProgress?: number;
  path?: string;
  fileType?: string;
  // Video thumbnail related properties
  isVideo?: boolean;
  generatedThumbnails?: VideoThumbnail[];
  selectedThumbnail?: VideoThumbnail;
  customThumbnail?: File;
  thumbnailGenerationProgress?: number;
  thumbnailUrl?: string;
  showThumbnailSelector?: boolean;
}

/**
 * Props interface for the FileUpload component
 */
interface FileUploadProps {
  onFilesChange: (files: UploadedFile[]) => void;
  maxFiles?: number;
  maxSize?: number;
  autoUpload?: boolean;
  accept?: {
    [key: string]: string[];
  };
  onProcessing?: (isProcessing: boolean) => void;
  onComplete?: (completed: boolean, files: UploadedFile[]) => void;
  addVideoThumbnail?: boolean;
  outsideAdmin?: boolean;
}

/**
 * Enhanced FileUpload component with video thumbnail generation capabilities
 * 
 * Features:
 * - Standard file upload with chunking support
 * - Video thumbnail generation and selection
 * - Custom thumbnail upload for videos
 * - Progress tracking and error handling
 * - File name editing capabilities
 * - Drag and drop interface
 */
export function FileUpload({
  onFilesChange,
  maxFiles = 15,
  maxSize = 1024 * 1024 * 1024, // 1GB default
  autoUpload = true,
  accept,
  onProcessing,
  onComplete,
  addVideoThumbnail = false,
  outsideAdmin = false
}: FileUploadProps) {
  // State management for uploaded files and UI states
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  const [editName, setEditName] = useState<string>('');
  const [hasCompletedUploads, setHasCompletedUploads] = useState<boolean>(false);
  
  // Get admin context for user identification
  const { isAdmin } = useChatContext();

  /**
   * Generates video thumbnails at different timestamps using VideoThumbnailGenerator
   * @param file - Video file to generate thumbnails from
   * @param fileId - Unique identifier for the file
   * @returns Promise<VideoThumbnail[]> - Array of generated thumbnails
   */
  const generateVideoThumbnailsForFile = async (file: File, fileId: string): Promise<VideoThumbnail[]> => {
    try {
      // Update file status to show thumbnail generation in progress
      setUploadedFiles(prev =>
        prev.map(f =>
          f.id === fileId ? {
            ...f,
            thumbnailGenerationProgress: 0,
            showThumbnailSelector: true
          } : f
        )
      );

      // Create video URL for the generator
      const videoUrl = URL.createObjectURL(file);
      
      // Initialize the VideoThumbnailGenerator
      const generator = new VideoThumbnailGenerator(videoUrl);
      
      // Update progress to 25%
      setUploadedFiles(prev =>
        prev.map(f =>
          f.id === fileId ? {
            ...f,
            thumbnailGenerationProgress: 25
          } : f
        )
      );

      // Generate thumbnails (default generates multiple thumbnails automatically)
      const generatedThumbnails = await generator.getThumbnails(4); // Generate 4 thumbnails
      
      // Update progress to 75%
      setUploadedFiles(prev =>
        prev.map(f =>
          f.id === fileId ? {
            ...f,
            thumbnailGenerationProgress: 75
          } : f
        )
      );

      // Convert generated thumbnails to our VideoThumbnail format
      const processedThumbnails: VideoThumbnail[] = generatedThumbnails.map((thumb, index) => ({
        id: uuid(),
        width: thumb.width,
        height: thumb.height,
        thumbnail: thumb.thumbnail, // This is the base64 data URL
        timeStamp: (index + 1) / (generatedThumbnails.length + 1), // Distribute evenly
        selected: index === 0 // Select first thumbnail by default
      }));

      // Clean up the object URL
      URL.revokeObjectURL(videoUrl);

      // Update file with generated thumbnails
      setUploadedFiles(prev =>
        prev.map(f =>
          f.id === fileId ? {
            ...f,
            generatedThumbnails: processedThumbnails,
            selectedThumbnail: processedThumbnails[0] || undefined,
            thumbnailGenerationProgress: 100
          } : f
        )
      );

      return processedThumbnails;
    } catch (error) {
      console.error('Error generating video thumbnails:', error);
      toast.error('Failed to generate video thumbnails');
      
      // Update file status to show error
      setUploadedFiles(prev =>
        prev.map(f =>
          f.id === fileId ? {
            ...f,
            error: 'Failed to generate thumbnails',
            showThumbnailSelector: true,
            thumbnailGenerationProgress: 0
          } : f
        )
      );
      
      return [];
    }
  };

  /**
   * Handles custom thumbnail file selection for videos
   * @param fileId - ID of the video file
   * @param thumbnailFile - Selected thumbnail image file
   */
  const handleCustomThumbnailUpload = useCallback((fileId: string, thumbnailFile: File) => {
    // Validate that the uploaded file is an image
    if (!thumbnailFile.type.startsWith('image/')) {
      toast.error('Please upload a valid image file for the thumbnail');
      return;
    }

    // Validate image size (max 5MB for thumbnails)
    const maxThumbnailSize = 5 * 1024 * 1024; // 5MB
    if (thumbnailFile.size > maxThumbnailSize) {
      toast.error('Thumbnail image size should be less than 5MB');
      return;
    }

    // Update file with custom thumbnail
    setUploadedFiles(prev =>
      prev.map(f =>
        f.id === fileId ? {
          ...f,
          customThumbnail: thumbnailFile,
          selectedThumbnail: undefined, // Clear selected generated thumbnail
          thumbnailUrl: URL.createObjectURL(thumbnailFile)
        } : f
      )
    );

    toast.success('Custom thumbnail selected successfully');
  }, []);

  /**
   * Handles selection of generated thumbnails
   * @param fileId - ID of the video file
   * @param thumbnailId - ID of the selected thumbnail
   */
  const selectGeneratedThumbnail = useCallback((fileId: string, thumbnailId: string) => {
    setUploadedFiles(prev =>
      prev.map(f =>
        f.id === fileId ? {
          ...f,
          selectedThumbnail: f.generatedThumbnails?.find(t => t.id === thumbnailId),
          customThumbnail: undefined, // Clear custom thumbnail
          thumbnailUrl: undefined
        } : f
      )
    );
  }, []);

  /**
   * Uploads a file with support for chunking and video thumbnail handling
   * @param file - File to upload
   * @param existingFileId - Optional existing file ID for retry scenarios
   */
  const uploadFile = async (file: File, existingFileId?: string): Promise<void> => {
    const fileId = existingFileId || uuid();
    const isVideoFile = file.type.startsWith('video/');
    const isAudioFile = file.type.startsWith('audio/');
    const isVideoOrAudio = isVideoFile || isAudioFile;

    // Initialize or update file state
    if (!existingFileId) {
      const newFile: UploadedFile = {
        id: fileId,
        file,
        progress: 0,
        status: (addVideoThumbnail && isVideoFile) ? 'pending-thumbnail' : 'uploading',
        customName: file.name,
        chunks: [],
        chunkingProgress: 0,
        isVideo: isVideoFile,
        generatedThumbnails: [],
        showThumbnailSelector: false,
        fileType: file.type
      };

      setUploadedFiles(prev => [...prev, newFile]);

      // Generate thumbnails for video files if addVideoThumbnail is enabled
      if (addVideoThumbnail && isVideoFile) {
        await generateVideoThumbnailsForFile(file, fileId);
        return; // Wait for user to select thumbnail before uploading
      }
    } else {
      // Update existing file for retry
      setUploadedFiles(prev =>
        prev.map(f =>
          f.id === fileId ? {
            ...f,
            status: 'uploading',
            progress: 0,
            error: undefined,
            retryCount: (f.retryCount || 0) + 1
          } : f
        )
      );
    }

    try {
      // Get authentication tokens
      const tokenResult = await SetQuickToken(
        'file_token', 
        `${Cookies.get('chat_private_token')}`, 
        [], 
        [], 
        true
      );

      if (!tokenResult) {
        throw new Error('Failed to get authentication token');
      }

      // Get upload endpoint and tokens
      const authResponse = await fetch('/api/upload', {
        headers: new Headers({
          'Authorization': Cookies.get('session') || ''
        })
      });

      if (!authResponse.ok) {
        throw new Error('Failed to authenticate upload request');
      }

      const authData = await authResponse.json();

      // Configure chunking for non-video/audio files
      const CHUNK_SIZE = 2 * 1024 * 1024; // 2MB chunks
      const totalChunks = isVideoOrAudio ? 1 : Math.ceil(file.size / CHUNK_SIZE);

      // Create file chunks for non-video/audio files
      const chunks: FileChunk[] = [];
      if (!isVideoOrAudio) {
        for (let i = 0; i < totalChunks; i++) {
          const start = i * CHUNK_SIZE;
          const end = Math.min(start + CHUNK_SIZE, file.size);
          const chunk = file.slice(start, end);
          
          chunks.push({
            id: uuid(),
            blob: chunk,
            name: file.name,
            index: i,
            totalChunks,
            objectUrl: URL.createObjectURL(chunk),
            progress: 0,
            status: 'pending',
            length: chunk.size
          });
        }
      }

      // Update file with chunk information
      setUploadedFiles(prev =>
        prev.map(f =>
          f.id === fileId ? {
            ...f,
            chunks: chunks,
            chunkLength: CHUNK_SIZE,
            totalChunks: totalChunks,
            status: 'uploading'
          } : f
        )
      );

      if (isVideoOrAudio) {
        // Upload complete file for video/audio
        await uploadCompleteFile(fileId, file, authData);
      } else {
        // Upload file in chunks
        await uploadFileInChunks(fileId, file, chunks, authData);
      }

      toast.success(`Successfully uploaded ${file.name}`);
    } catch (error) {
      console.error('Error uploading file:', error);
      
      setUploadedFiles(prev =>
        prev.map(f =>
          f.id === fileId ? { 
            ...f, 
            status: 'error', 
            error: error instanceof Error ? error.message : 'Failed to upload file' 
          } : f
        )
      );
      
      toast.error(`Failed to upload ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  /**
   * Uploads a complete file (used for video/audio files)
   * @param fileId - Unique file identifier
   * @param file - File to upload
   * @param authData - Authentication data from server
   */
  const uploadCompleteFile = async (fileId: string, file: File, authData: any): Promise<void> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', file.name);
    formData.append('id', fileId);
    formData.append('owner_id', outsideAdmin ? localStorage.getItem(`c_usr`) : isAdmin ? isAdmin?.user_id : Cookies.get('id') || '');
    formData.append('index', '0');
    formData.append('fileType', file.type);

    // Upload the main file first
    const response = await fetch('https://fileserver.medzyamara.dev/upload', {
      method: 'POST',
      body: formData,
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Authorization': `${authData?.token}`,
        'access-token': `${authData?.uploadToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`Upload failed with status ${response.status}`);
    }

    const responseData = await response.json();
    
    // Handle thumbnail upload separately if available
    const fileData = uploadedFiles.find(f => f.id === fileId);
    let thumbnailData = null;

    if (fileData?.selectedThumbnail) {
      try {
        // Create a new FormData for thumbnail
        const response = await fetch(fileData.selectedThumbnail.thumbnail);
        const thumbnailBlob = await response.blob();
        
        // Configure chunking for thumbnail
        const CHUNK_SIZE = 2 * 1024 * 1024; // 2MB chunks
        const totalChunks = Math.ceil(thumbnailBlob.size / CHUNK_SIZE);
        
        // Create thumbnail chunks
        const thumbnailChunks: FileChunk[] = [];
        for (let i = 0; i < totalChunks; i++) {
          const start = i * CHUNK_SIZE;
          const end = Math.min(start + CHUNK_SIZE, thumbnailBlob.size);
          const chunk = thumbnailBlob.slice(start, end);
          
          thumbnailChunks.push({
            id: uuid(),
            blob: chunk,
            name: 'thumbnail.jpg',
            index: i,
            totalChunks,
            objectUrl: URL.createObjectURL(chunk),
            progress: 0,
            status: 'pending',
            length: chunk.size
          });
        }

        // Upload thumbnail chunks
        for (let i = 0; i < thumbnailChunks.length; i++) {
          const chunk = thumbnailChunks[i];
          const thumbnailFormData = new FormData();
          thumbnailFormData.append('file', chunk.blob);
          thumbnailFormData.append('fileName', 'thumbnail.jpg');
          thumbnailFormData.append('id', `${fileId}_thumbnail`);
          thumbnailFormData.append('owner_id', outsideAdmin ? localStorage.getItem(`c_usr`) : isAdmin ? isAdmin?.user_id : Cookies.get('id') || '');
          thumbnailFormData.append('index', i.toString());

          const thumbnailResponse = await fetch('https://fileserver.medzyamara.dev/upload', {
            method: 'POST',
            body: thumbnailFormData,
            credentials: 'include',
            headers: {
              'Accept': 'application/json',
              'Authorization': `${authData?.token}`,
              'access-token': `${authData?.uploadToken}`
            }
          });

          if (!thumbnailResponse.ok) {
            throw new Error(`Thumbnail chunk upload failed with status ${thumbnailResponse.status}`);
          }

          const chunkResponse = await thumbnailResponse.json();
          
          // Update thumbnail progress
          setUploadedFiles(prev =>
            prev.map(f =>
              f.id === fileId ? {
                ...f,
                thumbnailGenerationProgress: ((i + 1) / totalChunks) * 100
              } : f
            )
          );

          // Store the last chunk's response data
          if (i === thumbnailChunks.length - 1) {
            thumbnailData = chunkResponse;
          }
        }

        // Clean up object URLs
        thumbnailChunks.forEach(chunk => URL.revokeObjectURL(chunk.objectUrl));

      } catch (error) {
        console.warn('Failed to upload thumbnail:', error);
      }
    } else if (fileData?.customThumbnail) {
      try {
        // Configure chunking for custom thumbnail
        const CHUNK_SIZE = 2 * 1024 * 1024; // 2MB chunks
        const totalChunks = Math.ceil(fileData.customThumbnail.size / CHUNK_SIZE);
        
        // Create custom thumbnail chunks
        const thumbnailChunks: FileChunk[] = [];
        for (let i = 0; i < totalChunks; i++) {
          const start = i * CHUNK_SIZE;
          const end = Math.min(start + CHUNK_SIZE, fileData.customThumbnail.size);
          const chunk = fileData.customThumbnail.slice(start, end);
          
          thumbnailChunks.push({
            id: uuid(),
            blob: chunk,
            name: fileData.customThumbnail.name,
            index: i,
            totalChunks,
            objectUrl: URL.createObjectURL(chunk),
            progress: 0,
            status: 'pending',
            length: chunk.size
          });
        }

        // Upload custom thumbnail chunks
        for (let i = 0; i < thumbnailChunks.length; i++) {
          const chunk = thumbnailChunks[i];
          const thumbnailFormData = new FormData();
          thumbnailFormData.append('file', chunk.blob);
          thumbnailFormData.append('fileName', fileData.customThumbnail.name);
          thumbnailFormData.append('id', `${fileId}_thumbnail`);
          thumbnailFormData.append('owner_id', outsideAdmin ? localStorage.getItem(`c_usr`) : isAdmin ? isAdmin?.user_id : Cookies.get('id') || '');
          thumbnailFormData.append('index', i.toString());

          const thumbnailResponse = await fetch('https://fileserver.medzyamara.dev/upload', {
            method: 'POST',
            body: thumbnailFormData,
            credentials: 'include',
            headers: {
              'Accept': 'application/json',
              'Authorization': `${authData?.token}`,
              'access-token': `${authData?.uploadToken}`
            }
          });

          if (!thumbnailResponse.ok) {
            throw new Error(`Custom thumbnail chunk upload failed with status ${thumbnailResponse.status}`);
          }

          const chunkResponse = await thumbnailResponse.json();
          
          // Update thumbnail progress
          setUploadedFiles(prev =>
            prev.map(f =>
              f.id === fileId ? {
                ...f,
                thumbnailGenerationProgress: ((i + 1) / totalChunks) * 100
              } : f
            )
          );

          // Store the last chunk's response data
          if (i === thumbnailChunks.length - 1) {
            thumbnailData = chunkResponse;
          }
        }

        // Clean up object URLs
        thumbnailChunks.forEach(chunk => URL.revokeObjectURL(chunk.objectUrl));

      } catch (error) {
        console.warn('Failed to upload custom thumbnail:', error);
      }
    }
    
    // Update file status to completed with combined data
    setUploadedFiles(prevFiles => {
      const updatedFiles = prevFiles.map(f =>
        f.id === fileId ? {
          ...f,
          status: 'completed' as const,
          progress: 100,
          url: responseData.urls,
          path: responseData.path,
          fileType: file.type,
          responseData: {
            ...responseData,
            fileType: file.type,
            thumbnail: thumbnailData ? {
              url: thumbnailData.urls,
              path: thumbnailData.path
            } : undefined
          }
        } : f
      );
      
      updateCompletionStatus(updatedFiles);
      return updatedFiles;
    });
  };

  /**
   * Uploads a file in chunks
   * @param fileId - Unique file identifier
   * @param file - Original file
   * @param chunks - Array of file chunks
   * @param authData - Authentication data from server
   */
  const uploadFileInChunks = async (
    fileId: string, 
    file: File, 
    chunks: FileChunk[], 
    authData: any
  ): Promise<void> => {
    const totalChunks = chunks.length;
    let finalResponseData = null;

    // Upload each chunk sequentially
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const formData = new FormData();
      
      formData.append('file', chunk.blob);
      formData.append('fileName', file.name);
      formData.append('id', fileId);
      formData.append('owner_id', outsideAdmin ? localStorage.getItem(`c_usr`) : isAdmin ? isAdmin?.user_id : Cookies.get('id') || '');
      formData.append('index', i.toString());
      formData.append('fileType', file.type);

      const response = await fetch('https://fileserver.medzyamara.dev/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Authorization': `${authData?.token}`,
          'access-token': `${authData?.uploadToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`Chunk upload failed with status ${response.status}`);
      }

      const responseData = await response.json();
      
      // Store the last chunk's response data as the final response
      if (i === chunks.length - 1) {
        finalResponseData = responseData;
      }
      
      // Update chunk and overall file progress
      setUploadedFiles(prev =>
        prev.map(f =>
          f.id === fileId ? {
            ...f,
            chunks: f.chunks.map(c =>
              c.index === i ? {
                ...c,
                status: 'completed' as const,
                progress: 100,
                path: responseData.path,
                url: responseData.urls,
                responseData: responseData
              } : c
            ),
            progress: ((i + 1) / totalChunks) * 100
          } : f
        )
      );
    }

    // Mark entire file as completed with final response data
    setUploadedFiles(prevFiles => {
      const updatedFiles = prevFiles.map(f =>
        f.id === fileId ? {
          ...f,
          status: 'completed' as const,
          progress: 100,
          url: finalResponseData?.urls,
          path: finalResponseData?.path,
          fileType: file.type,
          responseData: {
            ...finalResponseData,
            fileType: file.type
          }
        } : f
      );
      
      updateCompletionStatus(updatedFiles);
      return updatedFiles;
    });
  };

  /**
   * Updates the completion status and triggers callbacks
   * @param updatedFiles - Updated files array
   */
  const updateCompletionStatus = (updatedFiles: UploadedFile[]): void => {
    const completedFiles = updatedFiles.filter(f => f.status === 'completed');
    
    if (completedFiles.length === updatedFiles.length && updatedFiles.length > 0) {
      setHasCompletedUploads(true);
    }
    
    onFilesChange(completedFiles);
  };

  /**
   * Handles the drop event for drag-and-drop file uploads
   */
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    // Validate file sizes
    const validFiles = acceptedFiles.filter(file => {
      if (file.size > maxSize) {
        toast.error(`File ${file.name} exceeds the size limit`);
        return false;
      }
      return true;
    });

    // Check total file count limit
    if (uploadedFiles.length + validFiles.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    setIsProcessing(true);
    
    // Process each file
    for (const file of validFiles) {
      await uploadFile(file);
    }
    
    setIsProcessing(false);
  }, [maxFiles, maxSize, uploadedFiles, autoUpload]);

  // Configure react-dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles,
    maxSize,
    disabled: isProcessing,
    accept
  });

  /**
   * Removes a file from the upload list
   * @param id - File ID to remove
   */
  const removeFile = (id: string): void => {
    setUploadedFiles(prev => prev.filter(file => file.id !== id));
    onFilesChange(uploadedFiles.filter(f => f.id !== id && f.status === 'completed'));
  };

  /**
   * Starts editing mode for a file name
   * @param file - File to edit
   */
  const startEditing = (file: UploadedFile): void => {
    setEditingFileId(file.id);
    setEditName(file.customName || file.file.name);
  };

  /**
   * Saves the edited file name
   * @param id - File ID
   */
  const saveEdit = (id: string): void => {
    setUploadedFiles(prev =>
      prev.map(f =>
        f.id === id ? { ...f, customName: editName } : f
      )
    );
    setEditingFileId(null);
  };

  /**
   * Cancels the editing operation
   */
  const cancelEdit = (): void => {
    setEditingFileId(null);
  };

  /**
   * Retries uploading a failed file
   * @param fileId - ID of the file to retry
   */
  const retryUpload = async (fileId: string): Promise<void> => {
    const fileToRetry = uploadedFiles.find(f => f.id === fileId);
    if (!fileToRetry) return;

    await uploadFile(fileToRetry.file, fileId);
  };

  /**
   * Confirms thumbnail selection and proceeds with video upload
   * @param fileId - ID of the video file
   */
  const confirmThumbnailAndUpload = async (fileId: string): Promise<void> => {
    const file = uploadedFiles.find(f => f.id === fileId);
    if (!file) return;

    // Validate that a thumbnail is selected
    if (!file.selectedThumbnail && !file.customThumbnail) {
      toast.error('Please select a thumbnail before uploading the video');
      return;
    }

    // Update status to uploading and hide thumbnail selector
    setUploadedFiles(prev =>
      prev.map(f =>
        f.id === fileId ? {
          ...f,
          status: 'uploading',
          showThumbnailSelector: false
        } : f
      )
    );

    // Proceed with file upload
    await uploadFile(file.file, fileId);
  };

  // Effect to notify parent component of processing state changes
  useEffect(() => {
    onProcessing?.(isProcessing);
  }, [isProcessing, onProcessing]);

  return (
    <div className="space-y-4">
      {/* File Drop Zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary'
        } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        <p className="text-sm text-muted-foreground">
          {isProcessing
            ? 'Processing files...'
            : isDragActive
              ? 'Drop the files here'
              : 'Drag & drop files here, or click to select files'}
        </p>
      </div>

      {/* Processing Indicator */}
      {isProcessing && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          exit={{ opacity: 0, y: -20 }} 
          transition={{ duration: 0.3, ease: "easeOut" }} 
          className='text-blue-500 flex items-center gap-2'
        >
          <Loader2 className='w-4 h-4 animate-spin' />
          <p>Please wait while we process your files.</p>
        </motion.div>
      )}

      {/* Save Files Button */}
      {/* {hasCompletedUploads && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="flex justify-end"
        >
          <Button
            onClick={() => {
              const completedFiles = uploadedFiles.filter(f => f.status === 'completed');
              onComplete?.(true, completedFiles);
            }}
            className="bg-primary hover:bg-primary/90"
          >
            Save Files
          </Button>
        </motion.div>
      )} */}

      {/* Files List */}
      <div className="">
        {uploadedFiles.map((uploadedFile, key) => (
          <motion.div
            key={uploadedFile.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`space-y-2 px-4 py-3 overflow-hidden hover:bg-muted/50 ${
              key < 1 
                ? uploadedFiles.length === 1 
                  ? 'rounded-lg' 
                  : 'rounded-t-lg' 
                : key === uploadedFiles.length - 1 
                  ? 'rounded-b-lg' 
                  : ''
            } border`}
          >
            {/* File Header */}
            <div className="flex items-center gap-2">
              <FilePreviewDialog
                file={uploadedFile.file}
                onRemove={() => removeFile(uploadedFile.id)}
              />
              <div className="flex-1">
                {/* File Name Editing */}
                {editingFileId === uploadedFile.id ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="h-8"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          saveEdit(uploadedFile.id);
                        } else if (e.key === 'Escape') {
                          cancelEdit();
                        }
                      }}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => saveEdit(uploadedFile.id)}
                      className="text-green-500 hover:text-green-600"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium line-clamp-1">
                      {uploadedFile.customName?.slice(0, 15) || uploadedFile.file.name.slice(0, 15)}...
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => startEditing(uploadedFile)}
                      disabled={uploadedFile.status === 'uploading'}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <div className="flex items-center text-xs text-muted-foreground gap-2">
                  <span>{(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB</span>
                  {uploadedFile.isVideo && <span>• Video File</span>}
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFile(uploadedFile.id)}
                  disabled={uploadedFile.status === 'uploading'}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Video Thumbnail Selector */}
            {uploadedFile.showThumbnailSelector && uploadedFile.isVideo && addVideoThumbnail && (
              <div className="space-y-3 p-3 bg-muted/30 rounded-lg">
                <h4 className="text-sm font-medium">Select Video Thumbnail</h4>
                
                {/* Thumbnail Generation Progress */}
                {uploadedFile.thumbnailGenerationProgress !== undefined && 
                 uploadedFile.thumbnailGenerationProgress < 100 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Generating thumbnails...</span>
                    </div>
                    <Progress value={uploadedFile.thumbnailGenerationProgress} />
                  </div>
                )}

                {/* Generated Thumbnails */}
                {uploadedFile.generatedThumbnails && uploadedFile.generatedThumbnails.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Generated Thumbnails:</p>
                    <div className="flex gap-2 flex-wrap">
                      {uploadedFile.generatedThumbnails.map((thumbnail) => (
                        <button
                          key={thumbnail.id}
                          onClick={() => selectGeneratedThumbnail(uploadedFile.id, thumbnail.id)}
                          className={`relative w-20 h-16 rounded border-2 overflow-hidden ${
                            uploadedFile.selectedThumbnail?.id === thumbnail.id
                              ? 'border-primary'
                              : 'border-muted-foreground/25 hover:border-primary/50'
                          }`}
                        >
                          <img
                            src={thumbnail.thumbnail}
                            alt={`Thumbnail at ${(thumbnail.timeStamp * 100).toFixed(0)}%`}
                            className="w-full h-full object-cover"
                          />
                          {uploadedFile.selectedThumbnail?.id === thumbnail.id && (
                            <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                              <Check className="w-4 h-4 text-primary" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Custom Thumbnail Upload */}
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Or upload custom thumbnail:</p>
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleCustomThumbnailUpload(uploadedFile.id, file);
                        }
                      }}
                      className="h-8 text-xs"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/*';
                        input.onchange = (e) => {
                          const file = (e.target as HTMLInputElement).files?.[0];
                          if (file) {
                            handleCustomThumbnailUpload(uploadedFile.id, file);
                          }
                        };
                        input.click();
                      }}
                    >
                      <Upload className="w-3 h-3" />
                      Upload
                    </Button>
                  </div>
                  
                  {/* Show selected custom thumbnail */}
                  {uploadedFile.customThumbnail && (
                    <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                      <ImageIcon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        Custom: {uploadedFile.customThumbnail.name}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setUploadedFiles(prev =>
                            prev.map(f =>
                              f.id === uploadedFile.id ? {
                                ...f,
                                customThumbnail: undefined,
                                thumbnailUrl: undefined
                              } : f
                            )
                          );
                        }}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Confirm and Upload Button */}
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setUploadedFiles(prev =>
                        prev.map(f =>
                          f.id === uploadedFile.id ? {
                            ...f,
                            showThumbnailSelector: false,
                            status: 'error',
                            error: 'Upload cancelled'
                          } : f
                        )
                      );
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => confirmThumbnailAndUpload(uploadedFile.id)}
                    disabled={!uploadedFile.selectedThumbnail && !uploadedFile.customThumbnail}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Upload Video
                  </Button>
                </div>
              </div>
            )}
            
            {/* Upload Progress */}
            {uploadedFile.status !== 'pending-thumbnail' && !uploadedFile.showThumbnailSelector && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {uploadedFile.status === 'error' ? 'Failed' : 
                     uploadedFile.status === 'completed' ? 'Complete' : 
                     `${Math.round(uploadedFile.progress)}%`}
                  </span>
                  {uploadedFile.status === 'uploading' && uploadedFile.chunks.length > 0 && (
                    <span className="text-muted-foreground">
                      {uploadedFile.chunks.filter(c => c.status === 'completed').length} / {uploadedFile.chunks.length} chunks
                    </span>
                  )}
                </div>
                <Progress value={uploadedFile.progress} />
              </div>
            )}
            
            {/* Error State with Retry */}
            {uploadedFile.status === 'error' && (
              <div className="flex items-center gap-2 text-destructive text-sm">
                <p>{uploadedFile.error}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => retryUpload(uploadedFile.id)}
                  className="text-primary hover:text-primary/80"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Retry
                </Button>
              </div>
            )}

            {/* Pending Thumbnail Status */}
            {uploadedFile.status === 'pending-thumbnail' && !uploadedFile.showThumbnailSelector && (
              <div className="flex items-center gap-2 text-amber-600 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                <p>Preparing video thumbnail options...</p>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}