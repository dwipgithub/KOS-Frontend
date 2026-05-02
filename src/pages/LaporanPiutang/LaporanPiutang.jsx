import { useMemo, useState } from "react";
import Select from "react-select";
import { getLaporanPiutangKas, exportPdfPiutang } from "../../services/laporanPiutang";
import { getProperti } from "../../services/propertiService";
import styles from "./LaporanPiutang.module.css";

const formatRupiah = (amount) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(Number(amount || 0));

const customSelectStyles = {
    control: (base, state) => ({
        ...base,
        minHeight: 40,
        borderColor: state.isFocused ? "#ff8c00" : "#d1d5db",
        boxShadow: state.isFocused ? "0 0 0 3px rgba(255, 140, 0, 0.15)" : "none",
        "&:hover": { borderColor: "#ff8c00" },
        borderRadius: 10,
    }),
    menu: (base) => ({
        ...base,
        zIndex: 30,
    }),
};

const SummaryCard = ({ label, value }) => (
    <div className={styles.summaryCard}>
        <span className={styles.summaryLabel}>{label}</span>
        <strong className={styles.summaryValue}>{formatRupiah(value)}</strong>
    </div>
);

const getStatusBadgeColor = (status) => {
    switch (status) {
        case "BELUM JATUH TEMPO":
            return styles.statusBelumJatuhTempo;
        case "HAMPIR JATUH TEMPO":
            return styles.statusHampirJatuhTempo;
        case "JATUH TEMPO HARI INI":
            return styles.statusJatuhTempoHariIni;
        case "MENUNGGAK":
            return styles.statusMenunggak;
        case "KRITIS":
            return styles.statusKritis;
        default:
            return styles.statusDefault;
    }
};

const StatusBadge = ({ status }) => (
    <span className={`${styles.statusBadge} ${getStatusBadgeColor(status)}`}>
        {status}
    </span>
);

const PenyewaCard = ({ penyewa }) => {
    // Sort detail tagihan by umur (descending)
    const sortedDetail = useMemo(() => {
        return [...(penyewa.detail || [])].sort((a, b) => (b.umur || 0) - (a.umur || 0));
    }, [penyewa.detail]);

    return (
        <div className={styles.penyewaCard}>
            <div className={styles.penyewaHeader}>
                <div className={styles.penyewaInfo}>
                    <h4 className={styles.namaPenyewa}>{penyewa.namaPenyewa}</h4>
                    <p className={styles.totalPiutangText}>
                        Total Piutang: <strong>{formatRupiah(penyewa.totalPiutang)}</strong>
                    </p>
                </div>
                <StatusBadge status={penyewa.status} />
            </div>

            <div className="table-responsive">
                <table className={`table align-middle ${styles.detailTable}`}>
                    <thead>
                        <tr>
                            <th>No Tagihan</th>
                            <th>Tanggal Tagihan</th>
                            <th>Jatuh Tempo</th>
                            <th>Keterangan</th>
                            <th className="text-end">Piutang</th>
                            <th className="text-end">Umur (hari)</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedDetail.length > 0 ? (
                            sortedDetail.map((detail, idx) => (
                                <tr key={idx}>
                                    <td>{detail.noTagihan}</td>
                                    <td>{detail.tanggalTagihan}</td>
                                    <td>{detail.jatuhTempo}</td>
                                    <td>{detail.keterangan}</td>
                                    <td className="text-end">{formatRupiah(detail.piutang)}</td>
                                    <td className={`text-end ${detail.umur > 0 ? styles.umurMerah : ""}`}>
                                        {detail.umur}
                                    </td>
                                    <td>
                                        {detail.status}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="text-center text-muted py-3">
                                    Tidak ada detail tagihan
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const LaporanPiutang = () => {
    const [loading, setLoading] = useState(false);
    const [loadingPdf, setLoadingPdf] = useState(false);
    const [loadingProperti, setLoadingProperti] = useState(false);
    const [error, setError] = useState("");
    const [hasSearched, setHasSearched] = useState(false);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [selectedProperti, setSelectedProperti] = useState(null);
    const [propertiOptions, setPropertiOptions] = useState([]);
    const [report, setReport] = useState(null);

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

        try {
            setLoading(true);
            setError("");
            const response = await getLaporanPiutangKas({
                startDate,
                endDate,
                idProperti: selectedProperti?.value || undefined,
            });
            setReport(response?.data || null);
        } catch (err) {
            setError(err?.message || "Gagal memuat laporan piutang.");
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

        try {
            setLoadingPdf(true);
            setError("");
            await exportPdfPiutang({ 
                startDate, 
                endDate, 
                idProperti: selectedProperti?.value || undefined 
            });
        } catch (err) {
            setError(err?.message || "Gagal mengexport laporan piutang ke PDF.");
        } finally {
            setLoadingPdf(false);
        }
    };

    // Sort penyewa by totalPiutang (descending)
    const sortedData = useMemo(() => {
        if (!report?.data) return [];
        return [...report.data].sort((a, b) => (b.totalPiutang || 0) - (a.totalPiutang || 0));
    }, [report?.data]);

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h2>Laporan Piutang</h2>
                <p className={styles.subtitle}>
                    Ringkasan piutang penyewa yang dikelompokkan per penyewa untuk monitoring dan follow-up.
                </p>
            </div>

            <section className={styles.filterCard}>
                <div className={styles.filterGrid}>
                    <div className={styles.field}>
                        <label htmlFor="startDate">Tanggal Mulai</label>
                        <input
                            id="startDate"
                            type="date"
                            className="form-control"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                    <div className={styles.field}>
                        <label htmlFor="endDate">Tanggal Akhir</label>
                        <input
                            id="endDate"
                            type="date"
                            className="form-control"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                    <div className={styles.field}>
                        <label>Properti (opsional)</label>
                        <Select
                            placeholder={loadingProperti ? "Memuat properti..." : "Pilih properti"}
                            options={propertiOptions}
                            value={selectedProperti}
                            isClearable
                            isSearchable
                            onFocus={handleFocusProperti}
                            onChange={setSelectedProperti}
                            styles={customSelectStyles}
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
                            {loading ? "⏳ Memuat..." : "🔍 Tampilkan"}
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

            {loading ? <div className={styles.stateText}>Memuat data laporan piutang...</div> : null}
            {!loading && error ? <div className={styles.errorText}>{error}</div> : null}

            {!loading && !error && !hasSearched ? (
                <div className={styles.stateText}>
                    Pilih periode dan properti (opsional), lalu klik tombol Tampilkan.
                </div>
            ) : null}

            {!loading && !error && hasSearched && !report ? (
                <div className={styles.stateText}>Tidak ada data piutang pada periode ini.</div>
            ) : null}

            {!loading && !error && hasSearched && report ? (
                <>
                    <section className={styles.summaryGrid}>
                        <SummaryCard
                            label="Total Piutang"
                            value={report?.summary?.totalPiutang}
                        />
                        <SummaryCard
                            label="Total Menunggak"
                            value={report?.summary?.totalMenunggak}
                        />
                        <SummaryCard
                            label="Total Belum Jatuh Tempo"
                            value={report?.summary?.totalBelumJatuhTempo}
                        />
                    </section>

                    <div className={styles.contentContainer}>
                        {sortedData.length > 0 ? (
                            sortedData.map((penyewa, idx) => (
                                <PenyewaCard key={idx} penyewa={penyewa} />
                            ))
                        ) : (
                            <div className={styles.emptyState}>Tidak ada data piutang</div>
                        )}
                    </div>
                </>
            ) : null}
        </div>
    );
};

export default LaporanPiutang;
