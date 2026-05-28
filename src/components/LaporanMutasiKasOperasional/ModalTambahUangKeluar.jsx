import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { getProperti } from "../../services/propertiService";
import { getKamar } from "../../services/kamarService";
import { getKategoriPengeluaran } from "../../services/kategoriPengeluaranService";
import { createPengeluaran } from "../../services/pengeluaranService";
import styles from "./ModalTambahUangKeluar.module.css";

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
    idKamar: "",
    idKategoriPengeluaran: "",
    tanggalPengeluaran: "",
    nama: "",
    total: "",
    catatan: "",
    buktiPengeluaran: null,
};

const validateBukti = (file) => {
    if (!file) return "Bukti pengeluaran wajib diunggah.";
    if (file.size > BUKTI_MAX_BYTES) return "Ukuran file maksimal 10 MB.";
    if (!ALLOWED_MIME.has(file.type)) return "Hanya PDF atau gambar (JPEG, PNG, WebP, GIF).";
    return "";
};

const ModalTambahUangKeluar = ({ onClose, onSuccess }) => {
    const [form, setForm] = useState(initialForm);
    const [formError, setFormError] = useState({});
    const [saving, setSaving] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [previewUrl, setPreviewUrl] = useState("");

    const [propertiList, setPropertiList] = useState([]);
    const [kategoriList, setKategoriList] = useState([]);
    const [kamarList, setKamarList] = useState([]);
    const [loadingMaster, setLoadingMaster] = useState(true);
    const [loadingKamar, setLoadingKamar] = useState(false);

    const fileInputRef = useRef(null);

    // Load properti dan kategori
    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                setLoadingMaster(true);
                const [propertiRes, kategoriRes] = await Promise.all([
                    getProperti({ limit: 200 }),
                    getKategoriPengeluaran({ limit: 200 })
                ]);

                if (cancelled) return;

                setPropertiList(Array.isArray(propertiRes?.data) ? propertiRes.data : []);
                setKategoriList(Array.isArray(kategoriRes?.data) ? kategoriRes.data : []);
            } catch (err) {
                console.error("Gagal memuat data master:", err);
            } finally {
                if (!cancelled) setLoadingMaster(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, []);

    // Load kamar berdasarkan properti
    useEffect(() => {
        if (!form.idProperti) {
            setKamarList([]);
            setForm((prev) => ({ ...prev, idKamar: "" }));
            return;
        }

        let cancelled = false;
        (async () => {
            try {
                setLoadingKamar(true);
                const res = await getKamar({ id_properti: form.idProperti, limit: 200 });
                if (cancelled) return;
                setKamarList(Array.isArray(res?.data) ? res.data : []);
            } catch (err) {
                console.error("Gagal memuat kamar:", err);
                if (!cancelled) setKamarList([]);
            } finally {
                if (!cancelled) setLoadingKamar(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [form.idProperti]);

    // Generate preview untuk image
    useEffect(() => {
        if (!form.buktiPengeluaran || form.buktiPengeluaran.type === "application/pdf") {
            setPreviewUrl("");
            return;
        }
        const url = URL.createObjectURL(form.buktiPengeluaran);
        setPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [form.buktiPengeluaran]);

    const handleChooseFile = (file) => {
        if (!file) {
            setFormError((prev) => ({ ...prev, buktiPengeluaran: "Bukti pengeluaran wajib diunggah." }));
            setForm((prev) => ({ ...prev, buktiPengeluaran: null }));
            return;
        }

        const message = validateBukti(file);
        if (message) {
            setFormError((prev) => ({ ...prev, buktiPengeluaran: message }));
            setForm((prev) => ({ ...prev, buktiPengeluaran: null }));
            return;
        }

        setFormError((prev) => ({ ...prev, buktiPengeluaran: "" }));
        setForm((prev) => ({ ...prev, buktiPengeluaran: file || null }));
    };

    const validateForm = () => {
        const nextError = {};
        if (!form.idProperti) nextError.idProperti = "Properti wajib dipilih.";
        if (!form.idKategoriPengeluaran) nextError.idKategoriPengeluaran = "Kategori pengeluaran wajib dipilih.";
        if (!form.tanggalPengeluaran) nextError.tanggalPengeluaran = "Tanggal pengeluaran wajib diisi.";
        if (!form.nama.trim()) nextError.nama = "Nama pengeluaran wajib diisi.";
        if (!form.total || Number(form.total) <= 0) nextError.total = "Jumlah pengeluaran harus lebih dari 0.";

        const buktiError = validateBukti(form.buktiPengeluaran);
        if (buktiError) nextError.buktiPengeluaran = buktiError;

        setFormError(nextError);
        return Object.keys(nextError).length === 0;
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
            payload.append("idKategoriPengeluaran", form.idKategoriPengeluaran);
            payload.append("tanggalPengeluaran", form.tanggalPengeluaran);
            payload.append("nama", form.nama.trim());
            payload.append("total", String(form.total));
            payload.append("catatan", form.catatan.trim());

            if (form.idKamar) payload.append("idKamar", form.idKamar);
            if (form.buktiPengeluaran) payload.append("buktiPengeluaran", form.buktiPengeluaran);

            await createPengeluaran(payload);
            toast.success("Uang keluar berhasil dicatat.");
            closeModal();

            if (onSuccess) {
                onSuccess();
            }
        } catch (err) {
            toast.error(err?.message || "Gagal menyimpan uang keluar.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.modalForm}>
            <div className={styles.overlay}>
                <div className={styles.modal}>
                    <div className={styles.header}>
                        <h5>Tambah Uang Keluar</h5>
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
                                Pilih properti, kamar, kategori, dan tanggal transaksi.
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
                                                idKamar: "",
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
                                    <label>Pilih Kamar (opsional)</label>
                                    <select
                                        className="form-select"
                                        value={form.idKamar}
                                        disabled={!form.idProperti || saving || loadingKamar}
                                        onChange={(e) => setForm((prev) => ({ ...prev, idKamar: e.target.value }))}
                                    >
                                        <option value="">
                                            {!form.idProperti
                                                ? "-- Pilih properti dahulu --"
                                                : loadingKamar
                                                    ? "Memuat kamar..."
                                                    : "-- Fasilitas Umum --"}
                                        </option>
                                        {kamarList.map((item) => (
                                            <option key={item.id} value={item.id}>
                                                {item.nama}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-md-6 mb-3">
                                    <label>Pilih Kategori Pengeluaran *</label>
                                    <select
                                        className={`form-select ${formError.idKategoriPengeluaran ? "is-invalid" : ""}`}
                                        value={form.idKategoriPengeluaran}
                                        disabled={saving || loadingMaster}
                                        onChange={(e) =>
                                            setForm((prev) => ({
                                                ...prev,
                                                idKategoriPengeluaran: e.target.value,
                                            }))
                                        }
                                    >
                                        <option value="">-- Pilih kategori --</option>
                                        {kategoriList.map((item) => (
                                            <option key={item.id} value={item.id}>
                                                {item.nama}
                                            </option>
                                        ))}
                                    </select>
                                    {formError.idKategoriPengeluaran ? (
                                        <span className={styles.fieldError}>{formError.idKategoriPengeluaran}</span>
                                    ) : null}
                                </div>

                                <div className="col-md-6 mb-3">
                                    <label>Tanggal Pengeluaran *</label>
                                    <input
                                        type="date"
                                        className={`form-control ${formError.tanggalPengeluaran ? "is-invalid" : ""}`}
                                        value={form.tanggalPengeluaran}
                                        disabled={saving}
                                        onChange={(e) =>
                                            setForm((prev) => ({
                                                ...prev,
                                                tanggalPengeluaran: e.target.value,
                                            }))
                                        }
                                    />
                                    {formError.tanggalPengeluaran ? (
                                        <span className={styles.fieldError}>{formError.tanggalPengeluaran}</span>
                                    ) : null}
                                </div>
                            </div>
                        </div>

                        <div className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <span>Detail Pengeluaran</span>
                            </div>
                            <p className={styles.sectionDescription}>
                                Lengkapi nama, nominal, dan catatan bila diperlukan.
                            </p>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label>Nama Pengeluaran *</label>
                                    <input
                                        type="text"
                                        className={`form-control ${formError.nama ? "is-invalid" : ""}`}
                                        placeholder="Contoh: Perbaikan atap kamar 2A"
                                        value={form.nama}
                                        disabled={saving}
                                        onChange={(e) => setForm((prev) => ({ ...prev, nama: e.target.value }))}
                                    />
                                    {formError.nama ? (
                                        <span className={styles.fieldError}>{formError.nama}</span>
                                    ) : null}
                                </div>

                                <div className="col-md-6 mb-3">
                                    <label>Jumlah Pengeluaran *</label>
                                    <input
                                        type="number"
                                        min="0"
                                        className={`form-control ${formError.total ? "is-invalid" : ""}`}
                                        placeholder="Masukkan nominal"
                                        value={form.total}
                                        disabled={saving}
                                        onChange={(e) => setForm((prev) => ({ ...prev, total: e.target.value }))}
                                    />
                                    {formError.total ? (
                                        <span className={styles.fieldError}>{formError.total}</span>
                                    ) : null}
                                </div>

                                <div className="col-md-12 mb-3">
                                    <label>Catatan (opsional)</label>
                                    <textarea
                                        rows={3}
                                        className="form-control"
                                        placeholder="Tambahkan catatan bila diperlukan"
                                        value={form.catatan}
                                        disabled={saving}
                                        onChange={(e) => setForm((prev) => ({ ...prev, catatan: e.target.value }))}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <span>Bukti Pengeluaran</span>
                            </div>
                            <p className={styles.sectionDescription}>
                                Wajib upload PDF atau gambar dengan drag & drop.
                            </p>
                            <div className={styles.field}>
                                <label>Upload Bukti Pengeluaran *</label>
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
                                    {form.buktiPengeluaran && previewUrl ? (
                                        <div className={styles.filePicked}>
                                            <img
                                                src={previewUrl}
                                                alt="Pratinjau bukti pengeluaran"
                                                className={styles.preview}
                                            />
                                            <div className={styles.fileMeta}>
                                                <span className={styles.fileName}>{form.buktiPengeluaran.name}</span>
                                                <span className={styles.fileSize}>
                                                    {(form.buktiPengeluaran.size / 1024).toFixed(1)} KB
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                className={styles.btnRemoveFile}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setForm((prev) => ({ ...prev, buktiPengeluaran: null }));
                                                    setFormError((prev) => ({
                                                        ...prev,
                                                        buktiPengeluaran: "Bukti pengeluaran wajib diunggah.",
                                                    }));
                                                }}
                                            >
                                                Hapus
                                            </button>
                                        </div>
                                    ) : null}

                                    {form.buktiPengeluaran && form.buktiPengeluaran.type === "application/pdf" ? (
                                        <div className={styles.filePicked}>
                                            <div className={styles.pdfBadge}>PDF</div>
                                            <div className={styles.fileMeta}>
                                                <span className={styles.fileName}>{form.buktiPengeluaran.name}</span>
                                                <span className={styles.fileSize}>
                                                    {(form.buktiPengeluaran.size / 1024).toFixed(1)} KB
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                className={styles.btnRemoveFile}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setForm((prev) => ({ ...prev, buktiPengeluaran: null }));
                                                    setFormError((prev) => ({
                                                        ...prev,
                                                        buktiPengeluaran: "Bukti pengeluaran wajib diunggah.",
                                                    }));
                                                }}
                                            >
                                                Hapus
                                            </button>
                                        </div>
                                    ) : null}

                                    {!form.buktiPengeluaran ? (
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
                                {formError.buktiPengeluaran ? (
                                    <span className={styles.fieldError}>{formError.buktiPengeluaran}</span>
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
                            disabled={saving || !form.buktiPengeluaran || !!formError.buktiPengeluaran}
                        >
                            💾 Simpan
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default ModalTambahUangKeluar;
