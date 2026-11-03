import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/db';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-please-change';

/**
 * Helper to extract teacherId from the Authorization Bearer JWT token if available
 */
function extractTeacherIdFromToken(req: Request): number | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { id?: number; role?: string };
    return decoded.id ? Number(decoded.id) : null;
  } catch {
    return null;
  }
}

/**
 * POST /api/subjects
 * Creates a new subject linked to the authenticated teacher in the database.
 */
export const createSubject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, subjectCode, code, section, teacherId } = req.body;

    const finalCode = (subjectCode || code || '').trim().toUpperCase();
    const finalName = (name || '').trim();
    const finalSection = (section || 'A').trim();

    if (!finalName || !finalCode) {
      res.status(400).json({ error: 'Subject name and subject code are required.' });
      return;
    }

    // Determine teacherId from request body or JWT token
    const tokenTeacherId = extractTeacherIdFromToken(req);
    const finalTeacherId = teacherId ? Number(teacherId) : tokenTeacherId;

    const newSubject = await prisma.subject.create({
      data: {
        name: finalName,
        subjectCode: finalCode,
        section: finalSection,
        teacherId: finalTeacherId,
      },
      include: {
        _count: {
          select: {
            students: true,
            attendanceLogs: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      subject: {
        id: newSubject.id,
        name: newSubject.name,
        code: newSubject.subjectCode,
        subjectCode: newSubject.subjectCode,
        section: newSubject.section,
        teacherId: newSubject.teacherId,
        students: newSubject._count.students,
        classes: newSubject._count.attendanceLogs,
      },
      message: 'Subject created successfully in database.',
    });
  } catch (error) {
    console.error('Error creating subject:', error);
    res.status(500).json({ error: 'Internal server error while creating subject.' });
  }
};

/**
 * GET /api/subjects
 * Fetches subjects. If teacherId is passed or found in token, returns that teacher's subjects.
 */
export const getSubjects = async (req: Request, res: Response): Promise<void> => {
  try {
    const queryTeacherId = req.query.teacherId ? Number(req.query.teacherId) : null;
    const tokenTeacherId = extractTeacherIdFromToken(req);
    const targetTeacherId = queryTeacherId || tokenTeacherId;

    let whereClause = {};
    if (targetTeacherId) {
      whereClause = {
        teacherId: targetTeacherId,
      };
    }

    const subjects = await prisma.subject.findMany({
      where: whereClause,
      orderBy: {
        id: 'desc',
      },
      include: {
        _count: {
          select: {
            students: true,
            attendanceLogs: true,
          },
        },
      },
    });

    const formatted = subjects.map((s) => ({
      id: s.id,
      name: s.name,
      code: s.subjectCode,
      subjectCode: s.subjectCode,
      section: s.section,
      teacherId: s.teacherId,
      students: s._count.students,
      classes: s._count.attendanceLogs,
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ error: 'Internal server error while fetching subjects.' });
  }
};

/**
 * DELETE /api/subjects/:id
 * Deletes a subject by ID.
 */
export const deleteSubject = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid subject ID.' });
      return;
    }

    await prisma.subject.delete({
      where: { id },
    });

    res.json({ success: true, message: 'Subject deleted successfully.' });
  } catch (error) {
    console.error('Error deleting subject:', error);
    res.status(500).json({ error: 'Internal server error while deleting subject.' });
  }
};

