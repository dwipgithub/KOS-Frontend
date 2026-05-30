import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import styles from "./TabSewa.module.css";
import PenyewaForm, { SECTION_KEYS, validateDokumenFile } from "./PenyewaForm";
import SewaForm from "./SewaForm";
import { fetchPrivateFileBlob } from "../../../services/penyewaService";

// const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function inferMimeFromPath(path, blobType) {
    if (blobType && blobType !== "application/octet-stream") return blobType;
    const lower = (path || "").toLowerCase();
    if (lower.endsWith(".pdf")) return "application/pdf";
    if (lower.endsWith(".png")) return "image/png";
    if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
    if (lower.endsWith(".webp")) return "image/webp";
    if (lower.endsWith(".gif")) return "image/gif";
    return blobType || "application/octet-stream";
}

function validatePenyewaFields(form, readOnly) {
    const t = (s) => (s || "").trim();
    if (!t(form.nama)) return { section: "personal", field: "nama", message: "Nama lengkap wajib diisi." };
    if (!t(form.idPengenal))
        return { section: "identity", field: "idPengenal", message: "Jenis pengenal wajib dipilih." };
    if (!t(form.noPengenal))
        return { section: "identity", field: "noPengenal", message: "Nomor pengenal wajib diisi." };
    if (!t(form.idJenisKelamin))
        return { section: "identity", field: "idJenisKelamin", message: "Jenis kelamin wajib dipilih." };
    if (!t(form.noTelp))
        return { section: "identity", field: "noTelp", message: "Nomor telepon wajib diisi." };
    if (!t(form.namaOrangTua))
        return { section: "identity", field: "namaOrangTua", message: "Nama orang tua wajib diisi." };
    if (!t(form.noTelpOrangTua))
        return { section: "identity", field: "noTelpOrangTua", message: "No. telepon orang tua wajib diisi." };
    if (!t(form.alamat)) return { section: "identity", field: "alamat", message: "Alamat wajib diisi." };
    if (!t(form.profesi))
        return { section: "profession", field: "profesi", message: "Profesi wajib diisi." };
    if (!t(form.namaInstitusi))
        return { section: "profession", field: "namaInstitusi", message: "Nama institusi wajib diisi." };
    if (!readOnly) {
        const docErr = validateDokumenFile(form.dokumenFile);
        if (docErr)
            return { section: "document", field: "dokumenFile", message: docErr };
    }
    return null;
}

function validateSewaFields(formSewa) {
    if (!formSewa.tanggalMasuk)
        return { field: "tanggalMasuk", message: "Tanggal mulai wajib diisi." };
    if (!formSewa.tanggalKeluar)
        return { field: "jumlah", message: "Lengkapi durasi dan tanggal mulai agar tanggal selesai terhitung." };
    if (!formSewa.jumlah || formSewa.jumlah < 1)
        return { field: "jumlah", message: "Jumlah minimal 1." };
    return null;
}

const TabSewa = ({
    kamarData,
    sewaData,
    penyewaData,
    formSewa,
    setFormSewa,
    formPenyewaBaru,
    setFormPenyewaBaru,
    jenisKelaminList,
    statusPernikahanList,
    pengenalList,
    profesiList,
    onSimpanTransaksi,
    onDurasiChange,
    onJumlahChange,
    loadingMasterPenyewa,
    savingTransaksiSewa,
}) => {
    const isActive = sewaData?.statusSewa?.id === "ACTIVE";
    const isBooked = sewaData?.statusSewa?.id === "BOOKED";

    const [penyewaReadOnly, setPenyewaReadOnly] = useState(false);
    const [existingDokumenHint, setExistingDokumenHint] = useState("");
    const [openSections, setOpenSections] = useState({
        personal: true,
        identity: false,
        profession: false,
        document: false,
    });
    const [sewaSectionOpen, setSewaSectionOpen] = useState(true);
    const [penyewaFocus, setPenyewaFocus] = useState({ key: null, nonce: 0 });
    const [sewaFocus, setSewaFocus] = useState({ key: null, nonce: 0 });
    const [docObjectUrl, setDocObjectUrl] = useState(null);
    const [docMime, setDocMime] = useState("");
    const [docLoading, setDocLoading] = useState(false);
    const docUrlRef = useRef(null);

    const penyewaSectionComplete = useMemo(() => {
        const f = formPenyewaBaru;
        const t = (s) => (s || "").trim();
        return {
            personal: !!t(f.nama),
            identity:
                !!t(f.idPengenal) &&
                !!t(f.noPengenal) &&
                !!t(f.idJenisKelamin) &&
                !!t(f.noTelp) &&
                !!t(f.namaOrangTua) &&
                !!t(f.noTelpOrangTua) &&
                !!t(f.alamat),
            profession:
                !!t(f.profesi) &&
                !!t(f.namaInstitusi),
            document:
                penyewaReadOnly || validateDokumenFile(f.dokumenFile) === null,
        };
    }, [formPenyewaBaru, penyewaReadOnly]);

    const sewaSectionComplete = useMemo(() => {
        return (
            !!formSewa.tanggalMasuk &&
            !!formSewa.tanggalKeluar &&
            !!formSewa.jumlah &&
            formSewa.jumlah >= 1
        );
    }, [formSewa.tanggalMasuk, formSewa.tanggalKeluar, formSewa.jumlah]);

    const progressPercent = useMemo(() => {
        const penyewaDone = SECTION_KEYS.filter((k) => penyewaSectionComplete[k]).length;
        const sewaDone = sewaSectionComplete ? 1 : 0;
        const total = SECTION_KEYS.length + 1;
        return Math.round(((penyewaDone + sewaDone) / total) * 100);
    }, [penyewaSectionComplete, sewaSectionComplete]);

    const focusPenyewa = useCallback((section, field) => {
        setOpenSections((prev) => ({ ...prev, [section]: true }));
        setPenyewaFocus((p) => ({ key: field, nonce: p.nonce + 1 }));
        requestAnimationFrame(() => {
            const el = document.querySelector(`[data-penyewa-field="${field}"]`);
            el?.scrollIntoView?.({ behavior: "smooth", block: "center" });
        });
    }, []);

    const focusSewa = useCallback((field) => {
        setSewaSectionOpen(true);
        setSewaFocus((p) => ({ key: field, nonce: p.nonce + 1 }));
        requestAnimationFrame(() => {
            const el = document.querySelector(`[data-sewa-field="${field}"]`);
            el?.scrollIntoView?.({ behavior: "smooth", block: "center" });
        });
    }, []);

    const handleExistingPenyewaSelected = useCallback(
        (item) => {
            setPenyewaReadOnly(true);
            setFormSewa((prev) => ({ ...prev, idPenyewa: item.id }));
            setExistingDokumenHint(item.dokumenPengenal ? String(item.dokumenPengenal) : "");
        },
        [setFormSewa]
    );

    const handleRequestManualEntry = useCallback(() => {
        setPenyewaReadOnly(false);
        setFormSewa((prev) => ({ ...prev, idPenyewa: "" }));
        setExistingDokumenHint("");
        setFormPenyewaBaru({
            nama: "",
            idPengenal: "",
            noPengenal: "",
            idJenisKelamin: "",
            profesi: "",
            noTelp: "",
            namaOrangTua: "",
            noTelpOrangTua: "",
            alamat: "",
            namaInstitusi: "",
            alamatInstitusi: "",
            dokumenFile: null,
        });
    }, [setFormPenyewaBaru, setFormSewa]);

    const handleSimpanTransaksiClick = async () => {
        const pErr = validatePenyewaFields(formPenyewaBaru, penyewaReadOnly);
        if (pErr) {
            toast.error(pErr.message);
            focusPenyewa(pErr.section, pErr.field);
            return;
        }
        const sErr = validateSewaFields(formSewa);
        if (sErr) {
            toast.error(sErr.message);
            focusSewa(sErr.field);
            return;
        }
        await onSimpanTransaksi({ isExistingPenyewa: penyewaReadOnly });
    };

    const revokeDocUrl = useCallback(() => {
        if (docUrlRef.current) {
            URL.revokeObjectURL(docUrlRef.current);
            docUrlRef.current = null;
        }
        setDocObjectUrl(null);
        setDocMime("");
    }, []);

    // Fetch document blob when penyewaData changes
    useEffect(() => {
        const path = penyewaData?.dokumenPengenal;
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
                if (!cancelled) {
                    toast.error("Gagal memuat dokumen identitas", { position: "top-right" });
                }
            } finally {
                if (!cancelled) setDocLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [penyewaData?.dokumenPengenal, revokeDocUrl]);

    if (isActive || isBooked) {
        const rentBill = sewaData?.tagihan
            ?.filter((x) => x.kode === "RENT")
            ?.sort(
                (a, b) =>
                    new Date(a.tanggalTagihan) -
                    new Date(b.tanggalTagihan)
            )[0]

        const dpBill = sewaData?.tagihan
            ?.filter((x) => x.kode === "DP")
            ?.sort(
                (a, b) =>
                    new Date(a.tanggalTagihan) -
                    new Date(b.tanggalTagihan)
            )[0]

        return (
            <div className={styles.container}>
                <div className={styles.activeSewaContainer}>
                    <div className={styles.statusHeader}>
                        <span className={styles.statusIcon}>{isActive ? "✅" : "📅"}</span>
                        <div>
                            <h3 className={styles.statusTitle}>
                                {isActive ? "Kamar Sedang Disewa" : "Kamar Sudah Dibooking"}
                            </h3>
                            <p className={styles.statusSubtitle}>
                                {isActive
                                    ? "Data penyewa dan detail sewa"
                                    : "Data booking dan jadwal sewa"}
                            </p>
                        </div>
                    </div>

                    <div className={styles.sewaGrid}>
                        <div className={styles.sewaCardModern}>
                            <div className={styles.cardHeaderModern}>
                                <div>
                                    <h4 className={styles.cardTitle}>👤 Informasi Penyewa</h4>
                                    <p className={styles.cardSubtitle}>Detail identitas penyewa</p>
                                </div>
                            </div>

                            <div className={styles.infoGridModern}>
                                {/* Data Identitas */}
                                <div className={styles.infoBox}>
                                    <span className={styles.label}>
                                        ID {penyewaData?.pengenal?.id || "-"}
                                    </span>
                                    <span className={styles.value}>
                                        {penyewaData?.pengenal?.noPengenal || "-"}
                                    </span>
                                </div>

                                <div className={styles.infoBox}>
                                    <span className={styles.label}>Nama</span>
                                    <span className={styles.value}>{penyewaData?.nama || "-"}</span>
                                </div>

                                <div className={styles.infoBox}>
                                    <span className={styles.label}>Jenis Kelamin</span>
                                    <span className={styles.value}>
                                        {penyewaData?.jenisKelamin?.nama || "-"}
                                    </span>
                                </div>

                                <div className={styles.infoBox}>
                                    <span className={styles.label}>Telepon</span>
                                    <span className={styles.value}>{penyewaData?.noTelp || "-"}</span>
                                </div>

                                <div className={`${styles.infoBox} ${styles.fullWidth}`}>
                                    <span className={styles.label}>Alamat</span>
                                    <span className={styles.value}>{penyewaData?.alamat || "-"}</span>
                                </div>

                                {/* Data Orang Tua */}
                                <div className={styles.infoBox}>
                                    <span className={styles.label}>Nama Orang Tua</span>
                                    <span className={styles.value}>{penyewaData?.namaOrangTua || "-"}</span>
                                </div>

                                <div className={styles.infoBox}>
                                    <span className={styles.label}>Telepon Orang Tua</span>
                                    <span className={styles.value}>{penyewaData?.noTelpOrangTua || "-"}</span>
                                </div>

                                {/* Data Profesi & Institusi */}
                                <div className={styles.infoBox}>
                                    <span className={styles.label}>Profesi</span>
                                    <span className={styles.value}>{penyewaData?.profesi || "-"}</span>
                                </div>

                                <div className={`${styles.infoBox} ${styles.fullWidth}`}>
                                    <span className={styles.label}>Institusi</span>
                                    <span className={styles.value}>
                                        {penyewaData?.institusi?.nama || "-"}
                                    </span>
                                </div>

                                <div className={`${styles.infoBox} ${styles.fullWidth}`}>
                                    <span className={styles.label}>Alamat Institusi</span>
                                    <span className={styles.value}>
                                        {penyewaData?.institusi?.alamat || "-"}
                                    </span>
                                </div>

                                {/* Dokumen Pengenal */}
                                {penyewaData?.dokumenPengenal && (
                                    <div className={`${styles.infoBox} ${styles.fullWidth}`}>
                                        <span className={styles.label}>Dokumen Pengenal</span>
                                        <div className={styles.docFrame}>
                                            {docLoading && (
                                                <div className={styles.docPlaceholder}>
                                                    <div className={styles.spinnerSmall} />
                                                    <span>Memuat dokumen…</span>
                                                </div>
                                            )}

                                            {!docLoading && docObjectUrl && docMime.startsWith("image/") && (
                                                <img
                                                    src={docObjectUrl}
                                                    alt="Dokumen pengenal"
                                                    className={styles.docImage}
                                                />
                                            )}

                                            {!docLoading && docObjectUrl && docMime === "application/pdf" && (
                                                <iframe
                                                    title="Dokumen PDF"
                                                    src={docObjectUrl}
                                                    className={styles.docIframe}
                                                />
                                            )}

                                            {!docLoading && !docObjectUrl && (
                                                <div className={styles.docPlaceholder}>
                                                    <span>Gagal memuat dokumen. Muat ulang halaman atau coba lagi.</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className={styles.sewaCardModern}>
                            <div className={styles.cardHeaderModern}>
                                <div>
                                    <h4 className={styles.cardTitle}>📋 Detail Sewa</h4>
                                    <p className={styles.cardSubtitle}>Periode & biaya sewa</p>
                                </div>
                            </div>

                            <div className={styles.infoGridModern}>
                                <div className={styles.infoBox}>
                                    <span className={styles.label}>Durasi</span>
                                    <span className={styles.value}>
                                        {sewaData?.durasi?.nama || sewaData?.durasiSewa || "-"}
                                    </span>
                                </div>

                                <div className={styles.infoBox}>
                                    <span className={styles.label}>Jumlah</span>
                                    <span className={styles.value}>{rentBill?.jumlah|| "-"}</span>
                                </div>

                                <div className={styles.infoBox}>
                                    <span className={styles.label}>Masuk</span>
                                    <span className={styles.value}>
                                        {sewaData?.tanggalMasuk
                                            ? new Date(sewaData.tanggalMasuk).toLocaleDateString("id-ID", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                            })
                                            : "-"}
                                    </span>
                                </div>

                                <div className={styles.infoBox}>
                                    <span className={styles.label}>Keluar</span>
                                    <span className={styles.value}>
                                        {sewaData?.tanggalKeluar
                                            ? new Date(sewaData.tanggalKeluar).toLocaleDateString("id-ID", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                            })
                                            : "-"}
                                    </span>
                                </div>

                                <div className={styles.infoBox}>
                                    <span className={styles.label}>Harga</span>
                                    <span className={styles.value}>
                                        Rp {parseInt(rentBill?.hargaSatuan || 0).toLocaleString("id-ID")}
                                    </span>
                                </div>

                                <div className={styles.infoBox}>
                                    <span className={styles.label}>Uang Muka</span>
                                    <span className={styles.value}>
                                        Rp {Number(dpBill?.total ?? 0).toLocaleString("id-ID")}
                                    </span>
                                </div>

                                <div className={styles.infoBox}>
                                    <span className={styles.label}>Total</span>
                                    <span className={styles.value}>
                                        Rp{" "}
                                        {parseInt(
                                            rentBill?.hargaSatuan * parseInt(rentBill?.jumlah || 0)
                                        ).toLocaleString("id-ID")}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.formContainerWide}>
                <div className={styles.formHeader}>
                    <span className={styles.formIcon}>📝</span>
                    <div>
                        <h3 className={styles.formHeaderTitle}>Sewa Baru</h3>
                        <p className={styles.formHeaderSubtitle}>
                            Satu alur untuk data penyewa dan kontrak sewa kamar
                        </p>
                    </div>
                </div>

                <div className={styles.progressWrap}>
                    <div className={styles.progressLabels}>
                        <span>Progress pengisian</span>
                        <span>{progressPercent}%</span>
                    </div>
                    <div className={styles.progressTrack}>
                        <div
                            className={styles.progressFill}
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </div>

                <div className={styles.formContent}>
                    <div className={styles.formSection}>
                        <div className={styles.sectionTitle}>👤 Penyewa</div>
                        <PenyewaForm
                            form={formPenyewaBaru}
                            setForm={setFormPenyewaBaru}
                            readOnly={penyewaReadOnly}
                            onExistingPenyewaSelected={handleExistingPenyewaSelected}
                            onRequestManualEntry={handleRequestManualEntry}
                            loadingMaster={loadingMasterPenyewa}
                            jenisKelaminList={jenisKelaminList}
                            statusPernikahanList={statusPernikahanList}
                            pengenalList={pengenalList}
                            profesiList={profesiList}
                            openSections={openSections}
                            setOpenSections={setOpenSections}
                            sectionComplete={penyewaSectionComplete}
                            focusTrigger={penyewaFocus}
                            existingDokumenLabel={existingDokumenHint}
                        />
                    </div>

                    <SewaForm
                        kamarData={kamarData}
                        formSewa={formSewa}
                        setFormSewa={setFormSewa}
                        onDurasiChange={onDurasiChange}
                        onJumlahChange={onJumlahChange}
                        sectionComplete={sewaSectionComplete}
                        sectionOpen={sewaSectionOpen}
                        setSectionOpen={setSewaSectionOpen}
                        focusTrigger={sewaFocus}
                    />

                    <button
                        type="button"
                        className={styles.saveBtn}
                        onClick={handleSimpanTransaksiClick}
                        disabled={savingTransaksiSewa}
                    >
                        {savingTransaksiSewa ? "Menyimpan…" : "💾 Simpan"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TabSewa;
