import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { logoutUser } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import { toast } from "react-toastify";
import { useAuth } from '../context/auth/AuthContext';

const Navbar = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const isLoggedIn = Boolean(user);

    const handleLogout = async () => {
        try {
            await logoutUser();
            navigate('/');
        } catch (err) {
            toast.error(err.message);
            navigate('/');
        }
    };

    const displayName = user?.name || "Nama Pengguna";

    return (
        <nav 
            className="navbar navbar-expand-lg navbar-light bg-white border-bottom shadow-sm"
            style={{
                position: 'sticky',
                top: 0,
                zIndex: 1050,
                backdropFilter: 'blur(10px)',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                transition: 'all 0.3s ease'
            }}
        >
            <div className="container-fluid">
                <div className="flex-grow-1"></div>
                <div className="d-flex">
                    {isLoggedIn ? (
                        <div className="dropdown">
                            <button
                                className="btn btn-light dropdown-toggle d-flex align-items-center"
                                type="button"
                                id="userDropdown"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                            >
                                <span className="me-2">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        fill="currentColor"
                                        className="bi bi-person-circle"
                                        viewBox="0 0 16 16"
                                    >
                                        <path d="M13.468 12.37C12.758 11.226 11.545 10.5 10 10.5H6c-1.545 0-2.758.726-3.468 1.87A6.987 6.987 0 0 0 8 15a6.987 6.987 0 0 0 5.468-2.63z" />
                                        <path fillRule="evenodd" d="M8 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
                                        <path fillRule="evenodd" d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1z" />
                                    </svg>
                                </span>
                                {displayName}
                            </button>

                            <ul className="dropdown-menu dropdown-menu-end">
                                <li>
                                    <button
                                        type="button"
                                        className="dropdown-item"
                                        onClick={() => navigate('/change-password')}
                                    >
                                        Ganti Password
                                    </button>
                                </li>
                                <li>
                                    <button
                                        type="button"
                                        className="dropdown-item"
                                        onClick={() => navigate('/tambah-pengguna')}
                                    >
                                        Tambah Pengguna
                                    </button>
                                </li>
                                <li><hr className="dropdown-divider" /></li>
                                <li>
                                    <button className="dropdown-item" onClick={handleLogout}>
                                        Logout
                                    </button>
                                </li>
                            </ul>
                        </div>
                    ) : (
                        <button
                            className="btn btn-outline-dark btn-sm rounded-pill"
                            onClick={() => navigate('/')}
                        >
                            Login
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
