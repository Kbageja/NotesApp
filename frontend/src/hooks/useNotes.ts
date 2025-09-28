import { useState, useCallback } from 'react';
import apiService from '../services/api';
import toast from 'react-hot-toast';
import type{ Note } from '../types';

interface UseNotesReturn {
  notes: Note[] | null;
  isLoading: boolean;
  error: string | null;
  createNote: (data: { title: string; content: string }) => Promise<void>;
  updateNote: (id: string, data: { title: string; content: string }) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export const useNotes = (): UseNotesReturn => {
  const [notes, setNotes] = useState<Note[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotes = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.getNotes();
      if (response.success && response.data) {
        setNotes(response.data.notes || []);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch notes';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createNote = useCallback(async (data: { title: string; content: string }) => {
    try {
      const response = await apiService.createNote(data);
      if (response.success) {
        toast.success('Note created successfully!');
        await fetchNotes(); // Refresh notes list
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to create note';
      toast.error(message);
      throw error;
    }
  }, [fetchNotes]);

  const updateNote = useCallback(async (id: string, data: { title: string; content: string }) => {
    try {
      const response = await apiService.updateNote(id, data);
      if (response.success) {
        toast.success('Note updated successfully!');
        await fetchNotes(); // Refresh notes list
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update note';
      toast.error(message);
      throw error;
    }
  }, [fetchNotes]);

  const deleteNote = useCallback(async (id: string) => {
    try {
      const response = await apiService.deleteNote(id);
      if (response.success) {
        toast.success('Note deleted successfully!');
        await fetchNotes(); // Refresh notes list
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to delete note';
      toast.error(message);
      throw error;
    }
  }, [fetchNotes]);

  return {
    notes,
    isLoading,
    error,
    createNote,
    updateNote,
    deleteNote,
    refetch: fetchNotes,
  };
};