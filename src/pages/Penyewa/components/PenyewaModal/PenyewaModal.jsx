import { useRef, useState, useEffect, useCallback } from "react";
import styles from "./PenyewaModal.module.css";

const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPT = "application/pdf,image/jpeg,image/png,image/webp,image/gif,.pdf,.jpg,.jpeg,.png,.webp,.gif";

const allowedExt = new Set([".pdf", ".jpg", ".jpeg", ".png", ".webp", ".gif"]);
const allowedMime = new Set([
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif"
]);

function validateDokumenFile(file) {
    if (!file) return "Pilih file terlebih dahulu.";
    if (file.size > MAX_BYTES) return "Ukuran maksimal 10 MB.";
    const name = file.name || "";
    const dot = name.lastIndexOf(".");
    const ext = dot >= 0 ? name.slice(dot).toLowerCase() : "";
    if (!allowedExt.has(ext) || !allowedMime.has(file.type)) {
        return "Hanya PDF atau gambar (JPEG, PNG, WebP, GIF).";
    }
    return null;
}

const PenyewaModal = ({
    show,
    onClose,
    form,
    setForm,
    jenisKelaminList,
    statusPernikahanList,
    pengenalList,
    profesiList,
    onSave
}) => {
    const inputRef = useRef(null);
    const [dragActive, setDragActive] = useState(false);
    const [fileError, setFileError] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    const setDokumenFile = useCallback(
        (file) => {
            const err = file ? validateDokumenFile(file) : null;
            setFileError(err);
            if (err) return;
            setForm((prev) => ({ ...prev, dokumenFile: file || null }));
        },
        [setForm]
    );

    useEffect(() => {
        const f = form.dokumenFile;
        if (!f || !f.type.startsWith("image/")) {
            setPreviewUrl(null);
            return;
        }
        const url = URL.createObjectURL(f);
        setPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [form.dokumenFile]);

    const handleFiles = (list) => {
        const file = list?.[0];
        if (file) setDokumenFile(file);
    };

    const onInputChange = (e) => {
        handleFiles(e.target.files);
        e.target.value = "";
    };

    const clearFile = (e) => {
        e?.stopPropagation();
        setFileError(null);
        setForm((prev) => ({ ...prev, dokumenFile: null }));
    };

    const onDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const onDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        handleFiles(e.dataTransfer?.files);
    };

    if (!show) return null;

    const file = form.dokumenFile;

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>

                {/* HEADER */}
                <div className={styles.header}>
                    <h5>Tambah Penyewa</h5>
                    <button type="button" onClick={onClose}>✖</button>
                </div>

                {/* BODY */}
                <div className={styles.body}>

                    {/* INFORMASI PERSONAL */}
                    <div className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <span>Informasi Personal</span>
                            <span className={styles.emojiPersonalInformation}>🪪</span>
                        </div>
                        <p className={styles.sectionDescription}>
                            Lengkapi data dasar penyewa agar profil lebih akurat.
                        </p>

                        <div className="row">
                            <div className="col-md-12 mb-3">
                                <label className={styles.label}>Nama Lengkap</label>
                                <input
                                    type="text"
                                    className={`form-control ${styles.input}`}
                                    value={form.nama}
                                    onChange={(e) =>
                                        setForm({ ...form, nama: e.target.value })
                                    }
                                />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className={styles.label}>Jenis Kelamin</label>
                                <select
                                    className={`form-control ${styles.input}`}
                                    value={form.idJenisKelamin}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            idJenisKelamin: e.target.value
                                        })
                                    }
                                >
                                    <option value="">-- Pilih Jenis Kelamin --</option>
                                    {jenisKelaminList.map((jenisKelamin) => (
                                        <option key={jenisKelamin.id} value={jenisKelamin.id}>
                                            {jenisKelamin.nama}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="col-md-6 mb-3">
                                <label className={styles.label}>Status Pernikahan</label>
                                <select
                                    className={`form-control ${styles.input}`}
                                    value={form.idStatusPernikahan}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            idStatusPernikahan: e.target.value
                                        })
                                    }
                                >
                                    <option value="">-- Pilih Status Pernikahan --</option>
                                    {statusPernikahanList.map((statusPernikahan) => (
                                        <option key={statusPernikahan.id} value={statusPernikahan.id}>
                                            {statusPernikahan.nama}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-md-12 mb-3">
                                <label className={styles.label}>Alamat</label>
                                <textarea
                                    className={`form-control ${styles.input}`}
                                    value={form.alamat}
                                    onChange={(e) =>
                                        setForm({ ...form, alamat: e.target.value })
                                    }
                                />
                            </div>
                        </div>
                    </div>

                    {/* IDENTITY */}
                    <div className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <span>Identitas dan Kontak</span>
                            <span className={styles.emojiIdentity}>📇</span>
                        </div>
                        <p className={styles.sectionDescription}>
                            Gunakan data identitas aktif untuk mempermudah verifikasi.
                        </p>

                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className={styles.label}>ID Pengenal</label>
                                <select
                                    className={`form-control ${styles.input}`}
                                    value={form.idPengenal}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            idPengenal: e.target.value
                                        })
                                    }
                                >
                                    <option value="">-- Pilih ID Pengenal --</option>
                                    {pengenalList.map((pengenal) => (
                                        <option key={pengenal.id} value={pengenal.id}>
                                            {pengenal.nama}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className={styles.label}>No.Pengenal</label>
                                <input
                                    type="string"
                                    className={`form-control ${styles.input}`}
                                    value={form.noPengenal}
                                    onChange={(e) =>
                                        setForm({ ...form, noPengenal: e.target.value })
                                    }
                                />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className={styles.label}>No.Telp</label>
                                <input
                                    type="string"
                                    className={`form-control ${styles.input}`}
                                    value={form.noTelp}
                                    onChange={(e) =>
                                        setForm({ ...form, noTelp: e.target.value })
                                    }
                                />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className={styles.label}>Email</label>
                                <input
                                    type="string"
                                    className={`form-control ${styles.input}`}
                                    value={form.email}
                                    onChange={(e) =>
                                        setForm({ ...form, email: e.target.value })
                                    }
                                />
                            </div>

                            <div className="col-md-12 mb-3">
                                <div className={styles.subSectionCard}>
                                    <div className={styles.subSectionTitle}>Profesi & Institusi</div>
                                    <p className={styles.subSectionDescription}>
                                        Profesi dan data institusi ditampilkan sebagai satu kesatuan profil kerja penyewa.
                                    </p>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className={styles.label}>Profesi</label>
                                            <select
                                                className={`form-control ${styles.input}`}
                                                value={form.idProfesi}
                                                onChange={(e) =>
                                                    setForm({
                                                        ...form,
                                                        idProfesi: e.target.value
                                                    })
                                                }
                                            >
                                                <option value="">-- Pilih Profesi --</option>
                                                {profesiList.map((profesi) => (
                                                    <option key={profesi.id} value={profesi.id}>
                                                        {profesi.nama}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="col-md-6 mb-3">
                                            <label className={styles.label}>Nama Institusi</label>
                                            <input
                                                type="text"
                                                className={`form-control ${styles.input}`}
                                                value={form.namaInstitusi}
                                                onChange={(e) =>
                                                    setForm({ ...form, namaInstitusi: e.target.value })
                                                }
                                            />
                                        </div>

                                        <div className="col-md-6 mb-0">
                                            <label className={styles.label}>Alamat Institusi</label>
                                            <textarea
                                                className={`form-control ${styles.inputArea}`}
                                                value={form.alamatInstitusi}
                                                onChange={(e) =>
                                                    setForm({ ...form, alamatInstitusi: e.target.value })
                                                }
                                            />
                                        </div>

                                        <div className="col-md-6 mb-0">
                                            <label className={styles.label}>No.Telp Institusi</label>
                                            <input
                                                type="text"
                                                className={`form-control ${styles.input}`}
                                                value={form.noTelpInstitusi}
                                                onChange={(e) =>
                                                    setForm({ ...form, noTelpInstitusi: e.target.value })
                                                }
                                            />
                                        </div>

                                    </div>
                                </div>
                            </div>

                            <div className="col-md-12 mb-1">
                                <label className={styles.label}>
                                    Dokumen pengenal{" "}
                                    <span className={styles.requiredMark} title="Wajib">
                                        *
                                    </span>
                                </label>
                                <p className={styles.dropHint}>
                                    Wajib — PDF atau gambar (JPEG, PNG, WebP, GIF), maks. 10 MB
                                </p>
                                <input
                                    ref={inputRef}
                                    type="file"
                                    accept={ACCEPT}
                                    className={styles.fileInputHidden}
                                    onChange={onInputChange}
                                />
                                <div
                                    role="button"
                                    tabIndex={0}
                                    className={`${styles.dropZone} ${dragActive ? styles.dropZoneActive : ""} ${file ? styles.dropZoneHasFile : ""}`}
                                    onClick={() => inputRef.current?.click()}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" || e.key === " ") {
                                            e.preventDefault();
                                            inputRef.current?.click();
                                        }
                                    }}
                                    onDragEnter={onDrag}
                                    onDragOver={onDrag}
                                    onDragLeave={onDrag}
                                    onDrop={onDrop}
                                >
                                    {!file ? (
                                        <div className={styles.dropZoneInner}>
                                            <span className={styles.dropIcon} aria-hidden>⬆</span>
                                            <span className={styles.dropTitle}>
                                                Seret file ke sini atau klik untuk memilih
                                            </span>
                                            <span className={styles.dropSub}>
                                                KTP, SIM, paspor, atau dokumen lain
                                            </span>
                                        </div>
                                    ) : (
                                        <div className={styles.filePicked}>
                                            {previewUrl ? (
                                                <img
                                                    src={previewUrl}
                                                    alt="Pratinjau dokumen"
                                                    className={styles.previewImg}
                                                />
                                            ) : (
                                                <div className={styles.pdfBadge}>PDF</div>
                                            )}
                                            <div className={styles.fileMeta}>
                                                <span className={styles.fileName}>{file.name}</span>
                                                <span className={styles.fileSize}>
                                                    {(file.size / 1024).toFixed(1)} KB
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                className={styles.btnRemoveFile}
                                                onClick={clearFile}
                                            >
                                                Hapus
                                            </button>
                                        </div>
                                    )}
                                </div>
                                {fileError && (
                                    <p className={styles.fileError}>{fileError}</p>
                                )}
                            </div>

                        </div>
                    </div>
                </div>

                {/* FOOTER */}
                <div className={styles.footer}>
                    <button type="button" className={styles.btnCancel} onClick={onClose}>
                        Batal
                    </button>
                    <button
                        type="button"
                        className={styles.btnSave}
                        onClick={onSave}
                        disabled={!file || !!fileError}
                    >
                        💾 Simpan
                    </button>
                </div>

            </div>
        </div>
    );
};

export default PenyewaModal;
