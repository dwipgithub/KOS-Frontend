import { useState } from "react";
import BayarModal from "../../../components/BayarModal/BayarModal";
import styles from "./TabTagihan.module.css";
import { CreditCard } from "lucide-react";

const TabTagihan = ({ 
    tagihanList,
    formPembayaran,
    setFormPembayaran,
    onSavePembayaran,
    loading 
}) => {

    // =========================
    // STATE MODAL
    // =========================
    const [showModal, setShowModal] = useState(false);
    const [selectedTagihan, setSelectedTagihan] = useState(null);


    // =========================
    // LOADING
    // =========================
    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loadingContainer}>
                    <div className={styles.spinner}></div>
                    <p>Memuat data tagihan...</p>
                </div>
            </div>
        );
    }

    const tagihanArray = Array.isArray(tagihanList) ? tagihanList : [];

    // =========================
    // EMPTY STATE
    // =========================
    if (tagihanArray.length === 0) {
        return (
            <div className={styles.container}>
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>💰</div>
                    <h3 className={styles.emptyTitle}>Belum Ada Tagihan</h3>
                    <p className={styles.emptySubtitle}>
                        Tidak ada tagihan untuk sewa ini. Semua pembayaran sudah lunas!
                    </p>
                </div>
            </div>
        );
    }

    // =========================
    // TOTAL
    // =========================
    const totalTagihan = tagihanArray.reduce(
        (sum, item) => sum + (parseInt(item.total) || 0),
        0
    );

    // =========================
    // HANDLE BAYAR
    // =========================
    const handleBayar = (tagihan) => {
        setSelectedTagihan(tagihan);

        setShowModal(true);
    };

    const handleSave = async (payload) => {
        const success = await onSavePembayaran(payload);

        if (success) {
            setShowModal(false); // ✅ tutup modal di sini
        }
    };

    return (
        <div className={styles.container}>
            {/* SUMMARY */}
            <div className={styles.summaryGrid}>
                <div className={styles.summaryCard}>
                    <div className={styles.summaryIcon}>💰</div>
                    <div className={styles.summaryContent}>
                        <span className={styles.summaryLabel}>Total Tagihan</span>
                        <span className={styles.summaryValue}>
                            Rp {parseInt(totalTagihan).toLocaleString("id-ID")}
                        </span>
                    </div>
                </div>
            </div>

            {/* LIST */}
            <div className={styles.tagihanListContainer}>
                <div className={styles.listHeader}>
                    <h3 className={styles.listTitle}>📋 Daftar Tagihan</h3>
                    <span className={styles.itemCount}>
                        {tagihanList.length} tagihan
                    </span>
                </div>

                <div className={styles.tagihanList}>
                    {tagihanList.map((tagihan, index) => (
                        <div key={tagihan.id || index} className={styles.tagihanItem}>
                            <div className={styles.itemNumber}>{index + 1}</div>

                            <div className={styles.itemContent}>
                                <div className={styles.itemHeader}>
                                    <span className={styles.itemTitle}>
                                        {tagihan.idDeskripsiTagihan}
                                    </span>

                                    <div className={styles.statusAction}>
                                        <span className={styles.tagihanId}>
                                            {tagihan.id}
                                        </span>

                                        <span
                                            className={`${styles.statusBadge} ${
                                                tagihan.statusTagihan.nama === "Lunas"
                                                    ? styles.statusLunas
                                                    : styles.statusBelumLunas
                                            }`}
                                        >
                                            {tagihan.statusTagihan.nama}
                                        </span>

                                        {tagihan.statusTagihan.nama !== "Lunas" && (
                                            <button
                                                className={styles.iconBayar}
                                                onClick={() => handleBayar(tagihan)}
                                                title="Bayar tagihan"
                                            >
                                                <CreditCard size={16} strokeWidth={2.2} />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className={styles.itemDetails}>
                                    <div className={styles.detailItem}>
                                        <span className={styles.detailLabel}>Nominal</span>
                                        <span className={styles.detailValue}>
                                            Rp{" "}
                                            {parseInt(tagihan.total || 0).toLocaleString("id-ID")}
                                        </span>
                                    </div>

                                    {tagihan.tanggalJatuhTempo && (
                                        <div className={styles.detailItem}>
                                            <span className={styles.detailLabel}>
                                                Jatuh Tempo
                                            </span>
                                            <span className={styles.detailValue}>
                                                {new Date(tagihan.tanggalJatuhTempo).toLocaleDateString("id-ID", {
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric",
                                                })}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ========================= */}
            {/* MODAL BAYAR */}
            {/* ========================= */}
            <BayarModal
                show={showModal}
                onClose={() => setShowModal(false)}
                tagihan={selectedTagihan}
                formPembayaran={formPembayaran}
                setFormPembayaran={setFormPembayaran}
                onSave={handleSave}
            />
        </div>
    );
};

export default TabTagihan;