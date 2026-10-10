import { Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { TeacherLogin } from './pages/teacher/TeacherLogin';
import { TeacherRegister } from './pages/teacher/TeacherRegister';
import { TeacherDashboard } from './pages/teacher/TeacherDashboard';
import { StudentLogin } from './pages/student/StudentLogin';
function App() {
    return (
        <Routes>
            <Route path='/' element={<HomePage />} />
            <Route path='/teacher-login' element={<TeacherLogin />} />
            <Route path='/teacher-register' element={<TeacherRegister />} />
            <Route path='/teacher/dashboard' element={<TeacherDashboard />} />
            <Route path='/student-login' element={<StudentLogin />} />
        </Routes>
    )
}

export default App
