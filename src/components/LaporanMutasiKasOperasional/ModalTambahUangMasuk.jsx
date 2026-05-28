import { useState } from "react";
import { toast } from "react-toastify";
import { createKasOperasional } from "../../services/kasOperasionalService";
import styles from "./ModalTambahUangMasuk.module.css";

const initialForm = {
    tanggalMutasiKas: "",
    total: "",
    keterangan: "",
};

const ModalTambahUangMasuk = ({ onClose, onSuccess }) => {
    const [form, setForm] = useState(initialForm);
    const [formError, setFormError] = useState({});
    const [saving, setSaving] = useState(false);

    const validateForm = () => {
        const newError = {};

        if (!form.tanggalMutasiKas) {
            newError.tanggalMutasiKas = "Tanggal harus diisi.";
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
                tanggalMutasiKas: form.tanggalMutasiKas,
                total: Number(form.total),
                keterangan: form.keterangan.trim(),
                tipe: "MASUK",
            };

            await createKasOperasional(payload);

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
                                    <label htmlFor="tanggalMutasiKas">
                                        Tanggal *
                                    </label>

                                    <input
                                        id="tanggalMutasiKas"
                                        type="date"
                                        className={`form-control ${
                                            formError.tanggalMutasiKas
                                                ? "is-invalid"
                                                : ""
                                        }`}
                                        value={form.tanggalMutasiKas}
                                        disabled={saving}
                                        onChange={(e) =>
                                            setForm((prev) => ({
                                                ...prev,
                                                tanggalMutasiKas: e.target.value
                                            }))
                                        }
                                    />

                                    {formError.tanggalMutasiKas ? (
                                        <span className={styles.fieldError}>
                                            {formError.tanggalMutasiKas}
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
                                        placeholder="Masukkan keterangan (contoh: Uang kas dari penghuni)"
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
