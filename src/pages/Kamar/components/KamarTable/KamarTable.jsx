import { useNavigate } from "react-router-dom";
import styles from "./KamarTable.module.css";

const toTitleCase = (text = "") => {
    return text
        .toLowerCase()
        .split(" ")
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
};

const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const formatMoney = (value) => {
    if (typeof value !== "number") return "-";
    return `Rp ${value.toLocaleString("id-ID")}`;
};

const getStatusBadgeClass = (status, isNotRentable) => {
    if (isNotRentable) {
        return `${styles.statusBadge} ${styles.statusPurple}`;
    }

    switch (status) {
        case "Tersedia":
            return `${styles.statusBadge} ${styles.statusSuccess}`;
        case "Sudah disewa":
            return `${styles.statusBadge} ${styles.statusDanger}`;
        case "Sudah dipesan":
            return `${styles.statusBadge} ${styles.statusWarning}`;
        default:
            return `${styles.statusBadge} ${styles.statusSecondary}`;
    }
};

const KamarTable = ({ kamarList }) => {
    const navigate = useNavigate();

    const handleRowClick = (card) => {
        const routeId = card.routeId || card.id;
        if (!routeId) {
            console.error("❌ ERROR: Card ID is not defined!", card);
            return;
        }
        navigate(`/kamar-pengelolaan/${routeId}`);
    };

    if (!kamarList || kamarList.length === 0) {
        return (
            <div className={styles.noData}>Data kamar tidak ditemukan</div>
        );
    }

    return (
        <div className={styles.tableWrapper}>
            <div className="table-responsive">
                <table className={`table table-hover align-middle ${styles.table}`}>
                    <thead>
                        <tr>
                            <th scope="col">No</th>
                            <th scope="col">Nama Kamar</th>
                            <th scope="col">Harga / Bulan</th>
                            <th scope="col">Status</th>
                            <th scope="col">Penyewa</th>
                            <th scope="col">Periode</th>
                            <th scope="col">Tagihan</th>
                            <th scope="col">Progress Sewa</th>
                            <th scope="col">Notifikasi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {kamarList.map((card, idx) => {
                            const isNotRentable = card.bisaDisewakan === 0;
                            const statusText = isNotRentable
                                ? "Tidak disewakan"
                                : card.statusSewa || "-";
                            const tenantName = card.sewa?.penyewa?.nama
                                ? toTitleCase(card.sewa.penyewa.nama)
                                : "-";
                            const tenantPhone = card.sewa?.penyewa?.noTelp || "";
                            const periode = card.sewa?.tagihan?.tanggalMasuk
                                ? `${formatDate(card.sewa.tagihan.tanggalMasuk)} → ${formatDate(card.sewa.tagihan.tanggalKeluar)}`
                                : "-";
                            const tagihanStatus = card.sewa?.tagihan?.status || "-";
                            const progress = card.sewa?.tagihan?.progress;
                            const notificationText = card.sewa?.isSewaKadaluarsa
                                ? `Masa sewa berakhir • Terlambat ${card.sewa.hariTerlambat || 0} hari`
                                : card.sewa?.notifikasi
                                    ? `${card.sewa.notifikasi.jenis === "OVERDUE" ? "🚨" : "⏳"} ${card.sewa.notifikasi.pesan}`
                                    : "-";

                            return (
                                <tr
                                    key={card.id || idx}
                                    className={styles.clickableRow}
                                    onClick={() => handleRowClick(card)}
                                >
                                    <th scope="row">{idx + 1}</th>
                                    <td>{card.nama || "-"}</td>
                                    <td>{formatMoney(card.hargaPerBulan)}</td>
                                    <td>
                                        <span className={getStatusBadgeClass(statusText, isNotRentable)}>
                                            {statusText}
                                        </span>
                                    </td>
                                    <td>
                                        {tenantName}
                                        {tenantPhone ? ` • ${tenantPhone}` : ""}
                                    </td>
                                    <td>{periode}</td>
                                    <td>{tagihanStatus}</td>
                                    <td>
                                        {progress ? (
                                            <div className={styles.progressContainer}>
                                                <div className={styles.progressBar}>
                                                    <div
                                                        className={styles.progressFill}
                                                        style={{
                                                            width: `${progress.percent}%`,
                                                            backgroundColor:
                                                                progress.color === "danger"
                                                                    ? "#ef4444"
                                                                    : progress.color === "warning"
                                                                    ? "#f59e0b"
                                                                    : "#22c55e"
                                                        }}
                                                    />
                                                </div>
                                                <div className={styles.progressInfo}>
                                                    <span className={styles.progressDays}>
                                                        {progress.elapsedDays} / {progress.totalDays} hari
                                                    </span>
                                                    <span className={styles.progressRemaining}>
                                                        {progress.remainingDays > 0
                                                            ? `${progress.remainingDays} hari lagi`
                                                            : "Selesai"}
                                                    </span>
                                                </div>
                                            </div>
                                        ) : (
                                            "-"
                                        )}
                                    </td>
                                    <td>
                                        <span className={styles.notificationText}>{notificationText}</span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default KamarTable;
