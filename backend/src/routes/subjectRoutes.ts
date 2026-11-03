import { Router } from 'express';
import {
  createSubject,
  getSubjects,
  deleteSubject,
} from '../controllers/subjectController';

const router = Router();

// GET /api/subjects - List subjects (optional ?teacherId=...)
router.get('/', getSubjects);

// POST /api/subjects - Create a new subject
router.post('/', createSubject);

// DELETE /api/subjects/:id - Delete a subject
router.delete('/:id', deleteSubject);

export default router;

