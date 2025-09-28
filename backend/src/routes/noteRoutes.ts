import { Router } from 'express';
import noteController from '../controllers/noteController';
import { authenticate, requireVerification } from '../middleware/auth';
import { handleValidationErrors } from '../middleware/validation';
import { noteValidation, noteIdValidation } from '../utils/validation';

const router = Router();

// All note routes require authentication and verification
router.use(authenticate, requireVerification);

router.post('/', noteValidation, handleValidationErrors, noteController.createNote);
router.get('/', noteController.getNotes);
router.put('/:id', noteIdValidation, noteValidation, handleValidationErrors, noteController.updateNote);
router.delete('/:id', noteIdValidation, handleValidationErrors, noteController.deleteNote);

export default router;