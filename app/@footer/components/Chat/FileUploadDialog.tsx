import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FileUpload } from '@/app/@footer/components/Chat/Component/FileUpload';
import type { UploadedFile } from '@/app/@footer/components/Chat/Component/types';
import { useDeviceStatus } from '@/app/hooks/useDeviceStatus';

interface FileUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFilesChange: (files: UploadedFile[]) => void;
}

export function FileUploadDialog({ open, onOpenChange, onFilesChange }: FileUploadDialogProps) {
  const { isMobileInstalledPortrait } = useDeviceStatus();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] z-[10000000000001] overflow-auto max-h-[85%]">
        <DialogHeader>
          <DialogTitle>Upload Files</DialogTitle>
        </DialogHeader>
        <FileUpload
          onFilesChange={onFilesChange}
          maxFiles={15}
          maxSize={1024 * 1024 * 1024}
          autoUpload={true}
        />
      </DialogContent>
    </Dialog>
  );
} 