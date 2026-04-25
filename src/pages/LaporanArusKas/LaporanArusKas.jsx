import { useMemo, useState } from "react";
import { getLaporanArusKas } from "../../services/laporanArusKas";
import styles from "./LaporanArusKas.module.css";

const formatTanggal = (isoDate) => {
    if (!isoDate) return "-";

    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) return "-";

    return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
};

const formatRupiah = (amount) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(Number(amount || 0));

const LaporanArusKas = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [records, setRecords] = useState([]);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [hasSearched, setHasSearched] = useState(false);

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

        try {
            setLoading(true);
            setError("");
            const response = await getLaporanArusKas({ startDate, endDate });
            setRecords(response?.data || []);
        } catch (err) {
            setError(err?.message || "Gagal memuat laporan arus kas.");
            setRecords([]);
        } finally {
            setLoading(false);
        }
    };

    const totalMasuk = useMemo(
        () =>
            records
                .filter((item) => item?.tipe === "Uang Masuk")
                .reduce((acc, item) => acc + Number(item?.totalBayar || 0), 0),
        [records]
    );

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h2>Laporan Arus Kas</h2>
                <p className={styles.subtitle}>Ringkasan pemasukan dan pengeluaran properti.</p>
            </div>

            <div className={styles.summaryCard}>
                <span>Total Uang Masuk</span>
                <strong>{formatRupiah(totalMasuk)}</strong>
            </div>

            <div className={styles.filterCard}>
                <div className={styles.filterField}>
                    <label htmlFor="startDate">Tanggal Mulai</label>
                    <input
                        id="startDate"
                        type="date"
                        className="form-control"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                </div>
                <div className={styles.filterField}>
                    <label htmlFor="endDate">Tanggal Akhir</label>
                    <input
                        id="endDate"
                        type="date"
                        className="form-control"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </div>
                <div className={styles.filterButtonWrap}>
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleTampilkan}
                        disabled={loading}
                    >
                        {loading ? "Memuat..." : "Tampilkan"}
                    </button>
                </div>
            </div>

            <div className={styles.tableCard}>
                {loading && <div className={styles.stateText}>Memuat data laporan arus kas...</div>}

                {!loading && error && <div className={styles.errorText}>{error}</div>}

                {!loading && !error && !hasSearched && (
                    <div className={styles.stateText}>
                        Pilih periode tanggal lalu klik tombol Tampilkan.
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
                                    <th>Nama</th>
                                    <th>Properti</th>
                                    <th>Nama Kamar</th>
                                    <th>Nama Penyewa</th>
                                    <th>Tipe</th>
                                    <th>Keterangan</th>
                                    <th className="text-end">Jumlah</th>
                                </tr>
                            </thead>
                            <tbody>
                                {records.map((item) => (
                                    <tr key={item.id}>
                                        <td>{formatTanggal(item.tanggalBayar)}</td>
                                        <td className={styles.namaCol}>
                                            {item.nama || `Pembayaran Tagihan ${item.idTagihan || item.id}`}
                                        </td>
                                        <td>{item.properti?.nama || "-"}</td>
                                        <td>{item.kamar?.nama || "-"}</td>
                                        <td>{item.penyewa?.nama || "-"}</td>
                                        <td>
                                            <span
                                                className={`${styles.badge} ${
                                                    item.tipe === "Uang Masuk"
                                                        ? styles.badgeIn
                                                        : styles.badgeOut
                                                }`}
                                            >
                                                {item.tipe || "-"}
                                            </span>
                                        </td>
                                        <td>
                                            <div>{item.deskripsiTagihan?.id || "-"}</div>
                                            <small className="text-muted">
                                                {item.deskripsiTagihan?.nama || "-"} |{" "}
                                                {item.metodeBayar?.nama || "-"}
                                            </small>
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
        </div>
    );
};

export default LaporanArusKas;
