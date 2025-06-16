import React, { useRef } from 'react';
import { FileText } from 'lucide-react';
import { UploadedFile } from './types';

interface DocumentProps {
  onUpload: (files: UploadedFile[]) => void;
  maxFiles?: number;
  maxSize?: number;
}

const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

export const DocumentComponent: React.FC<DocumentProps> = ({
  onUpload,
  maxFiles = 5,
  maxSize = 1024 * 1024 * 50 // 50MB
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > maxFiles) {
      alert(`You can only select up to ${maxFiles} files`);
      return;
    }

    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        alert(`File ${file.name} exceeds the size limit of ${maxSize / 1024 / 1024}MB`);
        return false;
      }
      return true;
    });

    const uploadedFiles: UploadedFile[] = validFiles.map(file => ({
      ...file,
      id: generateId(),
      progress: 0,
      status: 'uploading',
      chunks: []
    }));

    onUpload(uploadedFiles);
  };

  return (
    <div 
      className="w-full cursor-pointer hover:bg-accent px-2 py-2 rounded-sm" 
      onClick={handleClick}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4" />
        <span>Document</span>
      </div>
    </div>
  );
}; 