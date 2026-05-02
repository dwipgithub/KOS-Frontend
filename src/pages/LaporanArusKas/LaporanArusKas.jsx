import { useState } from "react";
import Select from "react-select";
import { getLaporanArusKas, exportPdfArusKas } from "../../services/laporanArusKas";
import { getProperti } from "../../services/propertiService";
import styles from "./LaporanArusKas.module.css";

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
        borderColor: state.isFocused ? "#ff8c00" : "#d1d5db",
        boxShadow: state.isFocused ? "0 0 0 3px rgba(255, 140, 0, 0.15)" : "none",
        borderRadius: 10,
        "&:hover": { borderColor: "#ff8c00" },
    }),
    menu: (base) => ({ ...base, zIndex: 30 }),
};

const LaporanArusKas = () => {
    const [loading, setLoading] = useState(false);
    const [loadingPdf, setLoadingPdf] = useState(false);
    const [error, setError] = useState("");
    const [records, setRecords] = useState([]);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [selectedProperti, setSelectedProperti] = useState(null);
    const [propertiOptions, setPropertiOptions] = useState([]);
    const [loadingProperti, setLoadingProperti] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

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

        try {
            setLoading(true);
            setError("");
            const response = await getLaporanArusKas({
                startDate,
                endDate,
                idProperti: selectedProperti?.value || undefined,
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

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h2>Laporan Arus Kas</h2>
                <p className={styles.subtitle}>Ringkasan pemasukan dan pengeluaran properti.</p>
            </div>

            <div className={styles.filterCard}>
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
                                            {item.nama || (
                                                <>
                                                    Pembayaran Tagihan{" "}
                                                    <small className={styles.subText}>
                                                        {item.idTagihan || item.id}
                                                    </small>
                                                </>
                                            )}
                                        </td>
                                        <td>{item.properti?.nama || "-"}</td>
                                        <td>{item.kamar?.nama || "-"}</td>
                                        <td>{item.penyewa?.nama || "-"}</td>
                                        <td>
                                            {/* <span
                                                className={`${styles.badge} ${
                                                    item.tipe === "Uang Masuk"
                                                        ? styles.badgeIn
                                                        : styles.badgeOut
                                                }`}
                                            > */}
                                                {item.tipe || "-"}
                                            {/* </span> */}
                                        </td>
                                        <td>
                                            <div>{item.deskripsiTagihan?.nama || "-"}</div>
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
