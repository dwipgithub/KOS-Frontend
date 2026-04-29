import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { logoutUser, tokenUser } from '../api/auth';
import { useNavigate } from 'react-router-dom';
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";

const Navbar = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(true);
    const [pegawaiNama, setPegawaiNama] = useState("Nama Pengguna");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const response = await tokenUser();
                if (response.data?.data?.access_token) {
                    const decoded = jwtDecode(response.data.data.access_token);
                    if (decoded.pegawaiNama) setPegawaiNama(decoded.pegawaiNama);
                }
            } catch (err) {
                console.error("Error fetching user info:", err);
            }
        };

        fetchUserInfo();
    }, []);

    const handleLogout = async () => {
        try {
            await logoutUser();
            navigate('/');
        } catch (err) {
            toast.error(err.message);
            navigate('/');
        }
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom shadow-sm">
            <div className="container-fluid">

                {/* Spacer kiri */}
                <div className="flex-grow-1"></div>

                {/* User di kanan */}
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
                                {pegawaiNama}
                            </button>

                            <ul className="dropdown-menu dropdown-menu-end">
                                <li><a className="dropdown-item" href="#/profile">Profil Saya</a></li>
                                <li><a className="dropdown-item" href="#/settings">Pengaturan</a></li>
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
                            onClick={() => setIsLoggedIn(true)}
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