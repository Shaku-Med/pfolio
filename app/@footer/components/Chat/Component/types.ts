export interface UploadedFile {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error' | 'pending-thumbnail';
  error?: string;
  customName?: string;
  url?: string;
  retryCount?: number;
  chunks: {
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
  }[];
  chunkingProgress?: number;
  path?: string;
} 