import { useState, useEffect, useRef, useCallback } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import { FileText, X } from "lucide-react";
import { getLaporanArusKas, exportPdfArusKas } from "../../services/laporanArusKas";
import { getProperti } from "../../services/propertiService";
import { fetchPrivateFileBlob } from "../../services/penyewaService";
import styles from "./LaporanArusKas.module.css";

const getAwalBulan = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}-01`;
};

const getAkhirBulan = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();

    const lastDay = new Date(y, m + 1, 0);

    return `${lastDay.getFullYear()}-${String(
        lastDay.getMonth() + 1
    ).padStart(2, "0")}-${String(lastDay.getDate()).padStart(2, "0")}`;
};

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

const formatTanggal = (isoDate) => {
    if (!isoDate) return "-";

    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) return "-";

    return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    }).format(date);
};

const formatRupiah = (amount) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(Number(amount || 0));

const selectStyles = {
    control: (base, state) => ({
        ...base,
        minHeight: 40,
        borderColor: state.isFocused ? "#7c3aed" : "#d1d5db",
        boxShadow: state.isFocused ? "0 0 0 3px rgba(124, 58, 237, 0.15)" : "none",
        borderRadius: 10,
        "&:hover": { borderColor: "#7c3aed" },
    }),
    menu: (base) => ({ ...base, zIndex: 30 }),
};

const LaporanArusKas = () => {
    const [loading, setLoading] = useState(false);
    const [loadingPdf, setLoadingPdf] = useState(false);
    const [error, setError] = useState("");
    const [records, setRecords] = useState([]);
    const [startDate, setStartDate] = useState(() => getAwalBulan());
    const [endDate, setEndDate] = useState(() => getAkhirBulan());
    const [selectedProperti, setSelectedProperti] = useState(null);
    const [propertiOptions, setPropertiOptions] = useState([]);
    const [loadingProperti, setLoadingProperti] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const [showProofModal, setShowProofModal] = useState(false);
    const [proofLoading, setProofLoading] = useState(false);
    const [proofObjectUrl, setProofObjectUrl] = useState(null);
    const [proofMime, setProofMime] = useState("");
    const [proofTitle, setProofTitle] = useState("Bukti Transaksi");
    const proofUrlRef = useRef(null);

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

        setProofTitle(tipe === "Uang Masuk" ? "Bukti Pembayaran" : "Bukti Pengeluaran");
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

    const handleFocusProperti = async () => {
        if (propertiOptions.length > 0 || loadingProperti) return;
        try {
            setLoadingProperti(true);
            const response = await getProperti({ limit: 200 });
            const options = (response?.data || []).map((item) => ({
                value: item.id,
                label: item.nama,
            }));
            setPropertiOptions(options);
        } catch {
            setPropertiOptions([]);
        } finally {
            setLoadingProperti(false);
        }
    };

    const handleTampilkan = async () => {
        setHasSearched(true);

        if (!startDate || !endDate) {
            setError("Silakan pilih tanggal mulai dan tanggal akhir.");
            setRecords([]);
            return;
        }

        if (new Date(endDate) < new Date(startDate)) {
            setError("Tanggal akhir tidak boleh lebih kecil dari tanggal mulai.");
            setRecords([]);
            return;
        }

        if (!selectedProperti) {
            setError("Silakan pilih properti.");
            setRecords([]);
            return;
        }

        try {
            setLoading(true);
            setError("");
            const response = await getLaporanArusKas({
                startDate,
                endDate,
                idProperti: selectedProperti.value,
            });
            setRecords(response?.data || []);
        } catch (err) {
            setError(err?.message || "Gagal memuat laporan arus kas.");
            setRecords([]);
        } finally {
            setLoading(false);
        }
    };

    const handleExportPdf = async () => {
        if (!startDate || !endDate) {
            setError("Silakan pilih tanggal mulai dan tanggal akhir.");
            return;
        }

        if (new Date(endDate) < new Date(startDate)) {
            setError("Tanggal akhir tidak boleh lebih kecil dari tanggal mulai.");
            return;
        }

        if (!selectedProperti) {
            setError("Silakan pilih properti.");
            setRecords([]);
            return;
        }

        try {
            setLoadingPdf(true);
            setError("");
            await exportPdfArusKas({
                startDate,
                endDate,
                idProperti: selectedProperti?.value || undefined,
            });
        } catch (err) {
            setError(err?.message || "Gagal mengexport laporan arus kas ke PDF.");
        } finally {
            setLoadingPdf(false);
        }
    };

    const totalUangMasuk = records
        .filter((item) => item.tipe === "Uang Masuk")
        .reduce((sum, item) => sum + Number(item.totalBayar || 0), 0);

    const totalUangKeluar = records
        .filter((item) => item.tipe === "Uang Keluar")
        .reduce((sum, item) => sum + Number(item.totalBayar || 0), 0);

    const saldoAkhir = totalUangMasuk - totalUangKeluar;

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h2>Laporan Arus Kas</h2>
                <p className={styles.subtitle}>Ringkasan pemasukan dan pengeluaran properti.</p>
            </div>

            <div className={styles.filterCard}>
                <div className={styles.filterGrid}>
                    <div className={styles.field}>
                        <label htmlFor="startDate">Tanggal Mulai *</label>
                        <input
                            id="startDate"
                            type="date"
                            className="form-control"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                    <div className={styles.field}>
                        <label htmlFor="endDate">Tanggal Akhir *</label>
                        <input
                            id="endDate"
                            type="date"
                            className="form-control"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                    <div className={styles.field}>
                        <label>Properti *</label>
                        <Select
                            placeholder={loadingProperti ? "Memuat properti..." : "Pilih properti"}
                            options={propertiOptions}
                            value={selectedProperti}
                            isClearable
                            isSearchable
                            onFocus={handleFocusProperti}
                            onChange={setSelectedProperti}
                            styles={selectStyles}
                            noOptionsMessage={() =>
                                loadingProperti ? "Memuat..." : "Tidak ada properti"
                            }
                        />
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
                        <button
                            type="button"
                            className="btn btn-success"
                            onClick={handleExportPdf}
                            disabled={loading || loadingPdf || !hasSearched}
                        >
                            {loadingPdf ? "Membuat PDF..." : "📥 Export PDF"}
                        </button>
                    </div>
                </div>
            </div>

            <div className={styles.tableCard}>
                {loading && <div className={styles.stateText}>Memuat data laporan arus kas...</div>}

                {!loading && error && <div className={styles.errorText}>{error}</div>}

                {!loading && !error && !hasSearched && (
                    <div className={styles.stateText}>
                        Pilih periode dan properti (opsional), lalu klik tombol Tampilkan.
                    </div>
                )}

                {!loading && !error && hasSearched && records.length === 0 && (
                    <div className={styles.stateText}>Belum ada data arus kas.</div>
                )}

                {!loading && !error && hasSearched && records.length > 0 && (
                    <div className="table-responsive">
                        <table className={`table table-hover align-middle ${styles.table}`}>
                            <thead>
                                <tr>
                                    <th>Tanggal</th>
                                    <th>Tipe</th>
                                    <th>Nama</th>
                                    <th>Keterangan</th>
                                    <th>Properti</th>
                                    <th>Nama Kamar</th>
                                    <th>Nama Penyewa</th>
                                    <th className="text-center">Bukti</th>
                                    <th className="text-end">Jumlah</th>
                                </tr>
                            </thead>
                            <tbody>
                                {records.map((item) => (
                                    <tr key={item.id}>
                                        <td>{formatTanggal(item.tanggalBayar)}</td>
                                        <td>
                                            {item.tipe || "-"}
                                        </td>
                                        <td>
                                            <div>{item.deskripsiTagihan?.nama || "-"}</div>
                                        </td>
                                        <td className={styles.namaCol}>
                                            {item.keterangan || "-"}
                                        </td>
                                        <td>{item.properti?.nama || "-"}</td>
                                        <td>{item.kamar?.nama || "-"}</td>
                                        <td>{item.penyewa?.nama || "-"}</td>

                                        <td className="text-center">
                                            {item.bukti ? (
                                                <button
                                                    type="button"
                                                    className={styles.proofButton}
                                                    onClick={() => handleViewProof(item.bukti, item.tipe)}
                                                    title={
                                                        item.tipe === "Uang Masuk"
                                                            ? "Lihat bukti pembayaran"
                                                            : "Lihat bukti pengeluaran"
                                                    }
                                                >
                                                    <FileText size={16} strokeWidth={2} />
                                                </button>
                                            ) : (
                                                "-"
                                            )}
                                        </td>
                                        <td className={`text-end ${styles.amountCol}`}>
                                            {formatRupiah(item.totalBayar)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

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

            {hasSearched && records.length > 0 && (
                <div className={styles.footerPlain}>
                    <table className={styles.summaryTable}>
                        <tbody>
                            <tr>
                                <td className={styles.positive}>Total Uang Masuk:</td>
                                <td className={`${styles.summaryRight} ${styles.positive}`}>
                                    {formatRupiah(totalUangMasuk)}
                                </td>
                            </tr>

                            <tr>
                                <td className={styles.negative}>Total Uang Keluar:</td>
                                <td className={`${styles.summaryRight} ${styles.negative}`}>
                                    {formatRupiah(totalUangKeluar)}
                                </td>
                            </tr>

                            <tr className={styles.summarySeparator}>
                                <td colSpan="2">
                                    <div className={styles.footerLine}></div>
                                </td>
                            </tr>

                            <tr>
                                <td>Saldo Akhir:</td>
                                <td
                                    className={`${styles.summaryRight} ${saldoAkhir >= 0 ? styles.positive : styles.negative
                                        }`}
                                >
                                    {formatRupiah(saldoAkhir)}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default LaporanArusKas;
