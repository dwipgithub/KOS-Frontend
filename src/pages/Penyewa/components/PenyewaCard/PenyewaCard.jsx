import { useNavigate } from "react-router-dom";
import styles from "./PenyewaCard.module.css";

const PenyewaCard = ({ card, index }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        console.log("🔍 Card clicked - Navigating to kamar:", card.routeId || card.id);
        
        const routeId = card.routeId || card.id;

        if (!routeId) {
            console.error("❌ ERROR: Card ID is not defined!", card);
            return;
        }

        navigate(`/penyewa-pengelolaan/${routeId}`);
    };

    return (
        <div className="col-md-4 mb-4">
            <div
                className={styles.card}
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={handleClick}
                role="presentation"
            >
                {/* HEADER */}
                <div className={styles.header}>
                    <div className={styles.avatar}>
                        {card.jenisKelamin?.nama === "Laki-Laki" ? "👨" : "👩"}
                    </div>

                    <div>
                        <h3 className={styles.title}>{card.nama}</h3>
                        <span className={styles.badge}>
                            {card.jenisKelamin?.nama}
                        </span>
                    </div>
                </div>

                {/* BODY */}
                <div className={styles.body}>

                    <div className={styles.infoItem}>
                        📞 <span>{card.noTelp || "-"}</span>
                    </div>

                    <div className={styles.infoItem}>
                        📧 <span>{card.email || "-"}</span>
                    </div>

                    <div className={styles.infoItem}>
                        📍 <span>{card.alamat || "-"}</span>
                    </div>

                    <div className={styles.infoItem}>
                        🪪 
                        <span>
                            {card.pengenal?.noPengenal} - {card.pengenal?.id}
                        </span>
                    </div>

                    <div className={styles.infoItem}>
                        💍 <span>{card.statusPernikahan?.nama}</span>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default PenyewaCard;