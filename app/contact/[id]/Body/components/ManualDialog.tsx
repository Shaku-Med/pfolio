import React, { useState, useEffect } from 'react';
import { Message } from '../../context/types';

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
  const [editedText, setEditedText] = useState(message.message || '');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEditedText(message.message || '');
      setHasChanges(false);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [message, isOpen]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setEditedText(newText);
    setHasChanges(newText !== (message.message || ''));
  };

  const handleSave = () => {
    onSave(editedText);
    onClose();
  };

  const handleCancel = () => {
    setEditedText(message.message || '');
    setHasChanges(false);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleCancel();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Edit Message</h2>
        </div>
        
        <div className="px-6 py-4">
          <textarea
            value={editedText}
            onChange={handleTextChange}
            className="w-full min-h-[100px] p-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Type your message..."
          />
        </div>
        
        <div className="px-6 py-4 border-t flex justify-end space-x-2">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditMessageDialog;