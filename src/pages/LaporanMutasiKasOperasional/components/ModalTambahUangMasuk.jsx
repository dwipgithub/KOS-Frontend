import { useState } from "react";
import { toast } from "react-toastify";
import { createPemasukan } from "../../../services/pemasukanService";
import styles from "./ModalTambahUangMasuk.module.css";

const initialForm = {
    tanggalPemasukan: "",
    total: "",
    keterangan: "",
};

const ModalTambahUangMasuk = ({ onClose, onSuccess }) => {
    const [form, setForm] = useState(initialForm);
    const [formError, setFormError] = useState({});
    const [saving, setSaving] = useState(false);

    const validateForm = () => {
        const newError = {};

        if (!form.tanggalPemasukan) {
            newError.tanggalPemasukan = "Tanggal harus diisi.";
        }

        if (!form.total || Number(form.total) <= 0) {
            newError.total = "Total harus lebih dari 0.";
        }

        if (!form.keterangan.trim()) {
            newError.keterangan = "Keterangan harus diisi.";
        }

        setFormError(newError);
        return Object.keys(newError).length === 0;
    };

    const closeModal = () => {
        setForm(initialForm);
        setFormError({});
        onClose();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            setSaving(true);

            const payload = {
                tanggalPemasukan: form.tanggalPemasukan,
                total: Number(form.total),
                keterangan: form.keterangan.trim(),
            };

            await createPemasukan(payload);

            toast.success("Uang masuk berhasil dicatat.");

            closeModal();

            if (onSuccess) {
                onSuccess();
            }

        } catch (err) {
            toast.error(
                err?.message || "Gagal menyimpan uang masuk."
            );

        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.modalForm}>
            <div className={styles.overlay}>
                <div className={styles.modal}>
                    <div className={styles.header}>
                        <h5>Tambah Uang Masuk</h5>
                        <button
                            type="button"
                            onClick={closeModal}
                            aria-label="Tutup"
                        >
                            ×
                        </button>
                    </div>

                    <div className={styles.body}>
                        <div className={styles.section}>
                            <div className="row">
                                <div className="col-md-12 mb-3">
                                    <label htmlFor="tanggalPemasukan">
                                        Tanggal *
                                    </label>

                                    <input
                                        id="tanggalPemasukan"
                                        type="date"
                                        className={`form-control ${
                                            formError.tanggalPemasukan
                                                ? "is-invalid"
                                                : ""
                                        }`}
                                        value={form.tanggalPemasukan}
                                        disabled={saving}
                                        onChange={(e) =>
                                            setForm((prev) => ({
                                                ...prev,
                                                tanggalPemasukan: e.target.value
                                            }))
                                        }
                                    />

                                    {formError.tanggalPemasukan ? (
                                        <span className={styles.fieldError}>
                                            {formError.tanggalPemasukan}
                                        </span>
                                    ) : null}
                                </div>

                                <div className="col-md-12 mb-3">
                                    <label htmlFor="totalUangMasuk">
                                        Total *
                                    </label>

                                    <input
                                        id="totalUangMasuk"
                                        type="number"
                                        min="0"
                                        step="1"
                                        className={`form-control ${
                                            formError.total
                                                ? "is-invalid"
                                                : ""
                                        }`}
                                        placeholder="Masukkan nominal"
                                        value={form.total}
                                        disabled={saving}
                                        onChange={(e) =>
                                            setForm((prev) => ({
                                                ...prev,
                                                total: e.target.value
                                            }))
                                        }
                                    />

                                    {formError.total ? (
                                        <span className={styles.fieldError}>
                                            {formError.total}
                                        </span>
                                    ) : null}
                                </div>

                                <div className="col-md-12 mb-3">
                                    <label htmlFor="keteranganMasuk">
                                        Keterangan *
                                    </label>

                                    <textarea
                                        id="keteranganMasuk"
                                        rows={3}
                                        className={`form-control ${
                                            formError.keterangan
                                                ? "is-invalid"
                                                : ""
                                        }`}
                                        placeholder="Masukkan keterangan (contoh: Uang kas dari pemilik)"
                                        value={form.keterangan}
                                        disabled={saving}
                                        onChange={(e) =>
                                            setForm((prev) => ({
                                                ...prev,
                                                keterangan: e.target.value
                                            }))
                                        }
                                    />

                                    {formError.keterangan ? (
                                        <span className={styles.fieldError}>
                                            {formError.keterangan}
                                        </span>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.footer}>
                        <button
                            type="button"
                            className={styles.btnCancel}
                            onClick={closeModal}
                            disabled={saving}
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className={styles.btnSave}
                            disabled={saving}
                        >
                            💾 Simpan
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default ModalTambahUangMasuk;
