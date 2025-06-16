import React, { useState, useEffect } from 'react';
import { Message } from '../../context/types';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface EditMessageDialogProps {
  message: Message;
  isOpen: boolean;
  onClose: () => void;
  onSave: (editedMessage: string) => void;
}

const EditMessageDialog: React.FC<EditMessageDialogProps> = ({
  message,
  isOpen,
  onClose,
  onSave,
}) => {
  const [editedText, setEditedText] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (isOpen && message) {
      setEditedText(message.message || '');
      setHasChanges(false);
      document.body.style.overflow = 'hidden';
    }

    if (!isOpen) {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, message]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setEditedText(newText);
    setHasChanges(newText !== (message.message || ''));
  };

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasChanges) {
      onSave(editedText);
    }
    onClose();
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/98 backdrop-blur-md bg-opacity-50 p-4"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-card rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col sm:max-w-lg"
        onClick={handleContentClick}
      >
        <div className="px-4 py-3 border-b sm:px-6 sm:py-4">
          <h2 className="text-lg ">Edit Message</h2>
        </div>
        
        <div className="px-4 py-3 flex-1 overflow-hidden sm:px-6 sm:py-4">
          <Textarea
            value={editedText}
            onChange={handleTextChange}
            className="w-full h-32 p-3 border  rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base sm:h-40"
            placeholder="Type your message..."
            autoFocus
          />
        </div>
        
        <div className="px-4 py-3 border-t flex flex-col gap-2 sm:px-6 sm:py-4 sm:flex-row sm:justify-end sm:gap-3">
          <Button
            type="button"
            onClick={handleCancel}
            className="w-full px-4 py-2 bg-gray-100 border   sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={!hasChanges}
            className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600 active:bg-blue-800 sm:w-auto"
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditMessageDialog;