import { useMemo, useState } from "react";
import { getLaporanMutasiKasOperasional, exportPdfMutasiKasOperasional } from "../../services/laporanMutasiKasOperasional";
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
    const [report, setReport] = useState(null);
    const [loadingPdf, setLoadingPdf] = useState(false);

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
            const response = await getLaporanMutasiKasOperasional({ startDate, endDate });
            setReport(response?.data || null);
        } catch (err) {
            setError(err?.message || "Gagal memuat laporan mutasi kas operasional.");
            setReport(null);
        } finally {
            setLoading(false);
        }
    };

    const handleExportPdf = async () => {

        if (!startDate || !endDate) {
            setError("Silakan pilih tanggal mulai dan tanggal selesai.");
            return;
        }
    
        if (new Date(endDate) < new Date(startDate)) {
            setError("Tanggal selesai tidak boleh lebih kecil dari tanggal mulai.");
            return;
        }
    
        try {
            setLoadingPdf(true);
            setError("");
    
            await exportPdfMutasiKasOperasional({
                startDate,
                endDate
            });
    
        } catch (err) {
            setError(
                err?.message ||
                "Gagal mengexport laporan mutasi kas operasional ke PDF."
            );
        } finally {
            setLoadingPdf(false);
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h2>Laporan Mutasi Kas Operasional</h2>
                <p className={styles.subtitle}>
                    Rekapitulasi mutasi kas operasional (masuk dan keluar) per periode.
                </p>
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
                                    <th>Nama Properti</th>
                                    <th>Masuk</th>
                                    <th>Keluar</th>
                                    <th>Saldo</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((item) => (
                                    <tr key={item.id}>
                                        <td>{formatTanggal(item.tanggalMutasiKas)}</td>
                                        <td className={styles.keteranganCol}>{item.keterangan || "-"}</td>
                                        <td>{item.properti?.nama || "-"}</td>
                                        <td className={styles.masukCol}>{formatMasukKeluar(item.masuk)}</td>
                                        <td className={styles.keluarCol}>{formatMasukKeluar(item.keluar)}</td>
                                        <td className={styles.saldoCol}>{formatRupiah(item.saldo)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : null}
            </section>
        </div>
    );
};

export default LaporanMutasiKasOperasional;
