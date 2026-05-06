import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { createPengguna } from "../../services/pengguna";
import styles from "./AddUser.module.css";

const initialForm = {
    nama: "",
    email: "",
    password: "",
    confirmPassword: "",
    peran: "OPERATOR",
};

const roleOptions = [
    { value: "OWNER", label: "OWNER" },
    { value: "ADMIN", label: "ADMIN" },
    { value: "OPERATOR", label: "OPERATOR" },
];

const AddUser = () => {
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

        if (!form.nama.trim()) nextErrors.nama = "Nama wajib diisi.";
        if (!form.email.trim()) nextErrors.email = "Email wajib diisi.";
        if (form.email && !form.email.includes("@")) nextErrors.email = "Format email tidak valid.";
        if (!form.password) nextErrors.password = "Password wajib diisi.";
        if (form.password && form.password.length < 6) nextErrors.password = "Password minimal 6 karakter.";
        if (!form.confirmPassword) nextErrors.confirmPassword = "Konfirmasi password wajib diisi.";
        if (form.password !== form.confirmPassword) nextErrors.confirmPassword = "Password dan konfirmasi tidak cocok.";
        if (!form.peran) nextErrors.peran = "Peran wajib dipilih.";

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
            await createPengguna({
                nama: form.nama.trim(),
                email: form.email.trim(),
                password: form.password,
                confirmPassword: form.confirmPassword,
                peran: form.peran,
            });
            toast.success("Pengguna berhasil dibuat.");
            navigate("/beranda");
        } catch (error) {
            toast.error(error?.message || "Gagal membuat pengguna.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.title}>Tambah Pengguna</h2>
                <button
                    type="button"
                    className={styles.backButton}
                    onClick={() => navigate(-1)}
                >
                    ← Kembali
                </button>
            </div>

            <div className={styles.content}>
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h5>Informasi Pengguna Baru</h5>
                    </div>
                    <div className={styles.cardBody}>
                        <form onSubmit={handleSubmit}>
                            <div className={styles.section}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Nama Lengkap</label>
                                    <input
                                        type="text"
                                        className={`form-control ${errors.nama ? 'is-invalid' : ''}`}
                                        id="nama"
                                        value={form.nama}
                                        onChange={(event) => setForm((prev) => ({ ...prev, nama: event.target.value }))}
                                        placeholder="Masukkan nama lengkap"
                                    />
                                    {errors.nama && <div className="invalid-feedback">{errors.nama}</div>}
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Email</label>
                                    <input
                                        type="email"
                                        className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                        id="userEmail"
                                        value={form.email}
                                        onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                                        placeholder="Masukkan alamat email"
                                    />
                                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Password</label>
                                    <input
                                        type="password"
                                        className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                        id="password"
                                        value={form.password}
                                        onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                                        placeholder="Masukkan password"
                                    />
                                    {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Konfirmasi Password</label>
                                    <input
                                        type="password"
                                        className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                                        id="confirmPassword"
                                        value={form.confirmPassword}
                                        onChange={(event) => setForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
                                        placeholder="Ulangi password"
                                    />
                                    {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Peran</label>
                                    <select
                                        className={`form-control ${errors.peran ? 'is-invalid' : ''}`}
                                        id="peran"
                                        value={form.peran}
                                        onChange={(event) => setForm((prev) => ({ ...prev, peran: event.target.value }))}
                                    >
                                        {roleOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.peran && <div className="invalid-feedback">{errors.peran}</div>}
                                </div>
                            </div>

                            <div className={styles.formActions}>
                                <button
                                    type="button"
                                    className={styles.btnCancel}
                                    onClick={() => navigate(-1)}
                                    disabled={saving}
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className={styles.btnSave}
                                    disabled={saving}
                                >
                                    {saving ? "Menyimpan…" : "Buat Pengguna"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddUser;