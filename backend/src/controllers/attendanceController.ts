import { Request, Response } from 'express';
import { prisma } from '../utils/db';

const getMlServiceUrl = (): string =>
  (process.env.ML_SERVICE_URL || 'http://localhost:8000').trim().replace(/\/+$/, '');

interface PredictResponse {
  success: boolean;
  detected_student_ids: number[];
  total_faces_detected: number;
  all_student_ids?: number[];
  error?: string;
}

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

function euclideanDistance(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < 128; i++) {
    const diff = a[i] - b[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

/**
 * POST /api/attendance/take
 * Runs face analysis on uploaded classroom photos and records attendance in the database.
 */
export const takeAttendance = async (req: Request, res: Response): Promise<void> => {
  try {
    const { subjectId, images } = req.body;

    if (!subjectId) {
      res.status(400).json({ error: 'Subject selection is required to take attendance.' });
      return;
    }

    if (!images || !Array.isArray(images) || images.length === 0) {
      res.status(400).json({ error: 'At least one photo is required to run face analysis.' });
      return;
    }

    // 1. Verify subject exists and fetch its enrolled students with embeddings
    const subject = await prisma.subject.findUnique({
      where: { id: Number(subjectId) },
      include: {
        students: {
          include: {
            student: true,
          },
        },
      },
    });

    if (!subject) {
      res.status(404).json({ error: 'Selected subject not found in database.' });
      return;
    }

    const enrolledStudents = subject.students.map((item) => item.student);

    // 2. Process each classroom image via ML microservice
    const detectedStudentIdsSet = new Set<number>();
    let totalFacesDetected = 0;
    const mlUrl = getMlServiceUrl();

    for (const imageBase64 of images) {
      try {
        let extracted = false;

        // Preferred path: Extract all face embeddings from the image
        const mlResponse = await fetch(`${mlUrl}/extract-embeddings/base64`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image_base64: imageBase64 }),
        });

        if (mlResponse.ok) {
          const mlData = (await mlResponse.json()) as {
            faces_detected?: number;
            embeddings?: number[][];
          };
          const count = mlData.faces_detected || (mlData.embeddings ? mlData.embeddings.length : 0);
          totalFacesDetected += count;

          if (mlData.embeddings && Array.isArray(mlData.embeddings)) {
            extracted = true;
            // Compare each detected classroom face against enrolled students in PostgreSQL
            for (const faceEmb of mlData.embeddings) {
              if (!Array.isArray(faceEmb) || faceEmb.length !== 128) continue;

              for (const student of enrolledStudents) {
                const sEmb = parseEmbedding(student.faceEmbedding);
                if (sEmb) {
                  const dist = euclideanDistance(sEmb, faceEmb);
                  if (dist <= 0.6) {
                    detectedStudentIdsSet.add(student.id);
                  }
                }
              }
            }
          }
        }

        // Fallback: If /extract-embeddings was not supported, try /predict-attendance/base64
        if (!extracted) {
          const predictRes = await fetch(`${mlUrl}/predict-attendance/base64`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image_base64: imageBase64 }),
          });

          if (predictRes.ok) {
            const mlData = (await predictRes.json()) as PredictResponse;
            totalFacesDetected += mlData.total_faces_detected || 0;
            if (Array.isArray(mlData.detected_student_ids)) {
              mlData.detected_student_ids.forEach((id) => detectedStudentIdsSet.add(Number(id)));
            }
          }
        }
      } catch (mlErr) {
        console.error('[ML Service error connecting to Python microservice]:', mlErr);
      }
    }

    const attendanceTimestamp = new Date();

    // 3. Mark attendance in PostgreSQL
    const markedPresentList: { id: number; name: string }[] = [];
    const markedAbsentList: { id: number; name: string }[] = [];
    const logsToCreate: {
      subjectId: number;
      studentId: number;
      isPresent: boolean;
      timestamp: Date;
    }[] = [];

    // Categorize enrolled students
    for (const student of enrolledStudents) {
      const isPresent = detectedStudentIdsSet.has(student.id);
      if (isPresent) {
        markedPresentList.push({ id: student.id, name: student.name });
      } else {
        markedAbsentList.push({ id: student.id, name: student.name });
      }

      logsToCreate.push({
        subjectId: subject.id,
        studentId: student.id,
        isPresent,
        timestamp: attendanceTimestamp,
      });
    }

    // Also check if any detected students were registered in DB but not yet formally enrolled
    for (const detectedId of detectedStudentIdsSet) {
      if (!enrolledStudents.some((s) => s.id === detectedId)) {
        const extraStudent = await prisma.student.findUnique({ where: { id: detectedId } });
        if (extraStudent) {
          markedPresentList.push({ id: extraStudent.id, name: extraStudent.name });

          // Auto-link to subject
          await prisma.subjectStudent
            .create({
              data: { subjectId: subject.id, studentId: extraStudent.id },
            })
            .catch(() => {});

          logsToCreate.push({
            subjectId: subject.id,
            studentId: extraStudent.id,
            isPresent: true,
            timestamp: attendanceTimestamp,
          });
        }
      }
    }

    // Persist logs in database if there are students
    if (logsToCreate.length > 0) {
      await prisma.attendanceLog.createMany({
        data: logsToCreate,
      });
    }

    res.json({
      success: true,
      subject: {
        id: subject.id,
        name: subject.name,
        code: subject.subjectCode,
      },
      timestamp: attendanceTimestamp.toISOString(),
      totalPhotosAnalyzed: images.length,
      totalFacesDetected,
      markedPresent: markedPresentList,
      markedAbsent: markedAbsentList,
      presentCount: markedPresentList.length,
      absentCount: markedAbsentList.length,
      totalStudents: markedPresentList.length + markedAbsentList.length,
      message: `Attendance recorded: ${markedPresentList.length} present, ${markedAbsentList.length} absent (${totalFacesDetected} faces analyzed).`,
    });
  } catch (error) {
    console.error('Error taking attendance:', error);
    res.status(500).json({ error: 'Internal server error while processing attendance.' });
  }
};

/**
 * GET /api/attendance
 * Retrieves attendance records from the database for the teacher portal.
 */
export const getAttendanceRecords = async (req: Request, res: Response): Promise<void> => {
  try {
    const { subjectId } = req.query;

    let whereClause = {};
    if (subjectId) {
      whereClause = { subjectId: Number(subjectId) };
    }

    const records = await prisma.attendanceLog.findMany({
      where: whereClause,
      orderBy: {
        timestamp: 'desc',
      },
      take: 100,
      include: {
        student: {
          select: {
            id: true,
            name: true,
          },
        },
        subject: {
          select: {
            id: true,
            name: true,
            subjectCode: true,
            section: true,
          },
        },
      },
    });

    const formatted = records.map((r) => ({
      id: r.id,
      name: r.student?.name || 'Unknown Student',
      studentId: r.student?.id,
      date: r.timestamp ? new Date(r.timestamp).toISOString().split('T')[0] : '',
      time: r.timestamp ? new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
      timestamp: r.timestamp,
      subject: r.subject?.name || 'General Class',
      subjectCode: r.subject?.subjectCode,
      section: r.subject?.section,
      status: r.isPresent ? 'Present' : 'Absent',
      isPresent: !!r.isPresent,
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    res.status(500).json({ error: 'Internal server error while fetching attendance records.' });
  }
};
