import { Router } from 'express';
import { takeAttendance, getAttendanceRecords } from '../controllers/attendanceController';

const router = Router();

// POST /api/attendance/take - Run face analysis and record attendance in DB
router.post('/take', takeAttendance);

// GET /api/attendance - Fetch attendance records history
router.get('/', getAttendanceRecords);

export default router;

