import { useNavigate } from 'react-router-dom';

export function TeacherRegister() {
    const navigate = useNavigate();

    return (
        <div className='page-container'>
            <div className='card-container'>
                <h1 className="card-title">Teacher Registration</h1>
                <form className='flex flex-col'>
                    <div className='form-group'>
                        <p className="form-label">Enter Username</p>
                        <input
                            className='form-input'
                            type='text'
                            placeholder='@someone'
                            required
                        />
                    </div>
                    <div className='form-group'>
                        <p className="form-label">Enter Name</p>
                        <input
                            className='form-input'
                            type='text'
                            placeholder='someone'
                            required
                        />
                    </div>
                    <div className='form-group'>
                        <p className="form-label">Enter Password</p>
                        <input
                            className='form-input'
                            type='password'
                            placeholder='password'
                            required
                        />
                    </div>
                    <div className='form-group'>
                        <p className="form-label">Confirm Password</p>
                        <input
                            className='form-input'
                            type='password'
                            placeholder='password'
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-4 mt-2">
                        <button
                            className='btn-primary'
                            type='submit'
                        >
                            Register <span className='text-xs bg-gray-600 border border-gray-400 px-1.5 py-0.5 rounded text-gray-200 ml-2'>Ctrl + Enter</span>
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
                    </div>
                </form>
            </div>
        </div>
    )
}