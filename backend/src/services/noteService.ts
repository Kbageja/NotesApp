import Note, { INote } from '../models/Note';
import mongoose from 'mongoose';

export class NoteService {
  async createNote(userId: string, title: string, content: string): Promise<{ success: boolean; message: string; note?: any }> {
    try {
      const note = new Note({
        title,
        content,
        user: new mongoose.Types.ObjectId(userId)
      });

      await note.save();

      return {
        success: true,
        message: 'Note created successfully',
        note: {
          id: note._id,
          title: note.title,
          content: note.content,
          createdAt: note.createdAt,
          updatedAt: note.updatedAt
        }
      };
    } catch (error: any) {
      console.error('Create Note Error:', error);
      return { success: false, message: 'Failed to create note' };
    }
  }

  async getUserNotes(userId: string, page: number = 1, limit: number = 10): Promise<{ success: boolean; message: string; notes?: any[]; total?: number }> {
    try {
      const skip = (page - 1) * limit;
      
      const [notes, total] = await Promise.all([
        Note.find({ user: new mongoose.Types.ObjectId(userId) })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Note.countDocuments({ user: new mongoose.Types.ObjectId(userId) })
      ]);

      const formattedNotes = notes.map(note => ({
        id: note._id,
        title: note.title,
        content: note.content,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt
      }));

      return {
        success: true,
        message: 'Notes retrieved successfully',
        notes: formattedNotes,
        total
      };
    } catch (error: any) {
      console.error('Get Notes Error:', error);
      return { success: false, message: 'Failed to retrieve notes' };
    }
  }

  async updateNote(userId: string, noteId: string, title: string, content: string): Promise<{ success: boolean; message: string; note?: any }> {
    try {
      const note = await Note.findOneAndUpdate(
        { _id: noteId, user: new mongoose.Types.ObjectId(userId) },
        { title, content },
        { new: true, runValidators: true }
      );

      if (!note) {
        return { success: false, message: 'Note not found' };
      }

      return {
        success: true,
        message: 'Note updated successfully',
        note: {
          id: note._id,
          title: note.title,
          content: note.content,
          createdAt: note.createdAt,
          updatedAt: note.updatedAt
        }
      };
    } catch (error: any) {
      console.error('Update Note Error:', error);
      return { success: false, message: 'Failed to update note' };
    }
  }

  async deleteNote(userId: string, noteId: string): Promise<{ success: boolean; message: string }> {
    try {
      const note = await Note.findOneAndDelete({
        _id: noteId,
        user: new mongoose.Types.ObjectId(userId)
      });

      if (!note) {
        return { success: false, message: 'Note not found' };
      }

      return {
        success: true,
        message: 'Note deleted successfully'
      };
    } catch (error: any) {
      console.error('Delete Note Error:', error);
      return { success: false, message: 'Failed to delete note' };
    }
  }
}

export default new NoteService();