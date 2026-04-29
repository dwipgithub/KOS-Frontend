import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaUserCircle, FaSignInAlt, FaEnvelope, FaLock } from "react-icons/fa";
import { loginUser } from "../../api/auth";
import { useNavigate } from "react-router-dom";
import styles from "./Login.module.css";
import { useAuth } from "../../context/auth/AuthContext";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const { setToken } = useAuth();

    const validateForm = () => {
        if (!email.trim()) {
            setError("Email tidak boleh kosong");
            return false;
        }
        if (!password.trim()) {
            setError("Password tidak boleh kosong");
            return false;
        }
        if (!email.includes("@")) {
            setError("Format email tidak valid");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            const token = await loginUser(email, password);

            setToken(token);

            navigate("/beranda");
        } catch (err) {
            setError(
                err.message || "Login gagal, periksa kembali email/password"
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (setter) => (e) => {
        setter(e.target.value);
        if (error) setError("");
    };

    return (
        <div className={styles.page}>
            <div className={styles.glassCard}>
                <div className={styles.inner}>
                    <div className={styles.iconWrap} aria-hidden="true">
                        <FaUserCircle />
                    </div>

                    <h1 className={styles.title}>Selamat Datang</h1>
                    <p className={styles.subtitle}>
                        Masuk untuk mengelola kos Anda
                    </p>

                    <form className={styles.form} onSubmit={handleSubmit} noValidate>
                        <div className={styles.field}>
                            <label htmlFor="email" className={styles.label}>
                                Email
                            </label>
                            <div className={styles.inputWrap}>
                                <FaEnvelope
                                    className={styles.inputIcon}
                                    aria-hidden="true"
                                />
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={handleInputChange(setEmail)}
                                    className={styles.input}
                                    placeholder="nama@email.com"
                                    disabled={isLoading}
                                    required
                                    aria-describedby={
                                        error ? "error-message" : undefined
                                    }
                                />
                            </div>
                        </div>

                        <div className={styles.field}>
                            <label htmlFor="password" className={styles.label}>
                                Password
                            </label>
                            <div className={styles.inputWrap}>
                                <FaLock
                                    className={styles.inputIcon}
                                    aria-hidden="true"
                                />
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={handleInputChange(setPassword)}
                                    className={styles.input}
                                    placeholder="••••••••"
                                    disabled={isLoading}
                                    required
                                    aria-describedby={
                                        error ? "error-message" : undefined
                                    }
                                />
                            </div>
                        </div>

                        {error && (
                            <div
                                id="error-message"
                                className={styles.error}
                                role="alert"
                            >
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className={styles.submitBtn}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <span
                                        className="spinner-border spinner-border-sm"
                                        role="status"
                                        aria-hidden="true"
                                    />
                                    Memproses...
                                </>
                            ) : (
                                <>
                                    <FaSignInAlt aria-hidden="true" />
                                    Masuk
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
