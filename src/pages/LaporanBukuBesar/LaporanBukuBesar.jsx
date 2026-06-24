import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import { FileText, X } from "lucide-react";
import { getProperti } from "../../services/propertiService";
import { getLaporanBukuBesar, exportPdfBukuBesar } from "../../services/laporanBukuBesar";
import { fetchPrivateFileBlob } from "../../services/penyewaService";
import styles from "./LaporanBukuBesar.module.css";

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

const formatRupiah = (amount) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(Number(amount || 0));

const formatTanggal = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    }).format(date);
};

const selectStyles = {
    control: (base, state) => ({
        ...base,
        minHeight: 40,
        borderColor: state.isFocused ? "#7c3aed" : "#d1d5db",
        boxShadow: state.isFocused ? "0 0 0 3px rgba(124,58,237,0.15)" : "none",
        borderRadius: 10,
        "&:hover": { borderColor: "#7c3aed" },
    }),
    menu: (base) => ({ ...base, zIndex: 30 }),
};

const SkeletonCard = () => (
    <div className={styles.akunCard}>
        <div className={styles.skeletonTitle} />
        <div className={styles.skeletonRow} />
        <div className={styles.skeletonRow} />
        <div className={styles.skeletonRow} />
    </div>
);

const LaporanBukuBesar = () => {
    const [startDate, setStartDate] = useState(() => getAwalBulan());
    const [endDate, setEndDate] = useState(() => getAkhirBulan());
    const [selectedProperti, setSelectedProperti] = useState(null);
    const [propertiOptions, setPropertiOptions] = useState([]);
    const [loadingProperti, setLoadingProperti] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingPdf, setLoadingPdf] = useState(false);
    const [error, setError] = useState("");
    const [hasSearched, setHasSearched] = useState(false);
    const [report, setReport] = useState(null);

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

    const handleViewProof = async (bukti, jenis) => {
        if (!bukti) return;

        setProofTitle(jenis === "PENDAPATAN" ? "Bukti Pembayaran" : "Bukti Pengeluaran");
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

    const handleCari = async () => {
        setHasSearched(true);
        if (!startDate || !endDate) {
            setError("Silakan pilih tanggal mulai dan tanggal akhir.");
            setReport(null);
            return;
        }

        if (new Date(endDate) < new Date(startDate)) {
            setError("Tanggal akhir tidak boleh lebih kecil dari tanggal mulai.");
            setReport(null);
            return;
        }

        if (!selectedProperti) {
            setError("Silakan pilih properti.");
            setReport(null);
            return;
        }

        try {
            setLoading(true);
            setError("");
            const response = await getLaporanBukuBesar({
                startDate,
                endDate,
                idProperti: selectedProperti?.value || undefined,
            });
            setReport(response?.data || null);
        } catch (err) {
            setError(err?.message || "Gagal memuat laporan buku besar.");
            setReport(null);
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
            setReport(null);
            return;
        }

        try {
            setLoadingPdf(true);
            setError("");
            await exportPdfBukuBesar({ startDate, endDate, idProperti: selectedProperti?.value || undefined });
        } catch (err) {
            setError(err?.message || "Gagal mengexport laporan buku besar ke PDF.");
        } finally {
            setLoadingPdf(false);
        }
    };

    const totals = useMemo(() => {
        const akunList = report?.data || [];
        let totalDebit = 0;
        let totalKredit = 0;
        akunList.forEach((akunItem) => {
            (akunItem.transaksi || []).forEach((trx) => {
                totalDebit += Number(trx.debit || 0);
                totalKredit += Number(trx.kredit || 0);
            });
        });
        return {
            totalDebit,
            totalKredit,
            netBalance: totalDebit - totalKredit,
        };
    }, [report]);

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h2>Laporan Buku Besar</h2>
                <p className={styles.subtitle}>
                    Ringkasan transaksi per akun untuk pemantauan debit, kredit, dan saldo berjalan.
                </p>
            </div>

            <section className={styles.filterCard}>
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
                            onClick={handleCari}
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
            </section>

            {loading ? (
                <>
                    <SkeletonCard />
                    <SkeletonCard />
                </>
            ) : null}

            {!loading && error ? <div className={styles.errorText}>{error}</div> : null}

            {!loading && !error && !hasSearched ? (
                <div className={styles.stateText}>
                    Pilih periode dan properti (opsional), lalu klik tombol Tampilkan.
                </div>
            ) : null}

            {!loading && !error && hasSearched && (!report || (report.data || []).length === 0) ? (
                <div className={styles.stateText}>Tidak ada data buku besar pada periode ini.</div>
            ) : null}

            {!loading && !error && hasSearched && report && (report.data || []).length > 0 ? (
                <>
                    {(report.data || []).map((akunItem) => (
                        <section key={akunItem.akun?.id || akunItem.akun?.nama} className={styles.akunCard}>
                            <div className={styles.akunHead}>
                                <h4>AKUN: {akunItem.akun?.nama || "-"}</h4>
                            </div>
                            <div className="table-responsive">
                                <table className={`table table-hover align-middle ${styles.table}`}>
                                    <colgroup>
                                        <col style={{ width: "11%" }} />
                                        <col style={{ width: "24%" }} />
                                        <col style={{ width: "18%" }} />
                                        <col style={{ width: "8%" }} />
                                        <col style={{ width: "13%" }} />
                                        <col style={{ width: "13%" }} />
                                        <col style={{ width: "13%" }} />
                                    </colgroup>
                                    <thead>
                                        <tr>
                                            <th>Tanggal</th>
                                            <th>Keterangan</th>
                                            <th>Kategori</th>
                                            <th className="text-center">Bukti</th>
                                            <th className="text-end">Debit</th>
                                            <th className="text-end">Kredit</th>
                                            <th className="text-end">Saldo</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(akunItem.transaksi || []).map((trx, idx) => (
                                            <tr key={`${akunItem.akun?.id || "akun"}-${idx}`}>
                                                <td>{formatTanggal(trx.tanggal)}</td>
                                                <td>{trx.keterangan || "-"}</td>
                                                <td>
                                                    <div className={styles.kategoriWrap}>
                                                        <span>{trx.kategori?.nama || "-"}</span>
                                                        {/* <span
                                                            className={`${styles.badge} ${trx.kategori?.jenis === "PENDAPATAN"
                                                                ? styles.badgeIncome
                                                                : styles.badgeExpense
                                                                }`}
                                                        >
                                                            {trx.kategori?.jenis || "-"}
                                                        </span> */}
                                                    </div>
                                                </td>
                                                <td className="text-center">
                                                    {trx.bukti ? (
                                                        <button
                                                            type="button"
                                                            className={styles.proofButton}
                                                            onClick={() =>
                                                                handleViewProof(
                                                                    trx.bukti,
                                                                    trx.kategori?.jenis
                                                                )
                                                            }
                                                            title={
                                                                trx.kategori?.jenis === "PENDAPATAN"
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
                                                <td className="text-end">
                                                    {Number(trx.debit || 0) > 0 ? formatRupiah(trx.debit) : "-"}
                                                </td>
                                                <td className="text-end">
                                                    {Number(trx.kredit || 0) > 0 ? formatRupiah(trx.kredit) : "-"}
                                                </td>
                                                <td
                                                    className={`text-end ${Number(trx.saldo || 0) < 0 ? styles.negative : ""
                                                        }`}
                                                >
                                                    {formatRupiah(trx.saldo)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    ))}

                    <section className={styles.summaryCard}>
                        <div className={styles.summaryHeader}>
                            RINGKASAN LAPORAN
                        </div>

                        <div className={styles.summaryBody}>
                            <table className={styles.summaryTable}>
                                <tbody>
                                    <tr>
                                        <td>Total Debit</td>
                                        <td className={styles.summaryRight}>
                                            {formatRupiah(totals.totalDebit)}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td>Total Kredit</td>
                                        <td className={styles.summaryRight}>
                                            {formatRupiah(totals.totalKredit)}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td>Net Balance</td>
                                        <td
                                            className={`${styles.summaryRight} ${
                                                totals.netBalance < 0 ? styles.negative : styles.positive
                                            }`}
                                        >
                                            {formatRupiah(totals.netBalance)}
                                        </td>
                                    </tr>

                                    <tr className={styles.summarySeparator}>
                                        <td colSpan="2"></td>
                                    </tr>
                                    
                                    <tr>
                                        <td>Jumlah Akun</td>
                                        <td className={styles.summaryRight}>{report?.totalAkun || 0}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>
                </>
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
        </div>
    );
};

export default LaporanBukuBesar;