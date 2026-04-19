import { useNavigate } from "react-router-dom";
import styles from "./PropertiCard.module.css";

const PropertiCard = ({ card, index }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        const routeId = card.routeId || card.id;
        if (!routeId) {
            console.error("❌ ERROR: Card ID is not defined!", card);
            return;
        }


        navigate(`/properti-pengelolaan/${routeId}`);
    };

    const formatAlamat = (card) => {
        return [
            card.alamat,
            card.kelurahan?.nama,
            card.kecamatan?.nama,
            card.kabKota?.nama,
            card.provinsi?.nama,
        ]
            .filter(Boolean)
            .join(", ");
    };

    return (
        <div className="col-md-4 mb-4">
            <div
                className={styles.card}
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={handleClick}
                role="presentation"
            >
                <div className={styles.header}>
                    <div className={styles.icon}>🏠</div>
                    <h3 className={styles.title}>{card.nama}</h3>
                </div>

                <div className={styles.info}>
                    <div className={styles.infoItem}>
                        <span>{formatAlamat(card)}</span>
                    </div>

                    <div className={styles.infoItem}>
                        <span>{card.noTelp}</span>
                    </div>

                    <div className={styles.infoItem}>
                        <span className={styles.kamar}>
                            {card.kamar?.length || 0} Kamar
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PropertiCard;