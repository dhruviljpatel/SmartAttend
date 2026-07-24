import { useNavigate } from 'react-router-dom';
import './HomePage.css';

export function HomePage() {
    const navigate = useNavigate();

    return (
        <div className="home-container">
            <h1 className="title">Smart Attend</h1>
            <p className="tagline">Streamlining attendance for teachers and students.</p>
            <div className="button-group">
                <button
                    className="signin-btn"
                    onClick={() => navigate('/teacher-login')}>
                    Teacher Login <i className="fa-solid fa-arrow-up-right-from-square"></i>
                </button>
                <button
                    className="signin-btn"
                    onClick={() => navigate('/student-login')}>
                    Student Login <i className="fa-solid fa-arrow-up-right-from-square"></i>
                </button>
            </div>
        </div>
    );
}