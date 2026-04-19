import { LogOut } from "lucide-react";
import styles from "./TabKeluar.module.css";

const TabKeluar = ({
    kamarData,
    sewaData,
    penyewaData,
    formKeluar,
    setFormKeluar,
    onSubmit,
    loadingSewa,
    savingKeluar,
}) => {
    if (loadingSewa) {
        return (
            <div className={styles.container}>
                <div className={styles.loadingContainer}>
                    <div className={styles.spinner} />
                    <p>Memuat data sewa…</p>
                </div>
            </div>
        );
    }

    const statusId = sewaData?.statusSewa?.id;
    const hasSewa = Boolean(sewaData?.id && (statusId === "ACTIVE" || statusId === "BOOKED"));

    if (!hasSewa) {
        return (
            <div className={styles.container}>
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>🚪</div>
                    <h3 className={styles.emptyTitle}>Belum Ada Penyewaan</h3>
                    <p className={styles.emptySubtitle}>
                        Check-Out hanya tersedia jika kamar sedang dalam status sewa aktif atau
                        booking. Tambah sewa di tab Sewa terlebih dahulu.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.checkoutWrap}>
                <div className={styles.hero}>
                    <span className={styles.heroIcon} aria-hidden>
                        🧳
                    </span>
                    <div>
                        <h3 className={styles.heroTitle}>Check-out Penyewa</h3>
                        <p className={styles.heroSubtitle}>
                            Catat tanggal keluar aktual dan catatan penyelesaian sewa untuk{" "}
                            <strong>{kamarData?.nama || "kamar ini"}</strong>.
                        </p>
                    </div>
                </div>

                <div className={styles.formCard}>
                    <div className={styles.formSectionTitle}>
                        <LogOut size={18} strokeWidth={2.5} aria-hidden />
                        Form check-out
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor="tanggal-keluar-checkout">
                            Tanggal keluar *
                        </label>
                        <input
                            id="tanggal-keluar-checkout"
                            type="date"
                            className={styles.input}
                            value={formKeluar.tanggalKeluar || ""}
                            onChange={(e) =>
                                setFormKeluar((prev) => ({
                                    ...prev,
                                    tanggalKeluar: e.target.value,
                                }))
                            }
                        />
                        <p className={styles.hint}>
                            Tanggal penyewa meninggalkan kamar (bisa berbeda dari tanggal kontrak).
                        </p>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor="catatan-keluar">
                            Catatan
                        </label>
                        <textarea
                            id="catatan-keluar"
                            className={styles.textarea}
                            placeholder="Contoh: kunci dikembalikan, kamar dalam kondisi baik…"
                            value={formKeluar.catatan || ""}
                            onChange={(e) =>
                                setFormKeluar((prev) => ({
                                    ...prev,
                                    catatan: e.target.value,
                                }))
                            }
                            rows={4}
                        />
                    </div>

                    <div className={styles.actions}>
                        <button
                            type="button"
                            className={styles.submitBtn}
                            onClick={onSubmit}
                            disabled={savingKeluar || !formKeluar.tanggalKeluar}
                        >
                            <LogOut size={18} strokeWidth={2.5} />
                            {savingKeluar ? "Menyimpan…" : "Check-out"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TabKeluar;
