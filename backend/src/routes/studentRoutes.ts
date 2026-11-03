import { Router } from 'express';
import {
  getStudents,
  getStudentById,
  checkFaceLogin,
  registerStudent,
  enrollInSubject,
  unenrollFromSubject,
} from '../controllers/studentController';

const router = Router();

// GET /api/students - List all students (optional: ?subjectId=...)
router.get('/', getStudents);

// POST /api/students/face-login - Authenticate / check if student exists via face
router.post('/face-login', checkFaceLogin);

// POST /api/students/register - Register a new student with face embedding
router.post('/register', registerStudent);

// POST /api/students/enroll - Enroll a student into a subject by subject code
router.post('/enroll', enrollInSubject);

// POST /api/students/unenroll - Unenroll a student from a subject
router.post('/unenroll', unenrollFromSubject);

// GET /api/students/:id - Get a single student by id with subjects & attendance
router.get('/:id', getStudentById);

export default router;
