import { useEffect } from "react";
import styles from "./TabSewa.module.css";

const DURASI_OPTIONS = ["Bulanan", "Tahunan"];

/**
 * @param {object} props
 * @param {object} props.kamarData
 * @param {object} props.formSewa
 * @param {function} props.setFormSewa
 * @param {function} props.onDurasiChange
 * @param {function} props.onJumlahChange
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
    onJumlahChange,
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

    // Hitung subtotal (jumlah × harga satuan)
    const subtotal = (formSewa.jumlah || 0) * (formSewa.hargaSatuan || 0);

    // Handle diskon persen
    const handlediskonPersen = (value) => {
        const persen = parseFloat(value) || 0;
        const diskonNominal = (subtotal * persen) / 100;
        setFormSewa((prev) => ({
            ...prev,
            diskonPersen: persen,
            diskonNominal: Math.max(0, diskonNominal),
        }));
    };

    // Handle diskon nominal
    const handlediskonNominal = (value) => {
        const nominal = Math.max(0, parseFloat(value) || 0);
        const persen = subtotal > 0 ? (nominal / subtotal) * 100 : 0;
        setFormSewa((prev) => ({
            ...prev,
            diskonNominal: nominal,
            diskonPersen: persen,
        }));
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
                                    data-sewa-field="jumlah"
                                    className={styles.input}
                                    value={formSewa.jumlah}
                                    onChange={(e) =>
                                        onJumlahChange(parseInt(e.target.value, 10) || 1)
                                    }
                                    min="1"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Harga per {formSewa.durasiSewa}</label>
                                <div className={styles.staticValue}>
                                    Rp {parseInt(formSewa.hargaSatuan || 0, 10).toLocaleString("id-ID")}
                                </div>
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>diskon (%)</label>
                                <input
                                    type="number"
                                    className={styles.input}
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    value={formSewa.diskonPersen ?? 0}
                                    onChange={(e) => handlediskonPersen(e.target.value)}
                                    placeholder="Masukkan persentase"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>diskon (Rp)</label>
                                <input
                                    type="number"
                                    className={styles.input}
                                    min="0"
                                    step="1000"
                                    value={formSewa.diskonNominal ?? 0}
                                    onChange={(e) => handlediskonNominal(e.target.value)}
                                    placeholder="Masukkan jumlah"
                                />
                            </div>
                            <div className={styles.formGroup}>
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
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Uang jaminan</label>
                                <input
                                    type="number"
                                    className={styles.input}
                                    min="0"
                                    step="1000"
                                    value={formSewa.uangJaminan ?? 0}
                                    onChange={(e) => {
                                        const v = e.target.value;
                                        setFormSewa((prev) => ({
                                            ...prev,
                                            uangJaminan:
                                                v === "" ? 0 : Math.max(0, parseFloat(v) || 0),
                                        }));
                                    }}
                                />
                            </div>
                        </div>
                        <div className={styles.totalPriceSection}>
                            <span className={styles.totalLabel}>Total harga</span>
                            <span className={styles.totalPrice}>
                                Rp {parseInt((subtotal - (formSewa.diskonNominal || 0)) || 0, 10).toLocaleString("id-ID")}
                            </span>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
};

export default SewaForm;
