import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { toast } from "react-toastify";
import { Trash2, FileText, X } from "lucide-react";
// import { getLaporanMutasiKasOperasional, exportPdfMutasiKasOperasional } from "../../services/laporanMutasiKasOperasional";
import { getLaporanMutasiKasOperasional } from "../../services/laporanMutasiKasOperasional";
import { getPengguna } from "../../services/pengguna";
import { fetchPrivateFileBlob } from "../../services/penyewaService";
// import ModalTambahUangMasuk from "../../components/LaporanMutasiKasOperasional/ModalTambahUangMasuk";
// import ModalTambahUangKeluar from "../../components/LaporanMutasiKasOperasional/ModalTambahUangKeluar";
import { deletePemasukan } from "../../services/pemasukanService"
import { deletePengeluaran } from "../../services/pengeluaranService"
import ModalTambahUangMasuk from "./components/ModalTambahUangMasuk"
import ModalTambahUangKeluar from "./components/ModalTambahUangKeluar"
import ConfirmDialog from "../../components/ConfirmDialog/ConfirmDialog";

import styles from "./LaporanMutasiKasOperasional.module.css";

const getAwalBulan = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}-01`;
};

const getHariIni = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
};

const formatTanggal = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(date);
};

const formatRupiah = (amount) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(Number(amount || 0));

const formatMasukKeluar = (amount) => {
    const num = Number(amount || 0);
    if (num === 0) return "-";
    return formatRupiah(num);
};

const inferMimeFromPath = (path, blobType) => {
    if (blobType && blobType !== "application/octet-stream") return blobType;
    const lower = (path || "").toLowerCase();
    if (lower.endsWith(".pdf")) return "application/pdf";
    if (lower.endsWith(".png")) return "image/png";
    if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
    if (lower.endsWith(".webp")) return "image/webp";
    if (lower.endsWith(".gif")) return "image/gif";
    return blobType || "application/octet-stream";
};

const SummaryCard = ({ label, value, tone = "" }) => (
    <div className={`${styles.summaryCard} ${tone ? styles[tone] : ""}`}>
        <span className={styles.summaryLabel}>{label}</span>
        <strong className={styles.summaryValue}>{formatRupiah(value)}</strong>
    </div>
);

const LaporanMutasiKasOperasional = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [hasSearched, setHasSearched] = useState(false);
    const [startDate, setStartDate] = useState(() => getAwalBulan());
    const [endDate, setEndDate] = useState(() => getHariIni());
    const [penggunaId, setPenggunaId] = useState("");
    const [penggunaList, setPenggunaList] = useState([]);
    const [loadingPengguna, setLoadingPengguna] = useState(false);
    const [report, setReport] = useState(null);
    const [loadingPdf, setLoadingPdf] = useState(false);
    const [showModalUangMasuk, setShowModalUangMasuk] = useState(false);
    const [showModalUangKeluar, setShowModalUangKeluar] = useState(false);
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);
    const [selectedItemDelete, setSelectedItemDelete] = useState(null);
    const [deletingItemId, setDeletingItemId] = useState(null);

    const [showProofModal, setShowProofModal] = useState(false);
    const [proofLoading, setProofLoading] = useState(false);
    const [proofObjectUrl, setProofObjectUrl] = useState(null);
    const [proofMime, setProofMime] = useState("");
    const [proofTitle, setProofTitle] = useState("Bukti Transaksi");
    const proofUrlRef = useRef(null);

    // Fetch pengguna list
    useEffect(() => {
        const fetchPengguna = async () => {
            try {
                setLoadingPengguna(true);
                const response = await getPengguna();
                setPenggunaList(Array.isArray(response) ? response : response?.data || []);
            } catch (err) {
                console.error("Gagal memuat daftar pengguna:", err);
                setPenggunaList([]);
            } finally {
                setLoadingPengguna(false);
            }
        };
        fetchPengguna();
    }, []);

    useEffect(() => {
        if (penggunaList.length === 1) {
            setPenggunaId(penggunaList[0].id);
        }
    }, [penggunaList]);

    const revokeProofUrl = useCallback(() => {
        if (proofUrlRef.current) {
            URL.revokeObjectURL(proofUrlRef.current);
            proofUrlRef.current = null;
        }
        setProofObjectUrl(null);
        setProofMime("");
    }, []);

    useEffect(() => () => revokeProofUrl(), [revokeProofUrl]);

    const handleCloseProofModal = () => {
        setShowProofModal(false);
        revokeProofUrl();
    };

    const handleViewProof = async (bukti, tipe) => {
        if (!bukti) return;

        setProofTitle(tipe === "MASUK" ? "Bukti Pemasukan" : "Bukti Pengeluaran");
        setShowProofModal(true);
        setProofLoading(true);
        revokeProofUrl();

        try {
            const blob = await fetchPrivateFileBlob(bukti);
            if (!blob) throw new Error("File tidak ditemukan");

            const mime = inferMimeFromPath(bukti, blob.type);
            const url = URL.createObjectURL(blob);
            proofUrlRef.current = url;
            setProofObjectUrl(url);
            setProofMime(mime);
        } catch (err) {
            const message = err?.message || "Gagal memuat bukti transaksi";
            toast.error(message, { position: "top-right" });
            setShowProofModal(false);
            revokeProofUrl();
        } finally {
            setProofLoading(false);
        }
    };

    const rows = useMemo(() => (Array.isArray(report?.data) ? report.data : []), [report]);

    const totalMasuk = useMemo(
        () => rows.reduce((sum, item) => sum + Number(item?.masuk || 0), 0),
        [rows]
    );

    const totalKeluar = useMemo(
        () => rows.reduce((sum, item) => sum + Number(item?.keluar || 0), 0),
        [rows]
    );

    const handleTampilkan = async () => {
        setHasSearched(true);

        if (!startDate || !endDate) {
            setError("Silakan pilih tanggal mulai dan tanggal selesai.");
            setReport(null);
            return;
        }

        if (new Date(endDate) < new Date(startDate)) {
            setError("Tanggal selesai tidak boleh lebih kecil dari tanggal mulai.");
            setReport(null);
            return;
        }

        try {
            setLoading(true);
            setError("");
            const params = { startDate, endDate };
            if (penggunaId) {
                params.penggunaId = penggunaId;
            }
            const response = await getLaporanMutasiKasOperasional(params);
            setReport(response?.data || null);
        } catch (err) {
            setError(err?.message || "Gagal memuat laporan mutasi kas operasional.");
            setReport(null);
        } finally {
            setLoading(false);
        }
    };

    // const handleExportPdf = async () => {

    //     if (!startDate || !endDate) {
    //         setError("Silakan pilih tanggal mulai dan tanggal selesai.");
    //         return;
    //     }
    
    //     if (new Date(endDate) < new Date(startDate)) {
    //         setError("Tanggal selesai tidak boleh lebih kecil dari tanggal mulai.");
    //         return;
    //     }
    
    //     try {
    //         setLoadingPdf(true);
    //         setError("");
    
    //         const params = { startDate, endDate };
    //         if (penggunaId) {
    //             params.penggunaId = penggunaId;
    //         }

    //         await exportPdfMutasiKasOperasional(params);
    
    //     } catch (err) {
    //         setError(
    //             err?.message ||
    //             "Gagal mengexport laporan mutasi kas operasional ke PDF."
    //         );
    //     } finally {
    //         setLoadingPdf(false);
    //     }
    // };

    const handleModalSuccess = async () => {
        // Refresh data jika sudah ada search yang dilakukan
        if (hasSearched) {
            await handleTampilkan();
        }
    };

    const handleConfirmDelete = (item) => {
        setSelectedItemDelete(item);
        setShowConfirmDelete(true);
    };

    const handleDeleteConfirmed = async () => {
        if (!selectedItemDelete?.id) return;

        try {
            setDeletingItemId(selectedItemDelete.id);
            
            // Tentukan apakah ini pemasukan atau pengeluaran
            const isMasuk = Number(selectedItemDelete?.masuk || 0) > 0;
            
            if (isMasuk) {
                await deletePemasukan(selectedItemDelete.id);
            } else {
                await deletePengeluaran(selectedItemDelete.id);
            }

            toast.success("Data berhasil dihapus.");
            setShowConfirmDelete(false);
            setSelectedItemDelete(null);

            // Refresh data jika sudah ada search yang dilakukan
            if (hasSearched) {
                await handleTampilkan();
            }
        } catch (err) {
            toast.error(err?.message || "Gagal menghapus data.");
        } finally {
            setDeletingItemId(null);
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div>
                    <h2>Laporan Mutasi Kas Operasional</h2>
                    <p className={styles.subtitle}>
                        Rekapitulasi mutasi kas operasional (masuk dan keluar) per periode.
                    </p>
                </div>
                <div className={styles.headerActions}>
                    <button
                        type="button"
                        className={`${styles.addButton} ${styles.addButtonMasuk}`}
                        onClick={() => setShowModalUangMasuk(true)}
                        disabled={loading || loadingPdf}
                    >
                        + Uang Masuk
                    </button>
                    <button
                        type="button"
                        className={`${styles.addButton} ${styles.addButtonKeluar}`}
                        onClick={() => setShowModalUangKeluar(true)}
                        disabled={loading || loadingPdf}
                    >
                        + Uang Keluar
                    </button>
                </div>
            </div>

            <section className={styles.filterCard}>
                <div className={styles.filterGrid}>
                    <div className={styles.field}>
                        <label htmlFor="lmkoStartDate">Tanggal Mulai</label>
                        <input
                            id="lmkoStartDate"
                            type="date"
                            className="form-control"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                    <div className={styles.field}>
                        <label htmlFor="lmkoEndDate">Tanggal Selesai</label>
                        <input
                            id="lmkoEndDate"
                            type="date"
                            className="form-control"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                    <div className={styles.field}>
                        <label htmlFor="lmkoPengguna">Pengguna</label>
                        <select
                            id="lmkoPengguna"
                            className="form-control"
                            value={penggunaId}
                            onChange={(e) => setPenggunaId(e.target.value)}
                            disabled={loadingPengguna}
                        >
                            {penggunaList.length > 1 && (
                                <option value="">-- Semua Pengguna --</option>
                            )}
                            {penggunaList.map((pengguna) => (
                                <option key={pengguna.id} value={pengguna.id}>
                                    {pengguna.nama}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className={styles.actionWrap}>
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={handleTampilkan}
                            disabled={loading || loadingPdf}
                        >
                            {loading ? "Memuat..." : "🔍 Tampilkan"}
                        </button>

                        {/* <button
                            type="button"
                            className="btn btn-success"
                            onClick={handleExportPdf}
                            disabled={loading || loadingPdf || !hasSearched}
                        >
                            {loadingPdf ? "Membuat PDF..." : "📥 Export PDF"}
                        </button> */}
                    </div>
                </div>
            </section>

            {hasSearched && report && !loading && !error ? (
                <section className={styles.summaryGrid}>
                    <SummaryCard label="Saldo Awal" value={report.saldoAwal} />
                    <SummaryCard label="Total Masuk" value={totalMasuk} tone="summaryMasuk" />
                    <SummaryCard label="Total Keluar" value={totalKeluar} tone="summaryKeluar" />
                    <SummaryCard label="Saldo Akhir" value={report.saldoAkhir} tone="summaryAkhir" />
                </section>
            ) : null}

            <section className={styles.tableCard}>
                {loading && (
                    <div className={styles.stateText}>Memuat laporan mutasi kas operasional...</div>
                )}

                {!loading && error && <div className={styles.errorText}>{error}</div>}

                {!loading && !error && !hasSearched && (
                    <div className={styles.stateText}>
                        Atur periode tanggal, lalu klik Tampilkan untuk menampilkan laporan.
                    </div>
                )}

                {!loading && !error && hasSearched && rows.length === 0 && (
                    <div className={styles.stateText}>
                        Belum ada data mutasi kas operasional pada periode ini.
                    </div>
                )}

                {!loading && !error && hasSearched && rows.length > 0 ? (
                    <div className="table-responsive">
                        <table className={`table table-hover align-middle ${styles.table}`}>
                            <thead>
                                <tr>
                                    <th>Tanggal</th>
                                    <th>Keterangan</th>
                                    {/* <th>Nama Properti</th> */}
                                    <th>Masuk</th>
                                    <th>Keluar</th>
                                    <th>Saldo</th>
                                    <th className="text-center">Bukti</th>
                                    <th style={{ width: "50px", textAlign: "center" }}>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((item) => (
                                    <tr key={item.id}>
                                        <td>{formatTanggal(item.tanggalMutasiKas)}</td>
                                        <td className={styles.keteranganCol}>{item.keterangan || "-"}</td>
                                        {/* <td>{item.properti?.nama || "-"}</td> */}
                                        <td className={styles.masukCol}>{formatMasukKeluar(item.masuk)}</td>
                                        <td className={styles.keluarCol}>{formatMasukKeluar(item.keluar)}</td>
                                        <td className={styles.saldoCol}>{formatRupiah(item.saldo)}</td>
                                        <td className="text-center">
                                            {item.bukti ? (
                                                <button
                                                    type="button"
                                                    className={styles.proofButton}
                                                    onClick={() => handleViewProof(item.bukti, item.tipe)}
                                                    title={
                                                        item.tipe === "MASUK"
                                                            ? "Lihat bukti pemasukan"
                                                            : "Lihat bukti pengeluaran"
                                                    }
                                                >
                                                    <FileText size={16} strokeWidth={2} />
                                                </button>
                                            ) : (
                                                "-"
                                            )}
                                        </td>
                                        <td style={{ textAlign: "center" }}>
                                            <button
                                                className={styles.iconDelete}
                                                onClick={() => handleConfirmDelete(item)}
                                                disabled={deletingItemId === item.id}
                                                title="Hapus data"
                                                type="button"
                                            >
                                                {deletingItemId === item.id ? (
                                                    <span className={styles.spinnerSmall}></span>
                                                ) : (
                                                    <Trash2 size={16} strokeWidth={2.2} />
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : null}
            </section>

            {showModalUangMasuk ? (
                <ModalTambahUangMasuk
                    onClose={() => setShowModalUangMasuk(false)}
                    onSuccess={handleModalSuccess}
                />
            ) : null}

            {showModalUangKeluar ? (
                <ModalTambahUangKeluar
                    onClose={() => setShowModalUangKeluar(false)}
                    onSuccess={handleModalSuccess}
                />
            ) : null}

            {showProofModal ? (
                <div className={styles.proofOverlay} onClick={handleCloseProofModal}>
                    <div
                        className={styles.proofModal}
                        onClick={(e) => e.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                        aria-label={proofTitle}
                    >
                        <div className={styles.proofModalHeader}>
                            <h4>{proofTitle}</h4>
                            <button
                                type="button"
                                className={styles.proofCloseButton}
                                onClick={handleCloseProofModal}
                                aria-label="Tutup"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className={styles.proofModalBody}>
                            {proofLoading && (
                                <div className={styles.proofPlaceholder}>
                                    <span>Memuat bukti…</span>
                                </div>
                            )}

                            {!proofLoading && proofObjectUrl && proofMime.startsWith("image/") && (
                                <img
                                    src={proofObjectUrl}
                                    alt={proofTitle}
                                    className={styles.proofImage}
                                />
                            )}

                            {!proofLoading && proofObjectUrl && proofMime === "application/pdf" && (
                                <iframe
                                    title={proofTitle}
                                    src={proofObjectUrl}
                                    className={styles.proofIframe}
                                />
                            )}

                            {!proofLoading && !proofObjectUrl && (
                                <div className={styles.proofPlaceholder}>
                                    <span>Bukti tidak dapat ditampilkan.</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : null}

            <ConfirmDialog
                show={showConfirmDelete}
                onClose={() => {
                    setShowConfirmDelete(false);
                    setSelectedItemDelete(null);
                }}
                title="Hapus Data?"
                message={
                    selectedItemDelete
                        ? `Apakah Anda yakin ingin menghapus data ini? (Rp ${formatRupiah(selectedItemDelete.masuk > 0 ? selectedItemDelete.masuk : selectedItemDelete.keluar)})`
                        : ""
                }
                confirmText="Hapus"
                cancelText="Batal"
                onConfirm={handleDeleteConfirmed}
                isLoading={deletingItemId !== null}
                isDanger={true}
            />
        </div>
    );
};

export default LaporanMutasiKasOperasional;
