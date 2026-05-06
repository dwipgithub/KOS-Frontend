import { useState } from "react";
import { toast } from "react-toastify";
import { createPengguna } from "../../services/pengguna";
import styles from "./Pengguna.module.css";

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

const Pengguna = () => {
    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    const validate = () => {
        const nextErrors = {};

        if (!form.nama.trim()) nextErrors.nama = "Nama pengguna wajib diisi.";
        if (!form.email.trim()) nextErrors.email = "Email wajib diisi.";
        if (!form.email.includes("@")) nextErrors.email = nextErrors.email || "Format email tidak valid.";
        if (!form.password) nextErrors.password = "Password wajib diisi.";
        if (form.password && form.password.length < 6) nextErrors.password = "Password minimal 6 karakter.";
        if (!form.confirmPassword) nextErrors.confirmPassword = "Konfirmasi password wajib diisi.";
        if (form.password !== form.confirmPassword) nextErrors.confirmPassword = "Password dan konfirmasi tidak cocok.";
        if (!form.peran) nextErrors.peran = "Peran pengguna wajib dipilih.";

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
                peran: form.peran,
            });

            toast.success("Pengguna baru berhasil dibuat.");
            setForm(initialForm);
            setErrors({});
        } catch (error) {
            const message = error?.message || error?.msg || "Gagal membuat pengguna.";
            toast.error(message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.cardWrap}>
                <div className={styles.formSection}>

                    <h3 className={styles.formTitle}>➕ Tambah Pengguna</h3>

                    <form onSubmit={handleSubmit} noValidate>

                        <div className={styles.formGroup}>
                            <label className={styles.label} htmlFor="nama">
                                Nama Lengkap
                            </label>
                            <input
                                id="nama"
                                type="text"
                                className={`${styles.input} ${errors.nama ? "is-invalid" : ""}`}
                                value={form.nama}
                                onChange={(e) =>
                                    setForm((prev) => ({ ...prev, nama: e.target.value }))
                                }
                                placeholder="Masukkan nama pengguna"
                            />
                            {errors.nama && (
                                <div className="invalid-feedback">{errors.nama}</div>
                            )}
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label} htmlFor="email">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                className={`${styles.input} ${errors.email ? "is-invalid" : ""}`}
                                value={form.email}
                                onChange={(e) =>
                                    setForm((prev) => ({ ...prev, email: e.target.value }))
                                }
                                placeholder="Masukkan email"
                            />
                            {errors.email && (
                                <div className="invalid-feedback">{errors.email}</div>
                            )}
                        </div>

                        <div className={styles.priceGridForm}>
                            <div className={styles.formGroup}>
                                <label className={styles.label} htmlFor="password">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    className={`${styles.input} ${errors.password ? "is-invalid" : ""}`}
                                    value={form.password}
                                    onChange={(e) =>
                                        setForm((prev) => ({ ...prev, password: e.target.value }))
                                    }
                                    placeholder="Masukkan password"
                                />
                                {errors.password && (
                                    <div className="invalid-feedback">{errors.password}</div>
                                )}
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label} htmlFor="confirmPassword">
                                    Konfirmasi Password
                                </label>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    className={`${styles.input} ${errors.confirmPassword ? "is-invalid" : ""}`}
                                    value={form.confirmPassword}
                                    onChange={(e) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            confirmPassword: e.target.value,
                                        }))
                                    }
                                    placeholder="Ulangi password"
                                />
                                {errors.confirmPassword && (
                                    <div className="invalid-feedback">
                                        {errors.confirmPassword}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label} htmlFor="peran">
                                Peran
                            </label>
                            <select
                                id="peran"
                                className={`${styles.input} ${errors.peran ? "is-invalid" : ""}`}
                                value={form.peran}
                                onChange={(e) =>
                                    setForm((prev) => ({ ...prev, peran: e.target.value }))
                                }
                            >
                                {roleOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            {errors.peran && (
                                <div className="invalid-feedback">{errors.peran}</div>
                            )}
                        </div>

                        <button
                            type="submit"
                            className={styles.saveBtn}
                            disabled={saving}
                        >
                            {saving ? "Menyimpan..." : "Buat Pengguna"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Pengguna;
