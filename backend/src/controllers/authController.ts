import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/db';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-please-change';

export const registerTeacher = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, name, password } = req.body;

    // Basic validation
    if (!username || !name || !password) {
      res.status(400).json({ error: 'All fields are required.' });
      return;
    }

    // Check if user already exists
    const existingTeacher = await prisma.teacher.findUnique({
      where: { username }
    });

    if (existingTeacher) {
      res.status(409).json({ error: 'Username already exists.' });
      return;
    }

    // Hash the password for security
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create the new teacher in database
    const newTeacher = await prisma.teacher.create({
      data: {
        username,
        name,
        password: hashedPassword,
      },
    });

    res.status(201).json({
      message: 'Teacher registered successfully',
      teacher: { id: newTeacher.id, username: newTeacher.username, name: newTeacher.name }
    });
  } catch (error) {
    console.error('Error during teacher registration:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const loginTeacher = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ error: 'Username and password are required.' });
      return;
    }

    // Find the teacher by username
    const teacher = await prisma.teacher.findUnique({
      where: { username }
    });

    if (!teacher) {
      res.status(401).json({ error: 'Invalid credentials.' });
      return;
    }

    // Compare the provided password with the stored hashed password
    const isPasswordValid = await bcrypt.compare(password, teacher.password);

    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid credentials.' });
      return;
    }

    // Generate a JWT token
    const token = jwt.sign(
      { id: teacher.id, username: teacher.username, role: 'teacher' },
      JWT_SECRET,
      { expiresIn: '1d' } // Token expires in 1 day
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      teacher: { id: teacher.id, username: teacher.username, name: teacher.name }
    });
  } catch (error) {
    console.error('Error during teacher login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
