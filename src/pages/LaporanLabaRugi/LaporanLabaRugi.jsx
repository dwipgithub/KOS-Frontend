import { useMemo, useState } from "react";
import Select from "react-select";
import { getLaporanLabaRugi } from "../../services/laporanLabaRugi";
import { getProperti } from "../../services/propertiService";
import styles from "./LaporanLabaRugi.module.css";

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

const SummaryCard = ({ label, value, tone = "neutral" }) => (
    <div className={`${styles.summaryCard} ${styles[`summary${tone}`] || ""}`}>
        <span className={styles.summaryLabel}>{label}</span>
        <strong className={styles.summaryValue}>{formatRupiah(value)}</strong>
    </div>
);

const DetailSection = ({ title, rows, total, totalLabel }) => (
    <section className={styles.detailCard}>
        <div className={styles.detailHead}>
            <h4>{title}</h4>
        </div>
        <div className="table-responsive">
            <table className={`table align-middle ${styles.detailTable}`}>
                <thead>
                    <tr>
                        <th>Keterangan</th>
                        <th className="text-end">Jumlah</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((item) => (
                        <tr key={item.id || item.nama}>
                            <td>{item.nama || "-"}</td>
                            <td className="text-end">{formatRupiah(item.total)}</td>
                        </tr>
                    ))}
                    <tr className={styles.totalRow}>
                        <td>{totalLabel}</td>
                        <td className="text-end">{formatRupiah(total)}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </section>
);

const LaporanLabaRugi = () => {
    const [loading, setLoading] = useState(false);
    const [loadingProperti, setLoadingProperti] = useState(false);
    const [error, setError] = useState("");
    const [hasSearched, setHasSearched] = useState(false);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [selectedProperti, setSelectedProperti] = useState(null);
    const [propertiOptions, setPropertiOptions] = useState([]);
    const [report, setReport] = useState(null);

    const labaTone = useMemo(() => {
        const laba = Number(report?.labaBersih || 0);
        if (laba > 0) return "Profit";
        if (laba < 0) return "Loss";
        return "Neutral";
    }, [report]);

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
            const response = await getLaporanLabaRugi({
                startDate,
                endDate,
                idProperti: selectedProperti?.value || undefined,
            });
            setReport(response?.data || null);
        } catch (err) {
            setError(err?.message || "Gagal memuat laporan laba rugi.");
            setReport(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h2>Laporan Laba Rugi</h2>
                <p className={styles.subtitle}>
                    Ringkasan pendapatan dan pengeluaran sebagai dasar analisis profitabilitas.
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
                            disabled={loading}
                        >
                            {loading ? "⏳ Memuat..." : "🔍 Tampilkan"}
                        </button>
                    </div>
                </div>
            </section>

            {loading ? <div className={styles.stateText}>Memuat data laporan laba rugi...</div> : null}
            {!loading && error ? <div className={styles.errorText}>{error}</div> : null}

            {!loading && !error && !hasSearched ? (
                <div className={styles.stateText}>
                    Pilih periode dan properti (opsional), lalu klik tombol Cari.
                </div>
            ) : null}

            {!loading && !error && hasSearched && !report ? (
                <div className={styles.stateText}>Belum ada data laba rugi pada periode ini.</div>
            ) : null}

            {!loading && !error && hasSearched && report ? (
                <>
                    <section className={styles.summaryGrid}>
                        <SummaryCard
                            label="Total Pendapatan"
                            value={report?.pendapatan?.total}
                            tone="Income"
                        />
                        <SummaryCard
                            label="Total Pengeluaran"
                            value={report?.pengeluaran?.total}
                            tone="Expense"
                        />
                        <SummaryCard label="Laba Bersih" value={report?.labaBersih} tone={labaTone} />
                    </section>

                    <DetailSection
                        title="Pendapatan"
                        rows={report?.pendapatan?.rincian || []}
                        total={report?.pendapatan?.total || 0}
                        totalLabel="Total Pendapatan"
                    />

                    <DetailSection
                        title="Pengeluaran"
                        rows={report?.pengeluaran?.rincian || []}
                        total={report?.pengeluaran?.total || 0}
                        totalLabel="Total Pengeluaran"
                    />

                    <section className={styles.detailCard}>
                        <div className={styles.detailHead}>
                            <h4>Laba Bersih</h4>
                        </div>
                        <div className="table-responsive">
                            <table className={`table align-middle ${styles.detailTable}`}>
                                <tbody>
                                    <tr>
                                        <td>Total Pendapatan</td>
                                        <td className="text-end">
                                            {formatRupiah(report?.pendapatan?.total || 0)}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Total Pengeluaran</td>
                                        <td className="text-end">
                                            ({formatRupiah(report?.pengeluaran?.total || 0)})
                                        </td>
                                    </tr>
                                    <tr className={`${styles.totalRow} ${styles.netRow}`}>
                                        <td>Laba Bersih</td>
                                        <td
                                            className={`text-end ${
                                                Number(report?.labaBersih || 0) < 0 ? styles.lossText : styles.incomeText
                                            }`}
                                        >
                                            {formatRupiah(report?.labaBersih || 0)}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>
                </>
            ) : null}
        </div>
    );
};

export default LaporanLabaRugi;
