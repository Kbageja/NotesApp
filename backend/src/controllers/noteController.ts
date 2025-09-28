import { Request, Response } from 'express';
import noteService from '../services/noteService';
import { sendSuccessResponse, sendErrorResponse } from '../utils/response';
import { AuthRequest } from '../middleware/auth';

export class NoteController {
  async createNote(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { title, content } = req.body;
      const userId = req.user!.id;

      const result = await noteService.createNote(userId, title, content);

      if (!result.success) {
        sendErrorResponse(res, 400, result.message);
        return;
      }

      sendSuccessResponse(res, 201, result.message, { note: result.note });
    } catch (error) {
      console.error('Create Note Controller Error:', error);
      sendErrorResponse(res, 500, 'Internal server error');
    }
  }

  async getNotes(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await noteService.getUserNotes(userId, page, limit);

      if (!result.success) {
        sendErrorResponse(res, 400, result.message);
        return;
      }

      sendSuccessResponse(res, 200, result.message, {
        notes: result.notes,
        pagination: {
          total: result.total,
          page,
          limit,
          totalPages: Math.ceil(result.total! / limit)
        }
      });
    } catch (error) {
      console.error('Get Notes Controller Error:', error);
      sendErrorResponse(res, 500, 'Internal server error');
    }
  }

  async updateNote(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { title, content } = req.body;
      const userId = req.user!.id;

      const result = await noteService.updateNote(userId, id, title, content);

      if (!result.success) {
        sendErrorResponse(res, 400, result.message);
        return;
      }

      sendSuccessResponse(res, 200, result.message, { note: result.note });
    } catch (error) {
      console.error('Update Note Controller Error:', error);
      sendErrorResponse(res, 500, 'Internal server error');
    }
  }

  async deleteNote(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const result = await noteService.deleteNote(userId, id);

      if (!result.success) {
        sendErrorResponse(res, 400, result.message);
        return;
      }

      sendSuccessResponse(res, 200, result.message);
    } catch (error) {
      console.error('Delete Note Controller Error:', error);
      sendErrorResponse(res, 500, 'Internal server error');
    }
  }
}

export default new NoteController();