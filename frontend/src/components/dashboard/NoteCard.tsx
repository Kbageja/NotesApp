import React, { useState } from 'react';
import type { Note } from '../../types';
import Card from '../ui/Card';
import { Button } from '../ui/Button';
import { Edit2, Trash2, Calendar } from 'lucide-react';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: () => void;
}

const NoteCard: React.FC<NoteCardProps> = ({ note, onEdit, onDelete }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDelete();
      setShowDeleteConfirm(false);
    } else {
      setShowDeleteConfirm(true);
      setTimeout(() => setShowDeleteConfirm(false), 3000); // Auto-hide after 3 seconds
    }
  };

  const formatDate = (dateInput: string | Date) => {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.slice(0, maxLength) + '...';
  };

  return (
    <Card className="group hover:shadow-md transition-shadow duration-200">
      <div className="flex flex-col h-full">
        {/* Note Header */}
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1 mr-2">
            {note.title}
          </h3>
          <div className="flex items-center space-x-1 opacity-100  transition-opacity duration-200">
            <Button
              onClick={() => onEdit(note)}
              variant="outline"
              size="sm"
              className="p-2 h-8 w-8"
            >
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button
              onClick={handleDelete}
              size="sm"
              className={`p-2 h-8 w-8 ${
                showDeleteConfirm
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'text-red-600 hover:text-red-700 hover:bg-red-50'
              }`}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Note Content */}
        <div className="flex-1 mb-4">
          <p className="text-gray-600 text-sm leading-relaxed">
            {truncateContent(note.content)}
          </p>
        </div>

        {/* Note Footer */}
        <div className="flex items-center text-xs text-gray-500 pt-3 border-t border-gray-100">
          <Calendar className="w-3 h-3 mr-1" />
          <span>
            {formatDate(note.updatedAt || note.createdAt)}
          </span>
        </div>

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-center">
            <p className="text-xs text-red-600 mb-1">
              Click delete again to confirm
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default NoteCard;