import { useState, useEffect, useCallback, useRef } from "react";
import { fetchPrivateFileBlob, getPenyewa } from "../../../services/penyewaService";
import styles from "./TabSewa.module.css";

export const DOKUMEN_MAX_BYTES = 10 * 1024 * 1024;
export const DOKUMEN_ACCEPT = "application/pdf,image/jpeg,image/png,image/webp,image/gif";

const ALLOWED_MIME = new Set([
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
]);

export const SECTION_KEYS = ["personal", "identity", "profession", "document"];

export function mapApiItemToPenyewaForm(item) {
    return {
        nama: item.nama || "",
        idPengenal: item.pengenal?.id || "",
        noPengenal: item.pengenal?.noPengenal || "",
        idJenisKelamin: item.jenisKelamin?.id || "",
        idStatusPernikahan: item.statusPernikahan?.id || "",
        idProfesi: item.profesi?.id || "",
        noTelp: item.noTelp || "",
        alamat: item.alamat || "",
        email: item.email || "",
        namaInstitusi: item.institusi?.nama || "",
        alamatInstitusi: item.institusi?.alamat || "",
        noTelpInstitusi: item.institusi?.noTelp || "",
        dokumenFile: null,
    };
}

export function validateDokumenFile(file) {
    if (!file) return "Berkas wajib diunggah.";
    if (file.size > DOKUMEN_MAX_BYTES) return "Ukuran maksimal 10 MB.";
    if (!ALLOWED_MIME.has(file.type)) return "Hanya PDF atau gambar (JPEG, PNG, WebP, GIF).";
    return null;
}

function inferMimeFromPath(path, fallback) {
    const p = String(path || "").toLowerCase();
    if (p.endsWith(".pdf")) return "application/pdf";
    if (p.endsWith(".png")) return "image/png";
    if (p.endsWith(".webp")) return "image/webp";
    if (p.endsWith(".gif")) return "image/gif";
    if (p.endsWith(".jpg") || p.endsWith(".jpeg")) return "image/jpeg";
    return fallback || "";
}

function isImageMime(mime) {
    return (
        mime === "image/jpeg" ||
        mime === "image/png" ||
        mime === "image/webp" ||
        mime === "image/gif"
    );
}

/**
 * @param {object} props
 * @param {object} props.form
 * @param {function} props.setForm
 * @param {boolean} props.readOnly
 * @param {function} [props.onExistingPenyewaSelected] — (apiRow) => void
 * @param {function} [props.onRequestManualEntry]
 * @param {boolean} props.loadingMaster
 * @param {Array} props.jenisKelaminList
 * @param {Array} props.statusPernikahanList
 * @param {Array} props.pengenalList
 * @param {Array} props.profesiList
 * @param {Record<string, boolean>} props.openSections
 * @param {function} props.setOpenSections
 * @param {Record<string, boolean>} props.sectionComplete
 * @param {{ key: string|null, nonce: number }} props.focusTrigger
 * @param {string|null} props.existingDokumenLabel — URL or label when readOnly
 */
const PenyewaForm = ({
    form,
    setForm,
    readOnly,
    onExistingPenyewaSelected,
    onRequestManualEntry,
    loadingMaster,
    jenisKelaminList,
    statusPernikahanList,
    pengenalList,
    profesiList,
    openSections,
    setOpenSections,
    sectionComplete,
    focusTrigger,
    existingDokumenLabel,
}) => {
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchNama, setSearchNama] = useState("");
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [searchError, setSearchError] = useState("");
    const [dokumenError, setDokumenError] = useState("");
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef(null);

    // Server document preview (readonly / existing doc)
    const docUrlRef = useRef(null);
    const [docLoading, setDocLoading] = useState(false);
    const [docObjectUrl, setDocObjectUrl] = useState("");
    const [docMime, setDocMime] = useState("");

    // Local preview (manual upload)
    const localUrlRef = useRef(null);
    const [localPreviewUrl, setLocalPreviewUrl] = useState("");

    useEffect(() => {
        if (!focusTrigger?.key) return;
        const el = document.querySelector(`[data-penyewa-field="${focusTrigger.key}"]`);
        if (el && typeof el.focus === "function") {
            el.focus({ preventScroll: false });
        }
    }, [focusTrigger]);

    const revokeDocUrl = useCallback(() => {
        if (docUrlRef.current) {
            URL.revokeObjectURL(docUrlRef.current);
            docUrlRef.current = null;
        }
        setDocObjectUrl("");
        setDocMime("");
    }, []);

    const revokeLocalUrl = useCallback(() => {
        if (localUrlRef.current) {
            URL.revokeObjectURL(localUrlRef.current);
            localUrlRef.current = null;
        }
        setLocalPreviewUrl("");
    }, []);

    // Fetch server doc (same pattern as PengelolaanPenyewa)
    useEffect(() => {
        const path = readOnly ? existingDokumenLabel : null;
        if (!path) {
            revokeDocUrl();
            return undefined;
        }

        let cancelled = false;
        (async () => {
            setDocLoading(true);
            revokeDocUrl();
            try {
                const blob = await fetchPrivateFileBlob(path);
                if (cancelled || !blob) return;
                const mime = inferMimeFromPath(path, blob.type);
                const url = URL.createObjectURL(blob);
                docUrlRef.current = url;
                setDocObjectUrl(url);
                setDocMime(mime);
            } catch {
                // UI will show placeholder "gagal memuat"
            } finally {
                if (!cancelled) setDocLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [readOnly, existingDokumenLabel, revokeDocUrl]);

    useEffect(() => () => revokeDocUrl(), [revokeDocUrl]);

    // Local preview URL when user picks a file
    useEffect(() => {
        const f = form.dokumenFile;
        revokeLocalUrl();
        if (!f) return;
        if (f.type && f.type !== "application/pdf") {
            const url = URL.createObjectURL(f);
            localUrlRef.current = url;
            setLocalPreviewUrl(url);
        }
    }, [form.dokumenFile, revokeLocalUrl]);

    useEffect(() => () => revokeLocalUrl(), [revokeLocalUrl]);

    const toggleSection = (key) => {
        setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const runSearch = useCallback(async () => {
        const q = (searchNama || "").trim();
        if (!q) {
            setSearchError("Masukkan nama untuk mencari.");
            return;
        }
        setSearchError("");
        setSearchLoading(true);
        try {
            const res = await getPenyewa({ nama: q, limit: 50 });
            const rows = Array.isArray(res?.data) ? res.data : [];
            setSearchResults(rows);
            if (!rows.length) setSearchError("Tidak ada penyewa dengan nama tersebut.");
        } catch (e) {
            setSearchResults([]);
            setSearchError(e?.message || "Gagal mencari penyewa.");
        } finally {
            setSearchLoading(false);
        }
    }, [searchNama]);

    const onPickPenyewa = (item) => {
        setForm(mapApiItemToPenyewaForm(item));
        setSearchOpen(false);
        setSearchResults([]);
        setSearchNama("");
        onExistingPenyewaSelected?.(item);
    };

    const handleFile = (file) => {
        if (readOnly) return;
        const err = file ? validateDokumenFile(file) : null;
        setDokumenError(err || "");
        if (err) {
            setForm((prev) => ({ ...prev, dokumenFile: null }));
            return;
        }
        setForm((prev) => ({ ...prev, dokumenFile: file || null }));
    };

    const AccordionHeader = ({ sectionKey, title, subtitle }) => {
        const done = sectionComplete[sectionKey];
        const open = openSections[sectionKey];
        return (
            <button
                type="button"
                className={styles.accordionHeader}
                onClick={() => toggleSection(sectionKey)}
                aria-expanded={open}
            >
                <span
                    className={`${styles.sectionStatusDot} ${
                        done ? styles.sectionStatusOk : styles.sectionStatusPending
                    }`}
                    title={done ? "Lengkap" : "Belum lengkap"}
                />
                <span className={styles.accordionHeaderText}>
                    <span className={styles.accordionTitle}>{title}</span>
                    {subtitle ? (
                        <span className={styles.accordionSubtitle}>{subtitle}</span>
                    ) : null}
                </span>
                <span className={styles.accordionChevron}>{open ? "▲" : "▼"}</span>
            </button>
        );
    };

    const ro = readOnly;
    const showServerDoc = !!docObjectUrl && !form.dokumenFile;
    const showLocalPdf = !!form.dokumenFile && form.dokumenFile.type === "application/pdf";

    return (
        <div className={styles.penyewaAccordionWrap}>
            {readOnly ? (
                <div className={styles.existingBanner}>
                    <span>Penyewa dipilih dari pencarian — data tidak dapat diubah di sini.</span>
                    <button type="button" className={styles.linkishBtn} onClick={() => onRequestManualEntry?.()}>
                        Hapus pilihan & isi manual
                    </button>
                </div>
            ) : null}

            {/* Personal */}
            <div className={styles.accordionPanel}>
                <AccordionHeader
                    sectionKey="personal"
                    title="Informasi personal"
                    subtitle="Nama lengkap"
                />
                {openSections.personal ? (
                    <div className={styles.accordionBody}>
                        <div className={styles.namaRow}>
                            <div className={`${styles.formGroup} ${styles.namaField}`}>
                                <label className={styles.label}>Nama lengkap *</label>
                                <input
                                    type="text"
                                    data-penyewa-field="nama"
                                    className={styles.input}
                                    value={form.nama}
                                    readOnly={ro}
                                    onChange={(e) => setForm((p) => ({ ...p, nama: e.target.value }))}
                                />
                            </div>
                            {!ro ? (
                                <button
                                    type="button"
                                    className={styles.searchOpenBtn}
                                    onClick={() => {
                                        setSearchOpen(true);
                                        setSearchNama((form.nama || "").trim());
                                    }}
                                >
                                    Cari
                                </button>
                            ) : null}
                        </div>
                    </div>
                ) : null}
            </div>

            {/* Identity */}
            <div className={styles.accordionPanel}>
                <AccordionHeader
                    sectionKey="identity"
                    title="Identitas & kontak"
                    subtitle="ID, kontak, alamat"
                />
                {openSections.identity ? (
                    <div className={styles.accordionBody}>
                        <div className={styles.newTenantGrid}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Jenis pengenal *</label>
                                <select
                                    data-penyewa-field="idPengenal"
                                    className={styles.select}
                                    value={form.idPengenal}
                                    disabled={loadingMaster || ro}
                                    onChange={(e) =>
                                        setForm((p) => ({ ...p, idPengenal: e.target.value }))
                                    }
                                >
                                    <option value="">— Pilih —</option>
                                    {pengenalList.map((item) => (
                                        <option key={item.id} value={item.id}>
                                            {item.nama}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Nomor pengenal *</label>
                                <input
                                    type="text"
                                    data-penyewa-field="noPengenal"
                                    className={styles.input}
                                    value={form.noPengenal}
                                    readOnly={ro}
                                    onChange={(e) =>
                                        setForm((p) => ({ ...p, noPengenal: e.target.value }))
                                    }
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Jenis kelamin *</label>
                                <select
                                    data-penyewa-field="idJenisKelamin"
                                    className={styles.select}
                                    value={form.idJenisKelamin}
                                    disabled={loadingMaster || ro}
                                    onChange={(e) =>
                                        setForm((p) => ({ ...p, idJenisKelamin: e.target.value }))
                                    }
                                >
                                    <option value="">— Pilih —</option>
                                    {jenisKelaminList.map((item) => (
                                        <option key={item.id} value={item.id}>
                                            {item.nama}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Status pernikahan *</label>
                                <select
                                    data-penyewa-field="idStatusPernikahan"
                                    className={styles.select}
                                    value={form.idStatusPernikahan}
                                    disabled={loadingMaster || ro}
                                    onChange={(e) =>
                                        setForm((p) => ({ ...p, idStatusPernikahan: e.target.value }))
                                    }
                                >
                                    <option value="">— Pilih —</option>
                                    {statusPernikahanList.map((item) => (
                                        <option key={item.id} value={item.id}>
                                            {item.nama}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>No. telepon *</label>
                                <input
                                    type="text"
                                    data-penyewa-field="noTelp"
                                    className={styles.input}
                                    value={form.noTelp}
                                    readOnly={ro}
                                    onChange={(e) => setForm((p) => ({ ...p, noTelp: e.target.value }))}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Email *</label>
                                <input
                                    type="email"
                                    data-penyewa-field="email"
                                    className={styles.input}
                                    value={form.email}
                                    readOnly={ro}
                                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                                />
                            </div>
                            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                <label className={styles.label}>Alamat *</label>
                                <textarea
                                    data-penyewa-field="alamat"
                                    className={styles.input}
                                    value={form.alamat}
                                    readOnly={ro}
                                    onChange={(e) => setForm((p) => ({ ...p, alamat: e.target.value }))}
                                />
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>

            {/* Profession */}
            <div className={styles.accordionPanel}>
                <AccordionHeader
                    sectionKey="profession"
                    title="Profesi & institusi"
                    subtitle="Institusi diisi bebas"
                />
                {openSections.profession ? (
                    <div className={styles.accordionBody}>
                        <div className={styles.newTenantGrid}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Profesi *</label>
                                <select
                                    data-penyewa-field="idProfesi"
                                    className={styles.select}
                                    value={form.idProfesi}
                                    disabled={loadingMaster || ro}
                                    onChange={(e) =>
                                        setForm((p) => ({ ...p, idProfesi: e.target.value }))
                                    }
                                >
                                    <option value="">— Pilih —</option>
                                    {profesiList.map((item) => (
                                        <option key={item.id} value={item.id}>
                                            {item.nama}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Nama institusi *</label>
                                <input
                                    type="text"
                                    data-penyewa-field="namaInstitusi"
                                    className={styles.input}
                                    value={form.namaInstitusi}
                                    readOnly={ro}
                                    onChange={(e) =>
                                        setForm((p) => ({ ...p, namaInstitusi: e.target.value }))
                                    }
                                    placeholder="Ketik nama institusi"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>No. telp institusi *</label>
                                <input
                                    type="text"
                                    data-penyewa-field="noTelpInstitusi"
                                    className={styles.input}
                                    value={form.noTelpInstitusi}
                                    readOnly={ro}
                                    onChange={(e) =>
                                        setForm((p) => ({ ...p, noTelpInstitusi: e.target.value }))
                                    }
                                />
                            </div>
                            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                <label className={styles.label}>Alamat institusi *</label>
                                <textarea
                                    data-penyewa-field="alamatInstitusi"
                                    className={styles.input}
                                    value={form.alamatInstitusi}
                                    readOnly={ro}
                                    onChange={(e) =>
                                        setForm((p) => ({ ...p, alamatInstitusi: e.target.value }))
                                    }
                                />
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>

            {/* Document */}
            <div className={styles.accordionPanel}>
                <AccordionHeader
                    sectionKey="document"
                    title="Dokumen pengenal"
                    subtitle={readOnly ? "Berkas tersimpan" : "PDF atau gambar, maks. 10 MB"}
                />
                {openSections.document ? (
                    <div className={styles.accordionBody}>
                        <div
                            data-penyewa-field="dokumenFile"
                            className={`${styles.docFrame} ${!ro ? styles.docFrameInteractive : ""} ${
                                dragOver ? styles.docFrameDragOver : ""
                            }`}
                            role={!ro ? "button" : undefined}
                            tabIndex={!ro ? 0 : undefined}
                            onDragOver={
                                !ro
                                    ? (e) => {
                                          e.preventDefault();
                                          setDragOver(true);
                                      }
                                    : undefined
                            }
                            onDragLeave={!ro ? () => setDragOver(false) : undefined}
                            onDrop={
                                !ro
                                    ? (e) => {
                                          e.preventDefault();
                                          setDragOver(false);
                                          const f = e.dataTransfer.files?.[0];
                                          handleFile(f);
                                      }
                                    : undefined
                            }
                            onKeyDown={
                                !ro
                                    ? (e) => {
                                          if (e.key === "Enter" || e.key === " ") {
                                              e.preventDefault();
                                              fileInputRef.current?.click();
                                          }
                                      }
                                    : undefined
                            }
                            onClick={!ro ? () => fileInputRef.current?.click() : undefined}
                        >
                            {docLoading && (
                                <div className={styles.docPlaceholder}>
                                    <div className={styles.spinnerSmall} />
                                    <span>Memuat dokumen…</span>
                                </div>
                            )}

                            {!docLoading && form.dokumenFile && localPreviewUrl && (
                                <img
                                    src={localPreviewUrl}
                                    alt="Pratinjau dokumen baru"
                                    className={styles.docImage}
                                />
                            )}

                            {!docLoading && form.dokumenFile && showLocalPdf && (
                                <div className={styles.pdfPreview}>
                                    <span className={styles.pdfBadge}>PDF</span>
                                    <p className={styles.pdfName}>{form.dokumenFile.name}</p>
                                    <p className={styles.pdfHint}>
                                        Dokumen akan diunggah saat Anda menyimpan transaksi.
                                    </p>
                                </div>
                            )}

                            {!docLoading && showServerDoc && isImageMime(docMime) && (
                                <img
                                    src={docObjectUrl}
                                    alt="Dokumen pengenal"
                                    className={styles.docImage}
                                />
                            )}

                            {!docLoading && showServerDoc && docMime === "application/pdf" && (
                                <iframe
                                    title="Dokumen PDF"
                                    src={docObjectUrl}
                                    className={styles.docIframe}
                                />
                            )}

                            {!docLoading && !existingDokumenLabel && !form.dokumenFile && (
                                <div className={styles.docPlaceholder}>
                                    <span>Belum ada dokumen</span>
                                    {!ro ? (
                                        <span className={styles.docHint}>
                                            Seret berkas ke sini atau klik untuk memilih
                                        </span>
                                    ) : null}
                                </div>
                            )}

                            {!docLoading &&
                                existingDokumenLabel &&
                                !docObjectUrl &&
                                !form.dokumenFile && (
                                    <div className={styles.docPlaceholder}>
                                        <span>Gagal memuat dokumen. Muat ulang halaman atau coba lagi.</span>
                                    </div>
                                )}
                        </div>

                        {showServerDoc && docMime === "application/pdf" ? (
                            <a
                                href={docObjectUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.linkOpen}
                            >
                                Buka PDF di tab baru ↗
                            </a>
                        ) : null}

                        {!ro ? (
                            <>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept={DOKUMEN_ACCEPT}
                                    className={styles.fileInput}
                                    onChange={(e) => {
                                        const f = e.target.files?.[0];
                                        handleFile(f || null);
                                        e.target.value = "";
                                    }}
                                />
                                <div className={styles.fileRow}>
                                    <button
                                        type="button"
                                        className={styles.secondaryBtn}
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        Pilih file
                                    </button>
                                    {form.dokumenFile ? (
                                        <button
                                            type="button"
                                            className={styles.ghostBtn}
                                            onClick={() => {
                                                setDokumenError("");
                                                setForm((prev) => ({ ...prev, dokumenFile: null }));
                                            }}
                                        >
                                            Hapus pilihan
                                        </button>
                                    ) : null}
                                </div>
                                {form.dokumenFile ? (
                                    <p className={styles.fileName}>{form.dokumenFile.name}</p>
                                ) : null}
                                {dokumenError ? <p className={styles.fileError}>{dokumenError}</p> : null}
                                <p className={styles.hint}>PDF atau gambar, maks. 10 MB</p>
                            </>
                        ) : (
                            <p className={styles.hint}>Dokumen hanya dapat dilihat dari transaksi ini.</p>
                        )}
                    </div>
                ) : null}
            </div>

            {searchOpen ? (
                <div
                    className={styles.modalBackdrop}
                    role="presentation"
                    onClick={(e) => e.target === e.currentTarget && setSearchOpen(false)}
                >
                    <div className={styles.modalPanel} role="dialog" aria-modal="true">
                        <div className={styles.modalHead}>
                            <h4 className={styles.modalTitle}>Cari penyewa</h4>
                            <button
                                type="button"
                                className={styles.modalClose}
                                onClick={() => setSearchOpen(false)}
                                aria-label="Tutup"
                            >
                                ×
                            </button>
                        </div>
                        <div className={styles.modalSearchRow}>
                            <input
                                type="text"
                                className={styles.input}
                                placeholder="Nama penyewa"
                                value={searchNama}
                                onChange={(e) => setSearchNama(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && runSearch()}
                            />
                            <button
                                type="button"
                                className={styles.modalSearchBtn}
                                onClick={runSearch}
                                disabled={searchLoading}
                            >
                                {searchLoading ? "Mencari…" : "Cari"}
                            </button>
                        </div>
                        {searchError ? <div className={styles.fieldError}>{searchError}</div> : null}
                        <ul className={styles.searchResultList}>
                            {searchResults.map((row) => (
                                <li key={row.id}>
                                    <button
                                        type="button"
                                        className={styles.searchResultBtn}
                                        onClick={() => onPickPenyewa(row)}
                                    >
                                        <strong>{row.nama}</strong>
                                        <span>{row.noTelp || "—"}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            ) : null}
        </div>
    );
};

export default PenyewaForm;
