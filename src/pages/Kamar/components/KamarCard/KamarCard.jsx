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

    return (
        <div className="col-md-4 mb-4">
            <div
                className={`${styles.card} ${
                    isNotRentable ? styles.notRentableCard : ""
                }`}
                style={{ animationDelay: `${idx * 100}ms` }}
                onClick={handleCardClick}
            >
                {/* Status Bersih/Kotor */}
                <div className={styles.statusArea}>
                    {!isNotRentable && (
                        <div
                            className={styles.statusBadge}
                            style={{
                                background:
                                    card.statusKamar?.nama === "Bersih"
                                        ? "#2f9e44"
                                        : "#e74c3c",
                            }}
                        >
                            ✨ {card.statusKamar?.nama}
                        </div>
                    )}

                    {isNotRentable && (
                        <div className={styles.hangingRibbon}>
                            <div className={styles.ribbonRing}></div>

                            <div className={styles.ribbonContent}>
                                <div className={styles.ribbonIcon}>🚫</div>

                                <div className={styles.ribbonText}>
                                    NOT
                                    <br />
                                    FOR RENT
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                

                {/* Header */}
                <div className={styles.cardHeader}>
                    <div className={styles.cardIcon}>{icon}</div>
                    <h3 className={styles.cardTitle}>
                        {card.nama} - {card.properti?.nama}
                    </h3>
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
                                    {card.sewa.penyewa.nama}
                                </span>
                                <span className={styles.tenantSeparator}>•</span>
                                <span className={styles.tenantPhone}>
                                    {card.sewa.penyewa.noTelp}
                                </span>
                            </>
                        ) : (
                            <span className={styles.emptyTenant}>
                                Tidak ada penyewa
                            </span>
                        )}
                    </div>

                    {/* Harga */}
                    <div className={styles.cardPrice}>
                        Rp {card.hargaPerBulan?.toLocaleString("id-ID")}
                        <span className={styles.per}> / bulan</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KamarCard;