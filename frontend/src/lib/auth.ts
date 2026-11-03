export interface Teacher {
    id: number;
    username: string;
    name: string;
}

export interface Student {
    id: number;
    student_id?: number;
    name: string;
}

export type UserRole = 'teacher' | 'student' | null;

export interface AuthSession {
    role: UserRole;
    user: Teacher | Student | null;
    token: string | null;
}

/**
 * Returns current authenticated session details based on localStorage
 */
export function getAuthSession(): AuthSession {
    const token = localStorage.getItem('token');
    const teacherRaw = localStorage.getItem('teacher');
    const studentRaw = localStorage.getItem('student');

    if (token && teacherRaw) {
        try {
            return {
                role: 'teacher',
                user: JSON.parse(teacherRaw) as Teacher,
                token,
            };
        } catch {
            // ignore corrupted json
        }
    }

    if (studentRaw) {
        try {
            return {
                role: 'student',
                user: JSON.parse(studentRaw) as Student,
                token: token || null,
            };
        } catch {
            // ignore corrupted json
        }
    }

    return {
        role: null,
        user: null,
        token: null,
    };
}

/**
 * Clears all authentication state from localStorage and sessionStorage
 */
export function logout(): void {
    localStorage.clear();
    sessionStorage.clear();
}

