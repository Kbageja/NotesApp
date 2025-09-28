import React, { useState, useEffect } from 'react';
import type { Note } from '../../types';
import { Button } from '../ui/Button';
import Input from "../ui/Input"
import { X } from 'lucide-react';

interface CreateNoteModalProps {
  note?: Note; // If provided, it's edit mode
  onClose: () => void;
  onSave: (title: string, content: string) => Promise<void>;
}

const CreateNoteModal: React.FC<CreateNoteModalProps> = ({ note, onClose, onSave }) => {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditMode = !!note;

  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    } else if (title.trim().length > 200) {
      newErrors.title = 'Title must be less than 200 characters';
    }

    if (!content.trim()) {
      newErrors.content = 'Content is required';
    } else if (content.trim().length < 10) {
      newErrors.content = 'Content must be at least 10 characters';
    } else if (content.trim().length > 5000) {
      newErrors.content = 'Content must be less than 5000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      await onSave(title.trim(), content.trim());
    } catch (error) {
      // Error is handled in parent component
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSave();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditMode ? 'Edit Note' : 'Create New Note'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-160px)]">
          <Input
            label="Note Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter note title..."
            error={errors.title}
            className="text-lg"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your note content here..."
              rows={12}
              className={`
                w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors duration-200
                resize-vertical
                ${errors.content ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}
              `}
            />
            {errors.content && (
              <p className="mt-2 text-sm text-red-600">{errors.content}</p>
            )}
            <div className="mt-1 text-xs text-gray-500 text-right">
              {content.length}/5000 characters
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <Button
            onClick={onClose}
            variant="outline"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!title.trim() || !content.trim()}
          >
            {isEditMode ? 'Update Note' : 'Create Note'}
          </Button>
        </div>

        {/* Keyboard shortcuts hint */}
        <div className="px-6 pb-4 text-xs text-gray-500">
          <span>Press Ctrl/Cmd + Enter to save, Esc to cancel</span>
        </div>
      </div>
    </div>
  );
};

export default CreateNoteModal;