import { Router } from 'express';
import { registerTeacher, loginTeacher } from '../controllers/authController';

const router = Router();

// POST /api/auth/teacher/register
router.post('/teacher/register', registerTeacher);

// POST /api/auth/teacher/login
router.post('/teacher/login', loginTeacher);

export default router;
