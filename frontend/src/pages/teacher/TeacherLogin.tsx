import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
        <div className='page-container'>
            <div className='card-container relative'>
                <button
                    className='absolute top-6 left-6 p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-full transition-colors cursor-pointer border-none bg-transparent flex items-center justify-center'
                    onClick={() => {
                        navigate('/');
                    }}>
                    <i className="fa-solid fa-chevron-left"></i>
                </button>
                <h1 className="card-title">Teacher Login</h1>
                <form className='flex flex-col'>
                    <div className='form-group'>
                        <p className="form-label">Enter Username</p>
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
                        <p className="form-label">Enter Password</p>
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
                    <div className="flex flex-col gap-4 mt-2">
                        <button
                            className='btn-primary'
                            type='submit'
                            onClick={Login}
                        >
                            Login <span className='text-xs bg-gray-800 border border-gray-600 px-1.5 py-0.5 rounded text-gray-200 ml-2'>Ctrl + Enter</span>
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
                    </div>
                </form>
            </div>
        </div>
    );
}