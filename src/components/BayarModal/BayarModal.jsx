import { useEffect, useRef, useState, useCallback } from "react";
import styles from "./BayarModal.module.css";
import { X, CreditCard, Wallet, Upload } from "lucide-react";

const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPT =
    "application/pdf,image/jpeg,image/png,image/webp,image/gif,.pdf,.jpg,.jpeg,.png,.webp,.gif";

const allowedExt = new Set([".pdf", ".jpg", ".jpeg", ".png", ".webp", ".gif"]);
const allowedMime = new Set([
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif"
]);

function validateBuktiFile(file) {
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

const BayarModal = ({
    show,
    onClose,
    tagihan,
    formPembayaran,
    setFormPembayaran,
    onSave
}) => {
    const inputRef = useRef(null);
    const [dragActive, setDragActive] = useState(false);
    const [fileError, setFileError] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    useEffect(() => {
        if (show && tagihan) {
            setFormPembayaran({
                idTagihan: tagihan.id,
                tanggalBayar: new Date().toISOString().split("T")[0],
                idMetodeBayar: "CASH",
                totalBayar: parseInt(tagihan.total) || 0,
                buktiFile: null
            });
            setFileError(null);
        }
    }, [show, tagihan, setFormPembayaran]);

    const setBuktiFile = useCallback(
        (file) => {
            const err = file ? validateBuktiFile(file) : null;
            setFileError(err);
            if (err) return;
            setFormPembayaran((prev) => ({ ...prev, buktiFile: file || null }));
        },
        [setFormPembayaran]
    );

    useEffect(() => {
        const f = formPembayaran.buktiFile;
        if (!f || !f.type.startsWith("image/")) {
            setPreviewUrl(null);
            return;
        }
        const url = URL.createObjectURL(f);
        setPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [formPembayaran.buktiFile]);

    const handleFiles = (list) => {
        const file = list?.[0];
        if (file) setBuktiFile(file);
    };

    const onInputChange = (e) => {
        handleFiles(e.target.files);
        e.target.value = "";
    };

    const clearFile = (e) => {
        e.stopPropagation();
        setFileError(null);
        setFormPembayaran((prev) => ({ ...prev, buktiFile: null }));
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

    if (!show || !tagihan) return null;

    const bukti = formPembayaran.buktiFile;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                
                {/* HEADER */}
                <div className={styles.modalHeader}>
                    <div>
                        <h3 className={styles.title}>Pembayaran Tagihan</h3>
                        <p className={styles.subtitle}>
                            Selesaikan pembayaran dengan cepat dan aman
                        </p>
                    </div>
                    <button type="button" onClick={onClose} className={styles.closeBtn}>
                        <X size={18} />
                    </button>
                </div>

                {/* HIGHLIGHT TOTAL */}
                <div className={styles.totalBox}>
                    <span className={styles.totalLabel}>Total Bayar</span>
                    <span className={styles.totalValue}>
                        Rp {parseInt(tagihan.total).toLocaleString("id-ID")}
                    </span>
                </div>

                {/* BODY */}
                <div className={styles.modalBody}>
                    
                    {/* ID TAGIHAN */}
                    <div className={styles.formGroup}>
                        <label>ID Tagihan</label>
                        <input value={tagihan.id} disabled />
                    </div>

                    {/* METODE (MODERN SELECT BUTTON STYLE) */}
                    <div className={styles.formGroup}>
                        <label>Metode Pembayaran</label>

                        <div className={styles.metodeGrid}>
                            <div
                                role="button"
                                tabIndex={0}
                                className={`${styles.metodeCard} ${
                                    formPembayaran.idMetodeBayar === "CASH" ? styles.active : ""
                                }`}
                                onClick={() =>
                                    setFormPembayaran({ ...formPembayaran, idMetodeBayar: "CASH" })
                                }
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                        e.preventDefault();
                                        setFormPembayaran({ ...formPembayaran, idMetodeBayar: "CASH" });
                                    }
                                }}
                            >
                                <Wallet size={18} />
                                <span>Cash</span>
                            </div>

                            <div
                                role="button"
                                tabIndex={0}
                                className={`${styles.metodeCard} ${
                                    formPembayaran.idMetodeBayar === "TF" ? styles.active : ""
                                }`}
                                onClick={() =>
                                    setFormPembayaran({ ...formPembayaran, idMetodeBayar: "TF" })
                                }
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                        e.preventDefault();
                                        setFormPembayaran({ ...formPembayaran, idMetodeBayar: "TF" });
                                    }
                                }}
                            >
                                <CreditCard size={18} />
                                <span>Transfer</span>
                            </div>
                        </div>
                    </div>

                    {/* TANGGAL */}
                    <div className={styles.formGroup}>
                        <label>Tanggal Bayar</label>
                        <input
                            type="date"
                            value={formPembayaran.tanggalBayar}
                            onChange={(e) =>
                                setFormPembayaran({ ...formPembayaran, tanggalBayar: e.target.value })
                            }
                        />
                    </div>

                    {/* BUKTI BAYAR */}
                    <div className={styles.formGroup}>
                        <label>
                            Bukti pembayaran{" "}
                            <span className={styles.requiredMark} title="Wajib">
                                *
                            </span>
                        </label>
                        <p className={styles.buktiHint}>
                            Wajib — PDF atau foto transfer / kwitansi, maks. 10 MB
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
                            className={`${styles.dropZone} ${dragActive ? styles.dropZoneActive : ""} ${bukti ? styles.dropZoneFilled : ""}`}
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
                            {!bukti ? (
                                <div className={styles.dropZoneInner}>
                                    <span className={styles.dropIconWrap} aria-hidden>
                                        <Upload size={22} strokeWidth={2} />
                                    </span>
                                    <span className={styles.dropTitle}>
                                        Seret file ke sini atau klik untuk unggah
                                    </span>
                                    <span className={styles.dropSub}>
                                        Kwitansi, screenshot transfer, atau scan
                                    </span>
                                </div>
                            ) : (
                                <div className={styles.filePicked}>
                                    {previewUrl ? (
                                        <img
                                            src={previewUrl}
                                            alt="Pratinjau bukti"
                                            className={styles.previewImg}
                                        />
                                    ) : (
                                        <div className={styles.pdfBadge}>PDF</div>
                                    )}
                                    <div className={styles.fileMeta}>
                                        <span className={styles.fileName}>{bukti.name}</span>
                                        <span className={styles.fileSize}>
                                            {(bukti.size / 1024).toFixed(1)} KB
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
                            <p className={styles.fileError} role="alert">
                                {fileError}
                            </p>
                        )}
                    </div>
                </div>

                {/* FOOTER */}
                <div className={styles.modalFooter}>
                    <button type="button" className={styles.btnCancel} onClick={onClose}>
                        Batal
                    </button>

                    <button
                        type="button"
                        className={styles.btnSave}
                        disabled={!bukti || !!fileError}
                        onClick={() => {
                            const payload = {
                                ...formPembayaran,
                                idTagihan: tagihan.id,
                                totalBayar: parseInt(tagihan.total) || 0,
                            };

                            onSave(payload);
                        }}
                    >
                        Simpan Pembayaran
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BayarModal;
