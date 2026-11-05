import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/db';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-please-change';
const getMlServiceUrl = (): string =>
  (process.env.ML_SERVICE_URL || 'http://localhost:8000').trim().replace(/\/+$/, '');

/**
 * Helper to extract studentId from the Authorization Bearer JWT token if available
 */
function extractStudentIdFromToken(req: Request): number | null {
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
 * Safely parses faceEmbedding whether stored as a JSON array or stringified JSON
 */
function parseEmbedding(raw: any): number[] | null {
  if (!raw) return null;
  if (Array.isArray(raw)) {
    const arr = raw.map(Number);
    return arr.length === 128 ? arr : null;
  }
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const arr = parsed.map(Number);
        return arr.length === 128 ? arr : null;
      }
    } catch {}
  }
  return null;
}

/**
 * Computes Euclidean distance between two 128-d vectors
 */
function euclideanDistance(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < 128; i++) {
    const diff = a[i] - b[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

/**
 * GET /api/students
 * Optional query: ?subjectId=123
 * Returns all students with embeddings for ML pipeline synchronization.
 */
export const getStudents = async (req: Request, res: Response): Promise<void> => {
  try {
    const { subjectId } = req.query;

    let whereClause = {};
    if (subjectId) {
      whereClause = {
        subjects: {
          some: {
            subjectId: Number(subjectId),
          },
        },
      };
    }

    const students = await prisma.student.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        faceEmbedding: true,
        voiceEmbedding: true,
      },
      orderBy: {
        id: 'asc',
      },
    });

    const formattedStudents = students.map((s) => ({
      id: s.id,
      student_id: s.id,
      name: s.name,
      face_embedding: s.faceEmbedding,
      faceEmbedding: s.faceEmbedding,
      voice_embedding: s.voiceEmbedding,
      voiceEmbedding: s.voiceEmbedding,
    }));

    res.json(formattedStudents);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Internal server error while fetching students' });
  }
};

/**
 * GET /api/students/:id
 * Fetches a single student with their enrolled subjects (including total classes & present count)
 * and recent attendance logs.
 */
export const getStudentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid student ID' });
      return;
    }

    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        subjects: {
          include: {
            subject: {
              include: {
                teacher: {
                  select: { name: true },
                },
                _count: {
                  select: {
                    students: true,
                    attendanceLogs: true,
                  },
                },
              },
            },
          },
        },
        attendanceLogs: {
          take: 30,
          orderBy: {
            timestamp: 'desc',
          },
          include: {
            subject: true,
          },
        },
      },
    });

    if (!student) {
      res.status(404).json({ error: 'Student not found' });
      return;
    }

    // Enrich subjects with individual student attendance stats
    const enrichedSubjects = await Promise.all(
      student.subjects.map(async (item) => {
        const sub = item.subject;
        const presentCount = await prisma.attendanceLog.count({
          where: {
            subjectId: sub.id,
            studentId: student.id,
            isPresent: true,
          },
        });

        const totalClasses = sub._count.attendanceLogs;
        const attendanceRate =
          totalClasses > 0 ? Math.round((presentCount / totalClasses) * 100) : 100;

        return {
          id: sub.id,
          name: sub.name,
          code: sub.subjectCode,
          subjectCode: sub.subjectCode,
          section: sub.section,
          teacherName: sub.teacher?.name || 'Instructor',
          students: sub._count.students,
          classes: totalClasses,
          presentClasses: presentCount,
          attendanceRate,
        };
      })
    );

    res.json({
      id: student.id,
      student_id: student.id,
      name: student.name,
      face_embedding: student.faceEmbedding,
      faceEmbedding: student.faceEmbedding,
      subjects: enrichedSubjects,
      attendanceLogs: student.attendanceLogs,
    });
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ error: 'Internal server error while fetching student' });
  }
};

/**
 * POST /api/students/enroll
 * Enrolls a student in a subject using its subject code (e.g. CS-401).
 */
export const enrollInSubject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId, subjectCode, code } = req.body;
    const finalCode = (subjectCode || code || '').trim().toUpperCase();

    if (!finalCode) {
      res.status(400).json({ error: 'Subject code is required to enroll.' });
      return;
    }

    // Derive studentId from request body or JWT token
    const tokenStudentId = extractStudentIdFromToken(req);
    const targetStudentId = studentId ? Number(studentId) : tokenStudentId;

    if (!targetStudentId) {
      res.status(401).json({ error: 'Authentication required: student ID could not be identified.' });
      return;
    }

    // Find student
    const student = await prisma.student.findUnique({
      where: { id: targetStudentId },
    });
    if (!student) {
      res.status(404).json({ error: 'Student record not found.' });
      return;
    }

    // Find subject by code
    const subject = await prisma.subject.findFirst({
      where: {
        subjectCode: {
          equals: finalCode,
          mode: 'insensitive',
        },
      },
      include: {
        teacher: {
          select: { name: true },
        },
        _count: {
          select: { students: true, attendanceLogs: true },
        },
      },
    });

    if (!subject) {
      res.status(404).json({
        error: `No subject found with code "${finalCode}". Please double check the code with your teacher.`,
      });
      return;
    }

    // Check if student is already enrolled
    const existingEnrollment = await prisma.subjectStudent.findUnique({
      where: {
        subjectId_studentId: {
          subjectId: subject.id,
          studentId: targetStudentId,
        },
      },
    });

    if (existingEnrollment) {
      res.status(200).json({
        success: true,
        alreadyEnrolled: true,
        message: `You are already enrolled in ${subject.name} (${subject.subjectCode}).`,
        subject: {
          id: subject.id,
          name: subject.name,
          code: subject.subjectCode,
          subjectCode: subject.subjectCode,
          section: subject.section,
          teacherName: subject.teacher?.name || 'Instructor',
          students: subject._count.students,
          classes: subject._count.attendanceLogs,
        },
      });
      return;
    }

    // Create the enrollment link
    await prisma.subjectStudent.create({
      data: {
        subjectId: subject.id,
        studentId: targetStudentId,
      },
    });

    res.status(201).json({
      success: true,
      alreadyEnrolled: false,
      message: `Successfully enrolled in ${subject.name} (${subject.subjectCode})!`,
      subject: {
        id: subject.id,
        name: subject.name,
        code: subject.subjectCode,
        subjectCode: subject.subjectCode,
        section: subject.section,
        teacherName: subject.teacher?.name || 'Instructor',
        students: subject._count.students + 1,
        classes: subject._count.attendanceLogs,
      },
    });
  } catch (error) {
    console.error('Error enrolling student in subject:', error);
    res.status(500).json({ error: 'Internal server error while enrolling in subject.' });
  }
};

/**
 * POST /api/students/unenroll
 * Removes a student's enrollment from a subject.
 */
export const unenrollFromSubject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId, subjectId } = req.body;

    const tokenStudentId = extractStudentIdFromToken(req);
    const targetStudentId = studentId ? Number(studentId) : tokenStudentId;

    if (!targetStudentId || !subjectId) {
      res.status(400).json({ error: 'Student ID and Subject ID are required to unenroll.' });
      return;
    }

    const existing = await prisma.subjectStudent.findUnique({
      where: {
        subjectId_studentId: {
          subjectId: Number(subjectId),
          studentId: targetStudentId,
        },
      },
    });

    if (!existing) {
      res.status(404).json({ error: 'You are not enrolled in this subject.' });
      return;
    }

    await prisma.subjectStudent.delete({
      where: {
        subjectId_studentId: {
          subjectId: Number(subjectId),
          studentId: targetStudentId,
        },
      },
    });

    res.json({
      success: true,
      message: 'Successfully unenrolled from the subject.',
    });
  } catch (error) {
    console.error('Error unenrolling student:', error);
    res.status(500).json({ error: 'Internal server error while unenrolling.' });
  }
};

/**
 * POST /api/students/face-login
 * Evaluates a captured webcam image:
 * 1. Calls ML microservice to extract 128-d face embedding from image
 * 2. Compares directly against registered student face embeddings in PostgreSQL
 * 3. If match found within distance threshold (0.6) -> logs student in with JWT
 * 4. If no match -> returns exists: false + extracted faceEmbedding for registration
 */
export const checkFaceLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { image } = req.body;

    if (!image) {
      res.status(400).json({ error: 'Image is required for face authentication.' });
      return;
    }

    const mlUrl = getMlServiceUrl();
    console.log(`[FaceLogin] Extracting face embedding via: ${mlUrl}/extract-embeddings/base64`);

    let queryEmbedding: number[] | null = null;
    let facesDetected = 0;

    // 1. Primary path: Extract embeddings from ML service
    try {
      const mlResponse = await fetch(`${mlUrl}/extract-embeddings/base64`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_base64: image }),
      });

      if (mlResponse.ok) {
        const mlData = (await mlResponse.json()) as {
          success?: boolean;
          faces_detected?: number;
          embeddings?: number[][];
        };
        facesDetected = mlData.faces_detected || 0;
        if (mlData.embeddings && mlData.embeddings.length > 0) {
          queryEmbedding = mlData.embeddings[0];
        }
      } else {
        // Fallback: Check if /verify-face/base64 is available
        const verifyResponse = await fetch(`${mlUrl}/verify-face/base64`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image_base64: image }),
        });

        if (verifyResponse.ok) {
          const verifyData = (await verifyResponse.json()) as any;
          if (verifyData.status === 'NO_FACE') facesDetected = 0;
          else if (verifyData.status === 'MULTIPLE_FACES') facesDetected = 2;
          else {
            facesDetected = 1;
            queryEmbedding = verifyData.face_embedding || null;
          }
        } else {
          const errText = await mlResponse.text();
          res.status(502).json({
            error: `ML facial recognition service returned status ${mlResponse.status}.`,
            details: errText,
          });
          return;
        }
      }
    } catch (fetchErr: any) {
      console.error('[FaceLogin] ML service connection error:', fetchErr);
      const isLocal = mlUrl.includes('localhost') || mlUrl.includes('127.0.0.1');
      res.status(502).json({
        error: `Cannot connect to ML facial recognition service at "${mlUrl}".`,
        hint: isLocal
          ? 'ML_SERVICE_URL is defaulting to localhost. In your Render Dashboard > Backend Web Service > Environment, set ML_SERVICE_URL to your deployed ML service URL (e.g. https://your-ml-service.onrender.com).'
          : `Render could not reach ${mlUrl}. The ML service may be sleeping (cold start on Render free tier). Please wait 30 seconds for it to wake up and try again.`,
        targetUrl: `${mlUrl}/extract-embeddings/base64`,
      });
      return;
    }

    // 2. Validate face detection results
    if (facesDetected === 0) {
      res.status(400).json({
        exists: false,
        error: 'No face detected in the frame. Please look directly at the camera with clear lighting.',
      });
      return;
    }

    if (facesDetected > 1) {
      res.status(400).json({
        exists: false,
        error: 'Multiple faces detected in the frame. Please make sure only you are in view.',
      });
      return;
    }

    if (!queryEmbedding || queryEmbedding.length !== 128) {
      res.status(400).json({
        exists: false,
        error: 'Could not compute facial features. Please ensure your face is well-lit and unobstructed.',
      });
      return;
    }

    // 3. Direct 1-to-N Euclidean matching against PostgreSQL database
    const allStudents = await prisma.student.findMany({
      where: {
        faceEmbedding: { not: null as any },
      },
      include: {
        subjects: {
          include: { subject: true },
        },
        attendanceLogs: {
          take: 10,
          orderBy: { timestamp: 'desc' },
          include: { subject: true },
        },
      },
    });

    let bestMatchStudent: (typeof allStudents)[0] | null = null;
    let minDistance = Infinity;
    const threshold = 0.6; // Standard dlib Euclidean distance threshold for 128-d embeddings

    for (const s of allStudents) {
      const studentEmb = parseEmbedding(s.faceEmbedding);
      if (studentEmb) {
        const dist = euclideanDistance(studentEmb, queryEmbedding);
        if (dist < minDistance) {
          minDistance = dist;
          bestMatchStudent = s;
        }
      }
    }

    // 4. Existing Student Match Found
    if (bestMatchStudent && minDistance <= threshold) {
      const token = jwt.sign(
        { id: bestMatchStudent.id, name: bestMatchStudent.name, role: 'student' },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        exists: true,
        student: {
          id: bestMatchStudent.id,
          student_id: bestMatchStudent.id,
          name: bestMatchStudent.name,
          subjects: bestMatchStudent.subjects.map((s) => s.subject),
          recentAttendance: bestMatchStudent.attendanceLogs,
        },
        token,
        distance: Math.round(minDistance * 10000) / 10000,
        message: `Welcome back, ${bestMatchStudent.name}!`,
      });
      return;
    }

    // 5. No Match -> New Student Registration Required
    res.json({
      exists: false,
      faceEmbedding: queryEmbedding,
      distance: minDistance !== Infinity ? Math.round(minDistance * 10000) / 10000 : null,
      message: 'Face captured! No matching student record found. Enter your full name to complete registration.',
    });
  } catch (error: any) {
    console.error('Error during face login:', error);
    res.status(500).json({ error: error?.message || 'Internal server error during face authentication.' });
  }
};

/**
 * POST /api/students/register
 * Registers a new student into PostgreSQL with their face embedding and name.
 */
export const registerStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, faceEmbedding, image, subjectIds } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      res.status(400).json({ error: 'Student full name is required.' });
      return;
    }

    let finalEmbedding = parseEmbedding(faceEmbedding);

    // If faceEmbedding wasn't directly provided, extract it using image
    if (!finalEmbedding && image) {
      const mlUrl = getMlServiceUrl();
      const mlResponse = await fetch(`${mlUrl}/extract-embeddings/base64`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_base64: image }),
      });

      if (mlResponse.ok) {
        const mlData = (await mlResponse.json()) as { embeddings: number[][] };
        if (mlData.embeddings && mlData.embeddings.length > 0) {
          finalEmbedding = parseEmbedding(mlData.embeddings[0]);
        }
      }
    }

    if (!finalEmbedding || finalEmbedding.length !== 128) {
      res.status(400).json({
        error: 'A valid 128-dimensional face embedding or clear face image is required to register.',
      });
      return;
    }

    // Create the student in the database with validated number[] float array
    const newStudent = await prisma.student.create({
      data: {
        name: name.trim(),
        faceEmbedding: finalEmbedding,
        subjects:
          Array.isArray(subjectIds) && subjectIds.length > 0
            ? {
                create: subjectIds.map((sid: number) => ({
                  subjectId: Number(sid),
                })),
              }
            : undefined,
      },
      include: {
        subjects: {
          include: {
            subject: true,
          },
        },
      },
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: newStudent.id, name: newStudent.name, role: 'student' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      exists: true,
      student: {
        id: newStudent.id,
        student_id: newStudent.id,
        name: newStudent.name,
        subjects: newStudent.subjects.map((s) => s.subject),
      },
      token,
      message: `Registration successful! Welcome to SmartAttend, ${newStudent.name}.`,
    });
  } catch (error) {
    console.error('Error during student registration:', error);
    res.status(500).json({ error: 'Internal server error while registering student.' });
  }
};
