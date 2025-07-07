import React, { useState, useEffect } from 'react';
import { X, Tag, Palette, Pin } from 'lucide-react';

interface Note {
  _id: string;
  title: string;
  content: string;
  tags: string[];
  isPinned: boolean;
  color: string;
}

interface NoteFormProps {
  note?: Note | null;
  onSave: (note: Omit<Note, '_id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

const colorOptions = [
  { value: '#FFFFFF', name: 'White', class: 'bg-white border-gray-300' },
  { value: '#FEF3C7', name: 'Yellow', class: 'bg-yellow-100 border-yellow-300' },
  { value: '#DBEAFE', name: 'Blue', class: 'bg-blue-100 border-blue-300' },
  { value: '#D1FAE5', name: 'Green', class: 'bg-green-100 border-green-300' },
  { value: '#FCE7F3', name: 'Pink', class: 'bg-pink-100 border-pink-300' },
  { value: '#E0E7FF', name: 'Indigo', class: 'bg-indigo-100 border-indigo-300' },
  { value: '#FED7D7', name: 'Red', class: 'bg-red-100 border-red-300' },
  { value: '#F3E8FF', name: 'Purple', class: 'bg-purple-100 border-purple-300' },
  { value: '#F0F9FF', name: 'Sky', class: 'bg-sky-100 border-sky-300' },
  { value: '#ECFDF5', name: 'Emerald', class: 'bg-emerald-100 border-emerald-300' },
  { value: '#FDF2F8', name: 'Rose', class: 'bg-rose-100 border-rose-300' },
  { value: '#F5F3FF', name: 'Violet', class: 'bg-violet-100 border-violet-300' }
];

export const NoteForm: React.FC<NoteFormProps> = ({ note, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: [] as string[],
    isPinned: false,
    color: '#FFFFFF'
  });
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (note) {
      setFormData({
        title: note.title,
        content: note.content,
        tags: note.tags || [],
        isPinned: note.isPinned,
        color: note.color
      });
    }
  }, [note]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      return;
    }
    onSave(formData);
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const selectedColorOption = colorOptions.find(option => option.value === formData.color);

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {note ? 'Edit Note' : 'Create New Note'}
          </h3>
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title
            </label>
            <input
              type="text"
              id="title"
              required
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
              placeholder="Enter note title"
            />
          </div>

          {/* Content */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Content
            </label>
            <textarea
              id="content"
              rows={8}
              required
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors resize-none"
              placeholder="Write your note content here..."
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tags
            </label>
            <div className="flex space-x-2 mb-3">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                placeholder="Add a tag"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
              >
                <Tag className="w-4 h-4" />
              </button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              <Palette className="w-4 h-4 inline mr-2" />
              Note Color
            </label>
            <div className="grid grid-cols-6 gap-3">
              {colorOptions.map(color => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                  className={`relative w-12 h-12 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${color.class} ${
                    formData.color === color.value 
                      ? 'ring-2 ring-orange-500 ring-offset-2 dark:ring-offset-gray-800' 
                      : 'hover:ring-2 hover:ring-gray-300 hover:ring-offset-2 dark:hover:ring-offset-gray-800'
                  }`}
                  title={color.name}
                >
                  {formData.color === color.value && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    </div>
                  )}
                </button>
              ))}
            </div>
            {selectedColorOption && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Selected: {selectedColorOption.name}
              </p>
            )}
          </div>

          {/* Pin Option */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPinned"
              checked={formData.isPinned}
              onChange={(e) => setFormData(prev => ({ ...prev, isPinned: e.target.checked }))}
              className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
            />
            <label htmlFor="isPinned" className="ml-3 flex items-center text-sm text-gray-900 dark:text-white">
              <Pin className="w-4 h-4 mr-1" />
              Pin this note
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
            >
              {note ? 'Update Note' : 'Create Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};