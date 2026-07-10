import { useNavigate } from "react-router-dom";
import styles from "./KamarCard.module.css";

const KamarCard = ({ card, idx, icon }) => {
    const navigate = useNavigate();

    const handleCardClick = () => {
        const routeId = card.routeId || card.id;

        if (!routeId) {
            console.error("❌ ERROR: Card ID is not defined!", card);
            return;
        }
        
        navigate(`/kamar-pengelolaan/${routeId}`);
    };

    const getStatusClass = (status) => {
        switch (status) {
            case "Tersedia":
                return "bg-success text-white";
            case "Sudah disewa":
                return "bg-danger text-white";
            case "Sudah dipesan":
                return "bg-warning text-dark"; 
            case "Tidak disewakan":
                return styles.bgPurple;
            default:
                return "bg-secondary text-white";
        }
    };

    const isNotRentable = card.bisaDisewakan === 0;

    const toTitleCase = (text = "") => {
        return text
            .toLowerCase()
            .split(" ")
            .filter(Boolean)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    };

    const truncateText = (text, maxLength) => {
        if (!text) return "";

        const formattedText = toTitleCase(text);

        return formattedText.length > maxLength
            ? formattedText.substring(0, maxLength) + "..."
            : formattedText;
    };

    const progress = card.sewa?.tagihan?.progress;

    return (
        <div className="col-md-4 mb-4">
            <div
                className={`${styles.card} ${
                    isNotRentable ? styles.notRentableCard : ""
                }`}
                style={{ animationDelay: `${idx * 100}ms` }}
                onClick={handleCardClick}
            >
                {/* Header */}
                <div className={styles.cardHeader}>
                    <div className={styles.cardHeaderLeft}>
                        <div className={styles.cardIcon}>{icon}</div>

                        <h3 className={styles.cardTitle}>
                            {card.nama}
                        </h3>
                    </div>

                    <div className={styles.cardPrice}>
                        <div className={styles.priceValue}>
                            Rp {card.hargaPerBulan?.toLocaleString("id-ID")}
                        </div>

                        <div className={styles.priceUnit}>
                            / bulan
                        </div>
                    </div>
                </div>

                {/* Info */}
                <div className={styles.cardInfo}>
                    {/* Status Sewa */}
                    <div className={styles.cardStatus}>
                        <span
                            className={`badge ${
                                isNotRentable
                                    ? styles.bgPurple
                                    : getStatusClass(card.statusSewa)
                            }`}
                        >
                            {isNotRentable ? "Tidak disewakan" : card.statusSewa}
                        </span>
                    </div>

                    {/* Nama Penyewa */}
                    <div className={styles.cardTenant}>
                        {card.sewa !== null ? (
                            <>
                                <span className={styles.tenantIcon}>👤</span>
                                <span className={styles.tenantName}>
                                    {truncateText(card.sewa.penyewa.nama, 21)}
                                </span>
                                <span className={styles.tenantSeparator}>•</span>
                                <span className={styles.tenantPhone}>
                                    📞 {card.sewa.penyewa.noTelp}
                                </span>
                            </>
                        ) : (
                            <span className={styles.emptyTenant}>
                                Tidak ada penyewa
                            </span>
                        )}
                    </div>

                    {card.sewa && (
                        <div className={styles.cardPeriod}>
                            <div className={styles.periodLeft}>
                                <span className={styles.periodIcon}>📅</span>
                                <span className={styles.periodText}>
                                    {new Date(card.sewa.tagihan.tanggalMasuk).toLocaleDateString("id-ID", {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                    })}
                                </span>

                                <span className={styles.periodArrow}>→</span>

                                <span className={styles.periodText}>
                                    {new Date(card.sewa.tagihan.tanggalKeluar).toLocaleDateString("id-ID", {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                    })}
                                </span>
                            </div>
                            {card.sewa?.tagihan?.status && (
                                <span className={styles.paymentStatus}>
                                    💰 {card.sewa.tagihan.status}
                                </span>
                            )}
                        </div>
                    )}

                    {progress && (
                        <div className={styles.progressWrapper}>

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

                                <span>
                                    {progress.elapsedDays} / {progress.totalDays} hari
                                </span>

                                <span>
                                    {progress.remainingDays > 0
                                        ? `${progress.remainingDays} hari lagi`
                                        : "Selesai"}
                                </span>

                            </div>

                        </div>
                    )}

                    {card.sewa?.isSewaKadaluarsa && (
                        <div className={styles.expiredAlert}>
                            <div className={styles.expiredIcon}>
                                ⚠️
                            </div>

                            <div className={styles.expiredContent}>
                                <div className={styles.expiredTitle}>
                                    Masa sewa berakhir
                                </div>

                                <div className={styles.expiredSubtitle}>
                                    Terlambat{" "}
                                    <strong>
                                        {card.sewa.hariTerlambat} hari
                                    </strong>
                                </div>
                            </div>
                        </div>
                    )}

                    {card.sewa?.notifikasi && (
                        <div
                            className={`${styles.notificationText} ${
                                card.sewa.notifikasi.jenis === "OVERDUE"
                                    ? styles.notificationDanger
                                    : styles.notificationWarning
                            }`}
                        >
                            <span className={styles.notificationEmoji}>
                                {card.sewa.notifikasi.jenis === "OVERDUE"
                                    ? "🚨"
                                    : "⏳"}
                            </span>

                            {card.sewa.notifikasi.pesan}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default KamarCard;