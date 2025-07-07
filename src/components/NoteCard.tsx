import React from 'react';
import { format } from 'date-fns';
import { Edit2, Trash2, Pin, PinOff, Tag } from 'lucide-react';

interface Note {
  _id: string;
  title: string;
  content: string;
  tags: string[];
  isPinned: boolean;
  color: string;
  createdAt: string;
  updatedAt: string;
}

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (noteId: string) => void;
  onPin: (noteId: string, isPinned: boolean) => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({
  note,
  onEdit,
  onDelete,
  onPin
}) => {
  const handlePinToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPin(note._id, !note.isPinned);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(note);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this note?')) {
      onDelete(note._id);
    }
  };

  const truncateContent = (content: string, maxLength: number) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  // Get a subtle background color based on the selected color
  const getCardBackground = (color: string) => {
    const colorMap: { [key: string]: string } = {
      '#FFFFFF': 'bg-white dark:bg-gray-800',
      '#FEF3C7': 'bg-yellow-50 dark:bg-yellow-900/20',
      '#DBEAFE': 'bg-blue-50 dark:bg-blue-900/20',
      '#D1FAE5': 'bg-green-50 dark:bg-green-900/20',
      '#FCE7F3': 'bg-pink-50 dark:bg-pink-900/20',
      '#E0E7FF': 'bg-indigo-50 dark:bg-indigo-900/20',
      '#FED7D7': 'bg-red-50 dark:bg-red-900/20',
      '#F3E8FF': 'bg-purple-50 dark:bg-purple-900/20',
      '#F0F9FF': 'bg-sky-50 dark:bg-sky-900/20',
      '#ECFDF5': 'bg-emerald-50 dark:bg-emerald-900/20',
      '#FDF2F8': 'bg-rose-50 dark:bg-rose-900/20',
      '#F5F3FF': 'bg-violet-50 dark:bg-violet-900/20'
    };
    
    return colorMap[color] || 'bg-white dark:bg-gray-800';
  };

  // Get border color based on the selected color
  const getBorderColor = (color: string) => {
    const colorMap: { [key: string]: string } = {
      '#FFFFFF': 'border-gray-200 dark:border-gray-700',
      '#FEF3C7': 'border-yellow-200 dark:border-yellow-800',
      '#DBEAFE': 'border-blue-200 dark:border-blue-800',
      '#D1FAE5': 'border-green-200 dark:border-green-800',
      '#FCE7F3': 'border-pink-200 dark:border-pink-800',
      '#E0E7FF': 'border-indigo-200 dark:border-indigo-800',
      '#FED7D7': 'border-red-200 dark:border-red-800',
      '#F3E8FF': 'border-purple-200 dark:border-purple-800',
      '#F0F9FF': 'border-sky-200 dark:border-sky-800',
      '#ECFDF5': 'border-emerald-200 dark:border-emerald-800',
      '#FDF2F8': 'border-rose-200 dark:border-rose-800',
      '#F5F3FF': 'border-violet-200 dark:border-violet-800'
    };
    
    return colorMap[color] || 'border-gray-200 dark:border-gray-700';
  };

  return (
    <div
      className={`${getCardBackground(note.color)} rounded-xl p-5 shadow-sm border ${getBorderColor(note.color)} hover:shadow-md transition-all duration-200 cursor-pointer group relative overflow-hidden`}
      onClick={handleEdit}
    >
      {/* Pinned indicator */}
      {note.isPinned && (
        <div className="absolute top-0 right-0 w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] border-t-orange-400">
          <Pin className="absolute -top-4 -right-3 w-3 h-3 text-white transform rotate-45" />
        </div>
      )}

      {/* Header with title and actions */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-gray-900 dark:text-white text-lg leading-tight line-clamp-2 pr-2">
          {note.title}
        </h3>
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0">
          <button
            onClick={handlePinToggle}
            className={`p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
              note.isPinned 
                ? 'text-orange-600 dark:text-orange-400' 
                : 'text-gray-400 hover:text-orange-600 dark:hover:text-orange-400'
            }`}
            title={note.isPinned ? 'Unpin note' : 'Pin note'}
          >
            {note.isPinned ? (
              <Pin className="w-4 h-4" />
            ) : (
              <PinOff className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={handleEdit}
            className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Edit note"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Delete note"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div className="mb-4">
        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed line-clamp-4">
          {truncateContent(note.content, 200)}
        </p>
      </div>
      
      {/* Tags */}
      {note.tags && note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {note.tags.slice(0, 3).map(tag => (
            <span
              key={tag}
              className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
            >
              <Tag className="w-3 h-3 mr-1" />
              {tag}
            </span>
          ))}
          {note.tags.length > 3 && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 border border-gray-200 dark:border-gray-600">
              +{note.tags.length - 3} more
            </span>
          )}
        </div>
      )}
      
      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-200 dark:border-gray-700">
        <span className="flex items-center">
          <span className="font-medium">
            {format(new Date(note.updatedAt), 'MMM d, yyyy')}
          </span>
          <span className="mx-1">•</span>
          <span>
            {format(new Date(note.updatedAt), 'h:mm a')}
          </span>
        </span>
        
        {note.isPinned && (
          <span className="inline-flex items-center px-2 py-1 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
            <Pin className="w-3 h-3 mr-1" />
            Pinned
          </span>
        )}
      </div>

      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-transparent group-hover:from-white/5 group-hover:to-transparent pointer-events-none transition-all duration-200"></div>
    </div>
  );
};