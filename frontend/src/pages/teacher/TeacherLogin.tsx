import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './TeacherLogin.css';

export function TeacherLogin() {
    const [formData, setFormData] = useState({
        username: "",
        password: ""
    });
    const navigate = useNavigate();

    function Login() {
        navigate(`/teacher/dashboard?name=${formData.username}`);
    }

    return (
        <div className='login-page-wrapper'>
            <div className='login-container'>
                <button
                    className='btn-home'
                    onClick={() => {
                        navigate('/');
                    }}>
                    <i className="fa-solid fa-chevron-left"></i>
                </button>
                <h1>Teacher Login</h1>
                <form className='login-form'>
                    <div className='form-group'>
                        <p>Enter Username</p>
                        <input
                            className='form-input'
                            type='text'
                            placeholder='@someone'
                            value={formData.username}
                            onChange={
                                (e) => setFormData({
                                    ...formData,
                                    username: e.target.value
                                })
                            }
                            required
                        />
                    </div>
                    <div className='form-group'>
                        <p>Enter Password</p>
                        <input
                            className='form-input'
                            type='password'
                            placeholder='password'
                            value={formData.password}
                            onChange={
                                (e) => setFormData({
                                    ...formData,
                                    password: e.target.value
                                })
                            }
                            required
                        />
                    </div>
                    <button
                        className='btn-primary'
                        type='submit'
                        onClick={Login}
                    >
                        Login <span className='key'>Ctrl + Enter</span>
                    </button>
                    <button
                        className='btn-secondary'
                        type='button'
                        onClick={() => {
                            navigate('/teacher-register');
                        }}
                    >
                        Register Instead
                    </button>
                </form>
            </div>
        </div>
    );
}