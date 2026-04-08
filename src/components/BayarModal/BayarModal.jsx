import { useEffect } from "react";
import styles from "./BayarModal.module.css";
import { X, CreditCard, Wallet } from "lucide-react";

const BayarModal = ({ 
    show, 
    onClose, 
    tagihan, 
    formPembayaran, 
    setFormPembayaran, 
    onSave 
}) => {
    useEffect(() => {
        if (show && tagihan) {
            setFormPembayaran({
                idTagihan: tagihan.id,
                tanggalBayar: new Date().toISOString().split("T")[0],
                idMetodeBayar: "CASH",
                totalBayar: parseInt(tagihan.total) || 0,
            });
        }
    }, [show, tagihan, setFormPembayaran]);

    if (!show || !tagihan) return null;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                
                {/* HEADER */}
                <div className={styles.modalHeader}>
                    <div>
                        <h3 className={styles.title}>Pembayaran Tagihan</h3>
                        <p className={styles.subtitle}>
                            Selesaikan pembayaran dengan cepat dan aman
                        </p>
                    </div>
                    <button onClick={onClose} className={styles.closeBtn}>
                        <X size={18} />
                    </button>
                </div>

                {/* HIGHLIGHT TOTAL */}
                <div className={styles.totalBox}>
                    <span className={styles.totalLabel}>Total Bayar</span>
                    <span className={styles.totalValue}>
                        Rp {parseInt(tagihan.total).toLocaleString("id-ID")}
                    </span>
                </div>

                {/* BODY */}
                <div className={styles.modalBody}>
                    
                    {/* ID TAGIHAN */}
                    <div className={styles.formGroup}>
                        <label>ID Tagihan</label>
                        <input value={tagihan.id} disabled />
                    </div>

                    {/* METODE (MODERN SELECT BUTTON STYLE) */}
                    <div className={styles.formGroup}>
                        <label>Metode Pembayaran</label>

                        <div className={styles.metodeGrid}>
                            <div
                                className={`${styles.metodeCard} ${
                                    formPembayaran.idMetodeBayar === "CASH" ? styles.active : ""
                                }`}
                                onClick={() =>
                                    setFormPembayaran({ ...formPembayaran, idMetodeBayar: "CASH" })
                                }
                            >
                                <Wallet size={18} />
                                <span>Cash</span>
                            </div>

                            <div
                                className={`${styles.metodeCard} ${
                                    formPembayaran.idMetodeBayar === "TRANSFER" ? styles.active : ""
                                }`}
                                onClick={() =>
                                    setFormPembayaran({ ...formPembayaran, idMetodeBayar: "TRANSFER" })
                                }
                            >
                                <CreditCard size={18} />
                                <span>Transfer</span>
                            </div>
                        </div>
                    </div>

                    {/* TANGGAL */}
                    <div className={styles.formGroup}>
                        <label>Tanggal Bayar</label>
                        <input
                            type="date"
                            value={formPembayaran.tanggalBayar}
                            onChange={(e) =>
                                setFormPembayaran({ ...formPembayaran, tanggalBayar: e.target.value })
                            }
                        />
                    </div>
                </div>

                {/* FOOTER */}
                <div className={styles.modalFooter}>
                    <button className={styles.btnCancel} onClick={onClose}>
                        Batal
                    </button>

                    <button
                        className={styles.btnSave}
                        onClick={() => {
                            const payload = {
                                ...formPembayaran,
                                idTagihan: tagihan.id,
                                totalBayar: parseInt(tagihan.total) || 0,
                            };

                            onSave(payload);
                        }}
                    >
                        Simpan Pembayaran
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BayarModal;