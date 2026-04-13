import { useRef, useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePengelolaanPenyewa } from "./hook/usePengelolaanPenyewa";
import styles from "./PengelolaanPenyewa.module.css";

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
    if (!file) return null;
    if (file.size > MAX_BYTES) return "Ukuran maksimal 10 MB.";
    const name = file.name || "";
    const dot = name.lastIndexOf(".");
    const ext = dot >= 0 ? name.slice(dot).toLowerCase() : "";
    if (!allowedExt.has(ext) || !allowedMime.has(file.type)) {
        return "Hanya PDF atau gambar (JPEG, PNG, WebP, GIF).";
    }
    return null;
}

const PengelolaanPenyewa = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const {
        penyewaData,
        form,
        setForm,
        jenisKelaminList,
        statusPernikahanList,
        pengenalList,
        loading,
        saving,
        docLoading,
        docObjectUrl,
        docMime,
        handleSave
    } = usePengelolaanPenyewa(id);
    const fileInputRef = useRef(null);
    const [fileError, setFileError] = useState(null);
    const [localPreviewUrl, setLocalPreviewUrl] = useState(null);

    const setDokumenFile = useCallback(
        (file) => {
            const err = validateDokumenFile(file);
            setFileError(err);
            if (err) return;
            setForm((prev) => ({ ...prev, dokumenFile: file || null }));
        },
        [setForm]
    );

    useEffect(() => {
        const f = form.dokumenFile;
        if (!f || !f.type.startsWith("image/")) {
            setLocalPreviewUrl(null);
            return undefined;
        }
        const url = URL.createObjectURL(f);
        setLocalPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [form.dokumenFile]);

    const handleBack = () => navigate("/penyewa");

    const isImageMime = (mime) => mime && mime.startsWith("image/");
    const showServerDoc = docObjectUrl && !form.dokumenFile;
    const showLocalPdf = form.dokumenFile && form.dokumenFile.type === "application/pdf";
    const pengenalNama =
        pengenalList.find((p) => p.id === penyewaData?.pengenal?.id)?.nama || "—";

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div className={styles.headerInner}>
                    <button type="button" className={styles.backBtn} onClick={handleBack}>
                        ← Kembali
                    </button>
                    <div className={styles.headerText}>
                        <h1 className={styles.title}>Pengelolaan Penyewa</h1>
                        <p className={styles.subtitle}>
                            {loading ? "Memuat…" : penyewaData?.nama || "—"}
                        </p>
                    </div>
                </div>
            </header>

            <div className={styles.body}>
                {loading && (
                    <div className={styles.loading}>
                        <div className={styles.spinner} aria-hidden />
                        <p>Memuat data penyewa…</p>
                    </div>
                )}

                {!loading && !penyewaData && (
                    <div className={styles.empty}>
                        <p>Data penyewa tidak ditemukan.</p>
                        <button type="button" className={styles.secondaryBtn} onClick={handleBack}>
                            Kembali ke daftar
                        </button>
                    </div>
                )}

                {!loading && penyewaData && (
                    <div className={styles.grid}>
                        <section className={styles.column}>
                            <article className={styles.card}>
                                <div className={styles.cardHead}>
                                    <span className={styles.cardIcon}>👤</span>
                                    <div>
                                        <h2 className={styles.cardTitle}>Profil</h2>
                                        <p className={styles.cardDesc}>Ringkasan data penyewa saat ini</p>
                                    </div>
                                </div>
                                <div className={styles.profileHero}>
                                    <div className={styles.avatarLarge}>
                                        {penyewaData.jenisKelamin?.nama === "Laki-Laki" ? "👨" : "👩"}
                                    </div>
                                    <div>
                                        <h3 className={styles.profileName}>{penyewaData.nama}</h3>
                                        <span className={styles.chip}>
                                            {penyewaData.jenisKelamin?.nama || "—"}
                                        </span>
                                    </div>
                                </div>
                                <div className={styles.infoGrid}>
                                    <div className={styles.infoCell}>
                                        <span className={styles.label}>Telepon</span>
                                        <span className={styles.value}>{penyewaData.noTelp || "—"}</span>
                                    </div>
                                    <div className={styles.infoCell}>
                                        <span className={styles.label}>Email</span>
                                        <span className={styles.value}>{penyewaData.email || "—"}</span>
                                    </div>
                                    <div className={`${styles.infoCell} ${styles.span2}`}>
                                        <span className={styles.label}>Alamat</span>
                                        <span className={styles.value}>{penyewaData.alamat || "—"}</span>
                                    </div>
                                    <div className={styles.infoCell}>
                                        <span className={styles.label}>Jenis pengenal</span>
                                        <span className={styles.value}>{pengenalNama}</span>
                                    </div>
                                    <div className={styles.infoCell}>
                                        <span className={styles.label}>No. pengenal</span>
                                        <span className={styles.value}>
                                            {penyewaData.pengenal?.noPengenal || "—"}
                                        </span>
                                    </div>
                                    <div className={styles.infoCell}>
                                        <span className={styles.label}>Status pernikahan</span>
                                        <span className={styles.value}>
                                            {penyewaData.statusPernikahan?.nama || "—"}
                                        </span>
                                    </div>
                                </div>
                            </article>

                            <article className={styles.card}>
                                <div className={styles.cardHead}>
                                    <span className={styles.cardIcon}>🪪</span>
                                    <div>
                                        <h2 className={styles.cardTitle}>Dokumen identitas</h2>
                                        <p className={styles.cardDesc}>
                                            Hanya dapat dibuka setelah login (aman)
                                        </p>
                                    </div>
                                </div>

                                <div className={styles.docFrame}>
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
                                            <p className={styles.pdfHint}>Simpan perubahan untuk mengunggah ke server.</p>
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

                                    {!docLoading &&
                                        !penyewaData.dokumenPengenal &&
                                        !form.dokumenFile && (
                                            <div className={styles.docPlaceholder}>
                                                <span>Belum ada dokumen</span>
                                            </div>
                                        )}

                                    {!docLoading &&
                                        penyewaData.dokumenPengenal &&
                                        !docObjectUrl &&
                                        !form.dokumenFile && (
                                            <div className={styles.docPlaceholder}>
                                                <span>Gagal memuat dokumen. Muat ulang halaman atau coba lagi.</span>
                                            </div>
                                        )}
                                </div>

                                {showServerDoc && docMime === "application/pdf" && (
                                    <a
                                        href={docObjectUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={styles.linkOpen}
                                    >
                                        Buka PDF di tab baru ↗
                                    </a>
                                )}
                            </article>
                        </section>

                        <section className={styles.column}>
                            <article className={styles.card}>
                                <div className={styles.cardHead}>
                                    <span className={styles.cardIcon}>✏️</span>
                                    <div>
                                        <h2 className={styles.cardTitle}>Ubah profil</h2>
                                        <p className={styles.cardDesc}>Perbarui data dan dokumen bila perlu</p>
                                    </div>
                                </div>

                                <div className={styles.formGrid}>
                                    <label className={styles.field}>
                                        <span className={styles.fieldLabel}>Nama lengkap</span>
                                        <input
                                            type="text"
                                            className={styles.input}
                                            value={form.nama}
                                            onChange={(e) =>
                                                setForm({ ...form, nama: e.target.value })
                                            }
                                        />
                                    </label>

                                    <label className={styles.field}>
                                        <span className={styles.fieldLabel}>Jenis kelamin</span>
                                        <select
                                            className={styles.input}
                                            value={form.idJenisKelamin}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    idJenisKelamin: e.target.value
                                                })
                                            }
                                        >
                                            <option value="">Pilih</option>
                                            {jenisKelaminList.map((jk) => (
                                                <option key={jk.id} value={jk.id}>
                                                    {jk.nama}
                                                </option>
                                            ))}
                                        </select>
                                    </label>

                                    <label className={styles.field}>
                                        <span className={styles.fieldLabel}>Status pernikahan</span>
                                        <select
                                            className={styles.input}
                                            value={form.idStatusPernikahan}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    idStatusPernikahan: e.target.value
                                                })
                                            }
                                        >
                                            <option value="">Pilih</option>
                                            {statusPernikahanList.map((sp) => (
                                                <option key={sp.id} value={sp.id}>
                                                    {sp.nama}
                                                </option>
                                            ))}
                                        </select>
                                    </label>

                                    <label className={`${styles.field} ${styles.span2}`}>
                                        <span className={styles.fieldLabel}>Alamat</span>
                                        <textarea
                                            className={styles.textarea}
                                            rows={3}
                                            value={form.alamat}
                                            onChange={(e) =>
                                                setForm({ ...form, alamat: e.target.value })
                                            }
                                        />
                                    </label>

                                    <label className={styles.field}>
                                        <span className={styles.fieldLabel}>Jenis pengenal</span>
                                        <select
                                            className={styles.input}
                                            value={form.idPengenal}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    idPengenal: e.target.value
                                                })
                                            }
                                        >
                                            <option value="">Pilih</option>
                                            {pengenalList.map((p) => (
                                                <option key={p.id} value={p.id}>
                                                    {p.nama}
                                                </option>
                                            ))}
                                        </select>
                                    </label>

                                    <label className={styles.field}>
                                        <span className={styles.fieldLabel}>No. pengenal</span>
                                        <input
                                            type="text"
                                            className={styles.input}
                                            value={form.noPengenal}
                                            onChange={(e) =>
                                                setForm({ ...form, noPengenal: e.target.value })
                                            }
                                        />
                                    </label>

                                    <label className={styles.field}>
                                        <span className={styles.fieldLabel}>No. telepon</span>
                                        <input
                                            type="text"
                                            className={styles.input}
                                            value={form.noTelp}
                                            onChange={(e) =>
                                                setForm({ ...form, noTelp: e.target.value })
                                            }
                                        />
                                    </label>

                                    <label className={styles.field}>
                                        <span className={styles.fieldLabel}>Email</span>
                                        <input
                                            type="email"
                                            className={styles.input}
                                            value={form.email}
                                            onChange={(e) =>
                                                setForm({ ...form, email: e.target.value })
                                            }
                                        />
                                    </label>

                                    <div className={`${styles.field} ${styles.span2}`}>
                                        <span className={styles.fieldLabel}>Ganti dokumen (opsional)</span>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept={ACCEPT}
                                            className={styles.fileInput}
                                            onChange={(e) => {
                                                const f = e.target.files?.[0];
                                                setDokumenFile(f || null);
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
                                            {form.dokumenFile && (
                                                <button
                                                    type="button"
                                                    className={styles.ghostBtn}
                                                    onClick={() => {
                                                        setFileError(null);
                                                        setForm({ ...form, dokumenFile: null });
                                                    }}
                                                >
                                                    Hapus pilihan
                                                </button>
                                            )}
                                        </div>
                                        {form.dokumenFile && (
                                            <p className={styles.fileName}>{form.dokumenFile.name}</p>
                                        )}
                                        {fileError && <p className={styles.fileError}>{fileError}</p>}
                                        <p className={styles.hint}>PDF atau gambar, maks. 10 MB</p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    className={styles.primaryBtn}
                                    onClick={handleSave}
                                    disabled={saving || !!fileError}
                                >
                                    {saving ? "Menyimpan…" : "Simpan perubahan"}
                                </button>
                            </article>
                        </section>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PengelolaanPenyewa;
