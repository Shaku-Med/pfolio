import React, { useRef } from 'react';
import { Camera } from 'lucide-react';
import { UploadedFile } from './types';

interface CameraProps {
  onCapture: (file: UploadedFile) => void;
}

const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

export const CameraComponent: React.FC<CameraProps> = ({ onCapture }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const uploadedFile: UploadedFile = {
        ...file,
        id: generateId(),
        progress: 0,
        status: 'uploading',
        chunks: []
      };
      onCapture(uploadedFile);
    }
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
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />
      <div className="flex items-center gap-2">
        <Camera className="h-4 w-4" />
        <span>Camera</span>
      </div>
    </div>
  );
}; 