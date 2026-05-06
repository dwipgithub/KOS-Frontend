import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { changePassword } from "../../services/pengguna";
import styles from "./ChangePassword.module.css";

const initialForm = {
    passwordLama: "",
    passwordBaru: "",
    passwordBaruConfirmation: "",
};

const ChangePassword = () => {
    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        setForm(initialForm);
        setErrors({});
    }, []);

    const validate = () => {
        const nextErrors = {};

        if (!form.passwordLama) nextErrors.passwordLama = "Password lama wajib diisi.";
        if (!form.passwordBaru) nextErrors.passwordBaru = "Password baru wajib diisi.";
        if (form.passwordBaru && form.passwordBaru.length < 6) nextErrors.passwordBaru = "Password baru minimal 6 karakter.";
        if (!form.passwordBaruConfirmation) nextErrors.passwordBaruConfirmation = "Konfirmasi password wajib diisi.";
        if (form.passwordBaru !== form.passwordBaruConfirmation) nextErrors.passwordBaruConfirmation = "Password baru dan konfirmasi tidak cocok.";

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!validate()) {
            toast.error("Periksa kembali isian formulir.");
            return;
        }

        try {
            setSaving(true);
            await changePassword({
                passwordLama: form.passwordLama,
                passwordBaru: form.passwordBaru,
                passwordBaruConfirmation: form.passwordBaruConfirmation,
            });
            toast.success("Password berhasil diubah.");
            navigate("/beranda");
        } catch (error) {
            toast.error(error?.message || "Gagal mengubah password.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.formSection}>
                <h3 className={styles.formTitle}>🔒 Ubah Password</h3>

                <form onSubmit={handleSubmit}>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Password Lama</label>
                        <input
                            type="password"
                            className={`${styles.input} ${errors.passwordLama ? "is-invalid" : ""}`}
                            value={form.passwordLama}
                            onChange={(e) =>
                                setForm((prev) => ({
                                    ...prev,
                                    passwordLama: e.target.value,
                                }))
                            }
                            placeholder="Masukkan password lama"
                        />
                        {errors.passwordLama && (
                            <div className="invalid-feedback">{errors.passwordLama}</div>
                        )}
                    </div>

                    <div className={styles.priceGridForm}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Password Baru</label>
                            <input
                                type="password"
                                className={`${styles.input} ${errors.passwordBaru ? "is-invalid" : ""}`}
                                value={form.passwordBaru}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        passwordBaru: e.target.value,
                                    }))
                                }
                                placeholder="Masukkan password baru"
                            />
                            {errors.passwordBaru && (
                                <div className="invalid-feedback">{errors.passwordBaru}</div>
                            )}
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Konfirmasi Password</label>
                            <input
                                type="password"
                                className={`${styles.input} ${errors.passwordBaruConfirmation ? "is-invalid" : ""}`}
                                value={form.passwordBaruConfirmation}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        passwordBaruConfirmation: e.target.value,
                                    }))
                                }
                                placeholder="Ulangi password baru"
                            />
                            {errors.passwordBaruConfirmation && (
                                <div className="invalid-feedback">
                                    {errors.passwordBaruConfirmation}
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={{ display: "flex", gap: "12px" }}>
                        <button
                            type="button"
                            className={styles.saveBtn}
                            onClick={() => navigate(-1)}
                            disabled={saving}
                            style={{ background: "#ccc", color: "#333" }}
                        >
                            Batal
                        </button>

                        <button
                            type="submit"
                            className={styles.saveBtn}
                            disabled={saving}
                        >
                            {saving ? "Menyimpan…" : "Simpan Password"}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default ChangePassword;