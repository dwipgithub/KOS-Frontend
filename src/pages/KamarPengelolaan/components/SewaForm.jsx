import { useEffect } from "react";
import styles from "./TabSewa.module.css";

const DURASI_OPTIONS = ["Harian", "Mingguan", "Bulanan", "Tahunan"];

/**
 * @param {object} props
 * @param {object} props.kamarData
 * @param {object} props.formSewa
 * @param {function} props.setFormSewa
 * @param {function} props.onDurasiChange
 * @param {function} props.onJumlahDurasiChange
 * @param {boolean} props.sectionComplete
 * @param {boolean} props.sectionOpen
 * @param {function} props.setSectionOpen
 * @param {{ key: string|null, nonce: number }} props.focusTrigger
 */
const SewaForm = ({
    kamarData,
    formSewa,
    setFormSewa,
    onDurasiChange,
    onJumlahDurasiChange,
    sectionComplete,
    sectionOpen,
    setSectionOpen,
    focusTrigger,
}) => {
    useEffect(() => {
        if (!focusTrigger?.key) return;
        const el = document.querySelector(`[data-sewa-field="${focusTrigger.key}"]`);
        if (el && typeof el.focus === "function") {
            el.focus({ preventScroll: false });
        }
    }, [focusTrigger]);

    const hargaKey = {
        Harian: "hargaPerHari",
        Mingguan: "hargaPerMinggu",
        Bulanan: "hargaPerBulan",
        Tahunan: "hargaPerTahun",
    };

    return (
        <div className={styles.accordionPanel}>
            <button
                type="button"
                className={styles.accordionHeader}
                onClick={() => setSectionOpen((o) => !o)}
                aria-expanded={sectionOpen}
            >
                <span
                    className={`${styles.sectionStatusDot} ${
                        sectionComplete ? styles.sectionStatusOk : styles.sectionStatusPending
                    }`}
                />
                <span className={styles.accordionHeaderText}>
                    <span className={styles.accordionTitle}>Sewa</span>
                    <span className={styles.accordionSubtitle}>
                        Durasi, periode, dan perhitungan biaya
                    </span>
                </span>
                <span className={styles.accordionChevron}>{sectionOpen ? "▲" : "▼"}</span>
            </button>
            {sectionOpen ? (
                <div className={styles.accordionBody}>
                    <div className={styles.formSectionFlat}>
                        <div className={styles.sectionTitle}>Durasi sewa</div>
                        <div className={styles.durasiGrid}>
                            {DURASI_OPTIONS.map((durasi) => {
                                const key = hargaKey[durasi];
                                const harga = kamarData?.[key] || 0;
                                return (
                                    <button
                                        key={durasi}
                                        type="button"
                                        className={`${styles.durasiBtn} ${
                                            formSewa.durasiSewa === durasi ? styles.active : ""
                                        }`}
                                        onClick={() => onDurasiChange(durasi)}
                                    >
                                        <span className={styles.durasisiBtnText}>{durasi}</span>
                                        <span className={styles.durasiPrice}>
                                            Rp {parseInt(harga, 10).toLocaleString("id-ID")}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className={styles.formSectionFlat}>
                        <div className={styles.sectionTitle}>Periode sewa</div>
                        <div className={styles.calculationGrid}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Tanggal mulai *</label>
                                <input
                                    type="date"
                                    data-sewa-field="tanggalMasuk"
                                    className={`${styles.input} ${styles.dateInput}`}
                                    value={formSewa.tanggalMasuk}
                                    onChange={(e) =>
                                        setFormSewa((prev) => ({
                                            ...prev,
                                            tanggalMasuk: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Tanggal selesai</label>
                                <input
                                    type="date"
                                    readOnly
                                    aria-readonly="true"
                                    title="Dihitung otomatis dari tanggal mulai, durasi, dan jumlah"
                                    className={`${styles.input} ${styles.dateInput} ${styles.dateInputReadonly}`}
                                    value={formSewa.tanggalKeluar || ""}
                                    tabIndex={-1}
                                />
                            </div>
                        </div>
                    </div>

                    <div className={styles.formSectionFlat}>
                        <div className={styles.sectionTitle}>Detail perhitungan</div>
                        <div className={styles.calculationGrid}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>
                                    Jumlah {formSewa.durasiSewa} *
                                </label>
                                <input
                                    type="number"
                                    data-sewa-field="jumlahDurasi"
                                    className={styles.input}
                                    value={formSewa.jumlahDurasi}
                                    onChange={(e) =>
                                        onJumlahDurasiChange(parseInt(e.target.value, 10) || 1)
                                    }
                                    min="1"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Harga per {formSewa.durasiSewa}</label>
                                <div className={styles.staticValue}>
                                    Rp {parseInt(formSewa.hargaPerDurasi || 0, 10).toLocaleString("id-ID")}
                                </div>
                            </div>
                            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                <label className={styles.label}>Uang muka</label>
                                <input
                                    type="number"
                                    className={styles.input}
                                    min="0"
                                    step="1000"
                                    value={formSewa.uangMuka ?? 0}
                                    onChange={(e) => {
                                        const v = e.target.value;
                                        setFormSewa((prev) => ({
                                            ...prev,
                                            uangMuka:
                                                v === "" ? 0 : Math.max(0, parseFloat(v) || 0),
                                        }));
                                    }}
                                />
                            </div>
                        </div>
                        <div className={styles.totalPriceSection}>
                            <span className={styles.totalLabel}>Total harga</span>
                            <span className={styles.totalPrice}>
                                Rp {parseInt(formSewa.hargaTotal || 0, 10).toLocaleString("id-ID")}
                            </span>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
};

export default SewaForm;
