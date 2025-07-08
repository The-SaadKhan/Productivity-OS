import React, { useState, useEffect } from 'react';
import { notesAPI } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { NoteCard } from '../components/NoteCard';
import { NoteForm } from '../components/NoteForm';
import { Plus, Search, StickyNote } from 'lucide-react';
import toast from 'react-hot-toast';

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

export const NotesPage: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  useEffect(() => {
    fetchNotes();
    fetchTags();
  }, [searchTerm, selectedTag]);

  const fetchNotes = async () => {
    try {
      setIsLoading(true);
      const params: any = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedTag) params.tag = selectedTag;
      
      const response = await notesAPI.getNotes(params);
      setNotes(response.data.notes);
    } catch (error) {
      toast.error('Failed to fetch notes');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await notesAPI.getTags();
      setAvailableTags(response.data.tags);
    } catch (error) {
      console.error('Failed to fetch tags:', error);
    }
  };

  const handleCreateNote = async (noteData: Omit<Note, '_id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await notesAPI.createNote(noteData);
      toast.success('Note created successfully');
      setShowForm(false);
      fetchNotes();
      fetchTags();
    } catch (error) {
      toast.error('Failed to create note');
    }
  };

  const handleUpdateNote = async (noteId: string, noteData: Partial<Note>) => {
    try {
      await notesAPI.updateNote(noteId, noteData);
      toast.success('Note updated successfully');
      setEditingNote(null);
      fetchNotes();
      fetchTags();
    } catch (error) {
      toast.error('Failed to update note');
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await notesAPI.deleteNote(noteId);
      toast.success('Note deleted successfully');
      fetchNotes();
      fetchTags();
    } catch (error) {
      toast.error('Failed to delete note');
    }
  };

  const handlePinNote = async (noteId: string, isPinned: boolean) => {
    try {
      await notesAPI.updateNote(noteId, { isPinned });
      fetchNotes();
    } catch (error) {
      toast.error('Failed to update note');
    }
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = !searchTerm || 
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTag = !selectedTag || note.tags.includes(selectedTag);
    
    return matchesSearch && matchesTag;
  });

  const pinnedNotes = filteredNotes.filter(note => note.isPinned);
  const unpinnedNotes = filteredNotes.filter(note => !note.isPinned);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Notes
        </h1>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-3 sm:px-4 py-2 border border-transparent text-xs sm:text-sm font-medium rounded-lg text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">New Note</span>
          <span className="sm:hidden">New</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 sm:top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
          />
        </div>
        
        <select
          value={selectedTag}
          onChange={(e) => setSelectedTag(e.target.value)}
          className="px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
        >
          <option value="">All Tags</option>
          {availableTags.map(tag => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>
      </div>

      {/* Notes Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="large" />
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="text-center py-12">
          <StickyNote className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            No notes found
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Get started by creating your first note.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Pinned Notes */}
          {pinnedNotes.length > 0 && (
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                Pinned Notes
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {pinnedNotes.map(note => (
                  <NoteCard
                    key={note._id}
                    note={note}
                    onEdit={setEditingNote}
                    onDelete={handleDeleteNote}
                    onPin={handlePinNote}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Other Notes */}
          {unpinnedNotes.length > 0 && (
            <div>
              {pinnedNotes.length > 0 && (
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                  Other Notes
                </h2>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {unpinnedNotes.map(note => (
                  <NoteCard
                    key={note._id}
                    note={note}
                    onEdit={setEditingNote}
                    onDelete={handleDeleteNote}
                    onPin={handlePinNote}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Note Form Modal */}
      {(showForm || editingNote) && (
        <NoteForm
          note={editingNote}
          onSave={editingNote ? 
            (noteData) => handleUpdateNote(editingNote._id, noteData) : 
            handleCreateNote
          }
          onCancel={() => {
            setShowForm(false);
            setEditingNote(null);
          }}
        />
      )}
    </div>
  );
};