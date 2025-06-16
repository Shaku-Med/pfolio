export interface UploadedFile extends File {
  preview?: string;
  id: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  chunks: any[];
}

export interface FileUploadProps {
  onFilesChange: (files: UploadedFile[]) => void;
  maxFiles?: number;
  maxSize?: number;
  autoUpload?: boolean;
  accept?: {
    [key: string]: string[];
  };
  onProcessing?: (isProcessing: boolean) => void;
} 