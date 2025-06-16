'use client'
import React, { useState } from 'react';
import { Message as MessageType } from '../../context/types';
import HlsPlayer from './FileHandler/HlsPlayer';
import AudioPlayer from './FileHandler/AudioPlayer';
import { File, Clock, HardDrive } from 'lucide-react';
import NonHls from './FileHandler/NoNHls/NonHls';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { format } from 'date-fns';
import FileBodyPreview from './FileHandler/Preview/FileBodyPreview';

interface HandleFileShowProps {
  message?: MessageType;
  isManual?: boolean;
}

const HandleFileShow: React.FC<HandleFileShowProps> = ({ message, isManual }) => {
  const fileType = message?.file_object?.type;
  const isVideo = fileType?.startsWith('video/');
  const isAudio = fileType?.startsWith('audio/');
  const isImage = fileType?.startsWith('image/');
  const isMediaFile = isVideo || isAudio;
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [current, setCurrent] = useState<MessageType | null>(null);

  if (!fileType) return null;

  const FileIcon = () => {
    const formatFileSize = (bytes?: number) => {
      if (!bytes) return 'Unknown size';
      const units = ['B', 'KB', 'MB', 'GB'];
      let size = bytes;
      let unitIndex = 0;
      while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
      }
      return `${size.toFixed(1)} ${units[unitIndex]}`;
    };

    const formatDate = (dateString?: string) => {
      if (!dateString) return 'Unknown date';
      try {
        return new Date(dateString).toDateString()
      } catch {
        return 'Invalid date';
      }
    };

    return (
      <div className=" relative flex flex-col items-center justify-center gap-3 px-6 py-12 aspect-square border bg-card text-white shadow-lg rounded-lg overflow-hidden">
        <div className="flex-shrink-0 p-3 ">
          <File className="w-8 h-8" />
        </div>
        <div className="text-center space-y-3 w-full">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="text-sm font-medium line-clamp-1 ">
                  {message?.file_object?.customName.slice(0, 10)}...
                </p>
              </TooltipTrigger>
              <TooltipContent className="p-3 space-y-2">
                <div className="space-y-1">
                  <p className="font-medium">{message?.file_object?.customName}</p>
                  <p className="text-xs text-muted-foreground">Original name: {message?.file_object?.name}</p>
                  <p className="text-xs text-muted-foreground">Size: {formatFileSize(message?.file_object?.size)}</p>
                  <p className="text-xs text-muted-foreground">Posted: {formatDate(message?.created_at)}</p>
                  <p className="text-xs text-muted-foreground">Last modified: {formatDate(message?.file_object?.lastModified)}</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <div className="space-y-2 px-2">
            <div className="flex items-center justify-center gap-2 text-xs ">
              <HardDrive className="w-3 h-3" />
              <p>{formatFileSize(message?.file_object?.size)}</p>
            </div>
            
            <div className="flex items-center justify-center gap-2 text-xs ">
              <Clock className="w-3 h-3" />
              <p className="text-[10px]">{formatDate(message?.created_at)}</p>
            </div>
          </div>
          
          <div className="pt-1 border-t ">
            <p className="text-xs font-medium ">
              {fileType?.split('/')[1]?.toUpperCase() || 'FILE'}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div onClick={e => {
        e.stopPropagation()
        setCurrent(message)
        setIsOpen(true)
      }}>
         {
            isImage ? <NonHls message={message}/> : isMediaFile ? <FileIcon/> : <FileIcon/>
         }
      </div>
       {
        isOpen && <FileBodyPreview isOpen={isOpen} setIsOpen={setIsOpen} message={current}/>
       }
    </>
  )
};

export default HandleFileShow;