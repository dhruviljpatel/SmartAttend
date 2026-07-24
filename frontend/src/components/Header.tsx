import logo from '../assets/logo.svg';
import './Header.css';

export function Header() {
    return (
        <header className='teacher-dashboard-header'>
            <div className='header-brand'>
                <img src={logo} alt="Smart Attend Logo" className="header-logo" />
                <div className="header-brand-text">
                    Smart<br />Attend
                </div>
            </div>

            <div className='header-right'>
                <button className='btn-logout'>Logout</button>
            </div>
        </header>
    );
}