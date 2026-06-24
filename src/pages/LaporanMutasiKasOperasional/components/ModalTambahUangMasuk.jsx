import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { getProperti } from "../../../services/propertiService";
import { createPemasukan } from "../../../services/pemasukanService";
import styles from "./ModalTambahUangMasuk.module.css";

const BUKTI_ACCEPT = "application/pdf,image/jpeg,image/png,image/webp,image/gif";
const BUKTI_MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIME = new Set([
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
]);

const initialForm = {
    idProperti: "",
    tanggalPemasukan: "",
    total: "",
    keterangan: "",
    buktiPemasukan: null,
};

const validateBukti = (file) => {
    if (!file) return "Bukti pemasukan wajib diunggah.";
    if (file.size > BUKTI_MAX_BYTES) return "Ukuran file maksimal 10 MB.";
    if (!ALLOWED_MIME.has(file.type)) return "Hanya PDF atau gambar (JPEG, PNG, WebP, GIF).";
    return "";
};

const ModalTambahUangMasuk = ({ onClose, onSuccess }) => {
    const [form, setForm] = useState(initialForm);
    const [formError, setFormError] = useState({});
    const [saving, setSaving] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [previewUrl, setPreviewUrl] = useState("");

    const [propertiList, setPropertiList] = useState([]);
    const [loadingMaster, setLoadingMaster] = useState(true);

    const fileInputRef = useRef(null);

    // Load properti
    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                setLoadingMaster(true);
                const propertiRes = await getProperti({ limit: 200 });

                if (cancelled) return;

                setPropertiList(Array.isArray(propertiRes?.data) ? propertiRes.data : []);
            } catch (err) {
                console.error("Gagal memuat data properti:", err);
            } finally {
                if (!cancelled) setLoadingMaster(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        if (!form.buktiPemasukan || form.buktiPemasukan.type === "application/pdf") {
            setPreviewUrl("");
            return;
        }
        const url = URL.createObjectURL(form.buktiPemasukan);
        setPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [form.buktiPemasukan]);

    const handleChooseFile = (file) => {
        if (!file) {
            setFormError((prev) => ({ ...prev, buktiPemasukan: "Bukti pemasukan wajib diunggah." }));
            setForm((prev) => ({ ...prev, buktiPemasukan: null }));
            return;
        }

        const message = validateBukti(file);
        if (message) {
            setFormError((prev) => ({ ...prev, buktiPemasukan: message }));
            setForm((prev) => ({ ...prev, buktiPemasukan: null }));
            return;
        }

        setFormError((prev) => ({ ...prev, buktiPemasukan: "" }));
        setForm((prev) => ({ ...prev, buktiPemasukan: file || null }));
    };

    const validateForm = () => {
        const newError = {};

        if (!form.idProperti) {
            newError.idProperti = "Properti wajib dipilih.";
        }

        if (!form.tanggalPemasukan) {
            newError.tanggalPemasukan = "Tanggal harus diisi.";
        }

        if (!form.total || Number(form.total) <= 0) {
            newError.total = "Total harus lebih dari 0.";
        }

        if (!form.keterangan.trim()) {
            newError.keterangan = "Keterangan harus diisi.";
        }

        const buktiError = validateBukti(form.buktiPemasukan);
        if (buktiError) newError.buktiPemasukan = buktiError;

        setFormError(newError);
        return Object.keys(newError).length === 0;
    };

    const closeModal = () => {
        setForm(initialForm);
        setFormError({});
        setDragOver(false);
        setPreviewUrl("");
        onClose();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            setSaving(true);

            const payload = new FormData();
            payload.append("idProperti", form.idProperti);
            payload.append("tanggalPemasukan", form.tanggalPemasukan);
            payload.append("total", String(form.total));
            payload.append("keterangan", form.keterangan.trim());
            if (form.buktiPemasukan) payload.append("buktiPemasukan", form.buktiPemasukan);

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
                            <div className={styles.sectionHeader}>
                                <span>Informasi Utama</span>
                            </div>
                            <p className={styles.sectionDescription}>
                                Pilih properti dan tanggal transaksi.
                            </p>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label>Pilih Properti *</label>
                                    <select
                                        className={`form-select ${formError.idProperti ? "is-invalid" : ""}`}
                                        value={form.idProperti}
                                        disabled={saving || loadingMaster}
                                        onChange={(e) =>
                                            setForm((prev) => ({
                                                ...prev,
                                                idProperti: e.target.value,
                                            }))
                                        }
                                    >
                                        <option value="">-- Pilih properti --</option>
                                        {propertiList.map((item) => (
                                            <option key={item.id} value={item.id}>
                                                {item.nama}
                                            </option>
                                        ))}
                                    </select>
                                    {formError.idProperti ? (
                                        <span className={styles.fieldError}>{formError.idProperti}</span>
                                    ) : null}
                                </div>

                                <div className="col-md-6 mb-3">
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
                            </div>
                        </div>

                        <div className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <span>Detail Pemasukan</span>
                            </div>
                            <p className={styles.sectionDescription}>
                                Lengkapi nominal dan keterangan transaksi.
                            </p>
                            <div className="row">
                                <div className="col-md-6 mb-3">
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

                                <div className="col-md-6 mb-3">
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

                        <div className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <span>Bukti Pemasukan</span>
                            </div>
                            <p className={styles.sectionDescription}>
                                Wajib upload PDF atau gambar dengan drag & drop.
                            </p>
                            <div className={styles.field}>
                                <label>Upload Bukti Pemasukan *</label>
                                <p className={styles.hintText}>Wajib — PDF atau gambar, maksimal 10 MB.</p>
                                <div
                                    className={`${styles.dropzone} ${dragOver ? styles.dropzoneActive : ""}`}
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => fileInputRef.current?.click()}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" || e.key === " ") {
                                            e.preventDefault();
                                            fileInputRef.current?.click();
                                        }
                                    }}
                                    onDragOver={(e) => {
                                        e.preventDefault();
                                        if (!saving) setDragOver(true);
                                    }}
                                    onDragLeave={() => setDragOver(false)}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        setDragOver(false);
                                        if (saving) return;
                                        const file = e.dataTransfer.files?.[0];
                                        handleChooseFile(file || null);
                                    }}
                                >
                                    {form.buktiPemasukan && previewUrl ? (
                                        <div className={styles.filePicked}>
                                            <img
                                                src={previewUrl}
                                                alt="Pratinjau bukti pemasukan"
                                                className={styles.preview}
                                            />
                                            <div className={styles.fileMeta}>
                                                <span className={styles.fileName}>{form.buktiPemasukan.name}</span>
                                                <span className={styles.fileSize}>
                                                    {(form.buktiPemasukan.size / 1024).toFixed(1)} KB
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                className={styles.btnRemoveFile}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setForm((prev) => ({ ...prev, buktiPemasukan: null }));
                                                    setFormError((prev) => ({
                                                        ...prev,
                                                        buktiPemasukan: "Bukti pemasukan wajib diunggah.",
                                                    }));
                                                }}
                                            >
                                                Hapus
                                            </button>
                                        </div>
                                    ) : null}

                                    {form.buktiPemasukan && form.buktiPemasukan.type === "application/pdf" ? (
                                        <div className={styles.filePicked}>
                                            <div className={styles.pdfBadge}>PDF</div>
                                            <div className={styles.fileMeta}>
                                                <span className={styles.fileName}>{form.buktiPemasukan.name}</span>
                                                <span className={styles.fileSize}>
                                                    {(form.buktiPemasukan.size / 1024).toFixed(1)} KB
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                className={styles.btnRemoveFile}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setForm((prev) => ({ ...prev, buktiPemasukan: null }));
                                                    setFormError((prev) => ({
                                                        ...prev,
                                                        buktiPemasukan: "Bukti pemasukan wajib diunggah.",
                                                    }));
                                                }}
                                            >
                                                Hapus
                                            </button>
                                        </div>
                                    ) : null}

                                    {!form.buktiPemasukan ? (
                                        <div className={styles.dropPlaceholder}>
                                            <strong>Seret file ke sini</strong>
                                            <span>atau klik untuk memilih file</span>
                                        </div>
                                    ) : null}
                                </div>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept={BUKTI_ACCEPT}
                                    className={styles.fileInput}
                                    onChange={(e) => {
                                        handleChooseFile(e.target.files?.[0] || null);
                                        e.target.value = "";
                                    }}
                                />
                                {formError.buktiPemasukan ? (
                                    <span className={styles.fieldError}>{formError.buktiPemasukan}</span>
                                ) : null}
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
                            disabled={saving || !form.buktiPemasukan || !!formError.buktiPemasukan}
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
