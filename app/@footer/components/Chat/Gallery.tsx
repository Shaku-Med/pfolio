import React, { useRef } from 'react';
import { Image } from 'lucide-react';
import { UploadedFile } from './types';

interface GalleryProps {
  onSelect: (files: UploadedFile[]) => void;
  maxFiles?: number;
}

const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

export const GalleryComponent: React.FC<GalleryProps> = ({ onSelect, maxFiles = 10 }) => {
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

    const validFiles = files.filter(file => file.type.startsWith('image/'));
    const uploadedFiles: UploadedFile[] = validFiles.map(file => ({
      ...file,
      id: generateId(),
      progress: 0,
      status: 'uploading',
      chunks: []
    }));

    onSelect(uploadedFiles);
  };

  return (
    <div 
      className="w-full cursor-pointer hover:bg-accent px-2 py-2 rounded-sm" 
      onClick={handleClick}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />
      <div className="flex items-center gap-2">
        <Image className="h-4 w-4" />
        <span>Gallery</span>
      </div>
    </div>
  );
}; 