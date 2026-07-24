import { useNavigate } from 'react-router-dom';
import './TeacherRegister.css';

export function TeacherRegister() {
    const navigate = useNavigate();

    return (
        <div className='register-page-wrapper'>
            <div className='register-container'>
                <h1>Teacher Registration</h1>
                <form className='register-form'>
                    <div className='register-form-group'>
                        <p>Enter Username</p>
                        <input
                            className='register-form-input'
                            type='text'
                            placeholder='@someone'
                            required
                        />
                    </div>
                    <div className='register-form-group'>
                        <p>Enter Name</p>
                        <input
                            className='register-form-input'
                            type='text'
                            placeholder='someone'
                            required
                        />
                    </div>
                    <div className='register-form-group'>
                        <p>Enter Password</p>
                        <input
                            className='register-form-input'
                            type='password'
                            placeholder='password'
                            required
                        />
                    </div>
                    <div className='register-form-group'>
                        <p>Confirm Password</p>
                        <input
                            className='register-form-input'
                            type='password'
                            placeholder='password'
                            required
                        />
                    </div>
                    <button
                        className='btn-primary'
                        type='submit'
                    >
                        Register <span className='key'>Ctrl + Enter</span>
                    </button>
                    <button
                        className='btn-secondary'
                        type='button'
                        onClick={() => {
                            navigate('/teacher-login');
                        }}
                    >
                        Login Instead
                    </button>
                </form>
            </div>
        </div>
    )
}