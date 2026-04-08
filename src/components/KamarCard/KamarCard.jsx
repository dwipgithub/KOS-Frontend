import { useNavigate } from "react-router-dom";
import styles from "./KamarCard.module.css";

const KamarCard = ({ card, idx, icon }) => {
    const navigate = useNavigate();

    const handleCardClick = () => {
        console.log("🔍 Card clicked - Navigating to kamar:", card.id);
        
        if (!card.id) {
            console.error("❌ ERROR: Card ID is not defined!", card);
            return;
        }
        
        navigate(`/kamar/${card.id}/pengelolaan`);
    };

    const getStatusClass = (status) => {
        switch (status) {
            case "Tersedia":
                return "bg-success text-white";
            case "Sudah disewa":
                return "bg-danger text-white";
            case "Sudah dipesan":
                return "bg-warning text-dark"; // ⬅️ ini penting
            default:
                return "bg-secondary text-white";
        }
    };

    return (
        <div className="col-md-4 mb-4">
            <div
                className={styles.card}
                style={{ animationDelay: `${idx * 100}ms` }}
                onClick={handleCardClick}
            >
                {/* Status Bersih/Kotor */}
                <div
                    className={styles.statusBadge}
                    style={{
                        background:
                            card.statusKamar?.nama === "Bersih"
                                ? "#42865e"
                                : "#e74c3c",
                    }}
                >
                    {card.statusKamar?.nama}
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
                        <span className={`badge ${getStatusClass(card.statusSewa)}`}>
                            {card.statusSewa}
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