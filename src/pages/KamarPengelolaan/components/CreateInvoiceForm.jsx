import { useState, useMemo, useCallback, useEffect } from "react";
import { ChevronDown, AlertCircle } from "lucide-react";
import styles from "./CreateInvoiceForm.module.css";

const CreateInvoiceForm = ({
    deskripsiOptions = [],
    formTagihan = {},
    setFormTagihan = () => {},
    onSaveTagihan = () => {},
    savingTagihan = false,
}) => {
    // State untuk auto-sync diskon
    // const [discountSource, setDiscountSource] = useState("none"); // "percent" | "rupiah" | "none"
    const [validationErrors, setValidationErrors] = useState({});

    // ===========================
    // CALCULATE SUBTOTAL
    // ===========================
    const subtotal = useMemo(() => {
        const qty = parseInt(formTagihan.jumlah) || 0;
        const price = parseInt(formTagihan.hargaSatuan) || 0;
        return qty * price;
    }, [formTagihan.jumlah, formTagihan.hargaSatuan]);

    // ===========================
    // CALCULATE TOTAL
    // ===========================
    const total = useMemo(() => {
        const diskonRupiah = parseInt(formTagihan.diskonRupiah) || 0;
        return Math.max(0, subtotal - diskonRupiah);
    }, [subtotal, formTagihan.diskonRupiah]);

    // ===========================
    // GET SELECTED DESKRIPSI
    // ===========================
    const selectedDeskripsi = useMemo(() => {
        if (!formTagihan.deskripsiTagihan || !deskripsiOptions.length) {
            return null;
        }
        return deskripsiOptions.find(
            (item) => String(item.id) === String(formTagihan.deskripsiTagihan)
        );
    }, [formTagihan.deskripsiTagihan, deskripsiOptions]);

    const isBiayaKamar =
        selectedDeskripsi?.nama?.toLowerCase()?.includes("kamar");

    // ===========================
    // CALCULATE CHECKOUT DATE
    // ===========================
    const calculateCheckoutDate = useCallback(() => {
        if (!formTagihan.tanggalMasuk || !formTagihan.durasi || !formTagihan.jumlah) {
            return null;
        }

        const checkInDate = new Date(formTagihan.tanggalMasuk);
        const quantity = parseInt(formTagihan.jumlah) || 0;
        let checkOutDate = new Date(checkInDate);

        switch (formTagihan.durasi) {
            case "DAY":
                checkOutDate.setDate(checkOutDate.getDate() + quantity);
                break;
            case "WEEK":
                checkOutDate.setDate(checkOutDate.getDate() + quantity * 7);
                break;
            case "MONTH":
                checkOutDate.setMonth(checkOutDate.getMonth() + quantity);
                break;
            case "YEAR":
                checkOutDate.setFullYear(checkOutDate.getFullYear() + quantity);
                break;
            default:
                return null;
        }

        // Format date to YYYY-MM-DD
        const year = checkOutDate.getFullYear();
        const month = String(checkOutDate.getMonth() + 1).padStart(2, "0");
        const date = String(checkOutDate.getDate()).padStart(2, "0");

        return `${year}-${month}-${date}`;
    }, [formTagihan.tanggalMasuk, formTagihan.durasi, formTagihan.jumlah]);

    // ===========================
    // AUTO-UPDATE CHECKOUT DATE
    // ===========================
    useEffect(() => {
        if (isBiayaKamar) {
            const newCheckOutDate = calculateCheckoutDate();
            if (newCheckOutDate && newCheckOutDate !== formTagihan.tanggalKeluar) {
                setFormTagihan((prev) => ({
                    ...prev,
                    tanggalKeluar: newCheckOutDate,
                }));
            }
        }
    }, [isBiayaKamar, formTagihan.tanggalMasuk, formTagihan.durasi, formTagihan.jumlah, calculateCheckoutDate, formTagihan.tanggalKeluar, setFormTagihan]);

    // ===========================
    // HANDLE JUMLAH CHANGE
    // ===========================
    const handleJumlahChange = (e) => {
        const value = e.target.value;
        setFormTagihan((prev) => ({
            ...prev,
            jumlah: value,
        }));
    };

    // ===========================
    // HANDLE HARGA SATUAN CHANGE
    // ===========================
    const handleHargaSatuanChange = (e) => {
        const value = e.target.value;
        setFormTagihan((prev) => ({
            ...prev,
            hargaSatuan: value,
        }));
    };

    // ===========================
    // HANDLE DISKON PERSEN CHANGE
    // ===========================
    const handleDiskonPersenChange = (e) => {
        const value = e.target.value;
        const percentValue = parseFloat(value) || 0;

        // Validation: persen tidak boleh melebihi 100%
        if (percentValue > 100) {
            setValidationErrors((prev) => ({
                ...prev,
                diskonPersen: "Diskon tidak boleh melebihi 100%",
            }));
            // Set ke 100%
            const diskonRupiah = subtotal;
            setFormTagihan((prev) => ({
                ...prev,
                diskonPersen: 100,
                diskonRupiah: diskonRupiah,
            }));
        } else {
            setValidationErrors((prev) => ({
                ...prev,
                diskonPersen: "",
            }));

            // Calculate diskon rupiah
            const diskonRupiah = Math.round((subtotal * percentValue) / 100);

            setFormTagihan((prev) => ({
                ...prev,
                diskonPersen: percentValue,
                diskonRupiah: diskonRupiah,
            }));
        }

        // setDiscountSource("percent");
    };

    // ===========================
    // HANDLE DISKON RUPIAH CHANGE
    // ===========================
    const handleDiskonRupiahChange = (e) => {
        const value = e.target.value;
        const rupiahValue = parseInt(value) || 0;

        // Validation: diskon tidak boleh melebihi subtotal
        if (rupiahValue > subtotal) {
            setValidationErrors((prev) => ({
                ...prev,
                diskonRupiah: `Diskon tidak boleh melebihi subtotal (Rp ${formatRupiah(
                    subtotal
                )})`,
            }));
            // Set ke max subtotal
            const limitedValue = subtotal;
            const percent = subtotal > 0 ? (limitedValue / subtotal) * 100 : 0;
            setFormTagihan((prev) => ({
                ...prev,
                diskonRupiah: limitedValue,
                diskonPersen: parseFloat(percent.toFixed(2)),
            }));
        } else {
            setValidationErrors((prev) => ({
                ...prev,
                diskonRupiah: "",
            }));
            // Calculate diskon persen
            const percent = subtotal > 0 ? (rupiahValue / subtotal) * 100 : 0;

            setFormTagihan((prev) => ({
                ...prev,
                diskonRupiah: rupiahValue,
                diskonPersen: parseFloat(percent.toFixed(2)),
            }));
        }

        // setDiscountSource("rupiah");
    };

    // ===========================
    // HANDLE DESKRIPSI CHANGE
    // ===========================
    const handleDeskripsiChange = (e) => {
        const value = e.target.value;
        setFormTagihan((prev) => ({
            ...prev,
            deskripsiTagihan: value,
            // Reset conditional fields
            durasi: "",
            tanggalMasuk: "",
            tanggalKeluar: "",
        }));
        // setDiscountSource("none");
    };

    // ===========================
    // FORMAT RUPIAH
    // ===========================
    const formatRupiah = (value) => {
        const num = parseInt(value) || 0;
        return num.toLocaleString("id-ID");
    };

    // ===========================
    // FORMAT SUBTOTAL DISPLAY
    // ===========================
    const subtotalDisplay = formatRupiah(subtotal);
    const totalDisplay = formatRupiah(total);
    const diskonRupiahDisplay = formatRupiah(formTagihan.diskonRupiah || 0);

    return (
        <div className={styles.container}>
            {/* ===== FORM HEADER ===== */}
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <h3 className={styles.title}>📝 Buat Tagihan Baru</h3>
                </div>
            </div>

            {/* ===== FORM BODY ===== */}
            <div className={styles.formContent}>
                {/* ===== SECTION 1: INFORMASI TAGIHAN ===== */}
                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h4 className={styles.sectionTitle}>
                            Informasi Tagihan
                        </h4>
                    </div>

                    <div className={styles.grid}>
                        {/* DESKRIPSI TAGIHAN */}
                        <div className={styles.formGroup}>
                            <label className={styles.label}>
                                Deskripsi Tagihan <span className={styles.required}>*</span>
                            </label>
                            <div className={styles.selectWrapper}>
                                <select
                                    className={styles.select}
                                    value={formTagihan.deskripsiTagihan || ""}
                                    onChange={handleDeskripsiChange}
                                >
                                    <option value="">
                                        -- Pilih deskripsi --
                                    </option>
                                    {deskripsiOptions.map((item) => (
                                        <option
                                            key={item.id}
                                            value={item.id}
                                        >
                                            {item.nama}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown
                                    size={18}
                                    className={styles.selectIcon}
                                />
                            </div>
                        </div>

                        {/* CONDITIONAL: DURASI (untuk Biaya Kamar) */}
                        {isBiayaKamar && (
                            <div className={styles.formGroup}>
                                <label className={styles.label}>
                                    Durasi <span className={styles.required}>*</span>
                                </label>
                                <div className={styles.selectWrapper}>
                                    <select
                                        className={styles.select}
                                        value={formTagihan.durasi || ""}
                                        onChange={(e) =>
                                            setFormTagihan((prev) => ({
                                                ...prev,
                                                durasi: e.target.value,
                                            }))
                                        }
                                    >
                                        <option value="">
                                            -- Pilih durasi --
                                        </option>
                                        <option value="MONTH">
                                            Bulanan
                                        </option>
                                        <option value="YEAR">
                                            Tahunan
                                        </option>
                                    </select>
                                    <ChevronDown
                                        size={18}
                                        className={styles.selectIcon}
                                    />
                                </div>
                            </div>
                        )}

                        {/* CONDITIONAL: TANGGAL MASUK (untuk Biaya Kamar) */}
                        {isBiayaKamar && (
                            <div className={styles.formGroup}>
                                <label className={styles.label}>
                                    Tanggal Masuk{" "}
                                    <span className={styles.required}>
                                        *
                                    </span>
                                </label>
                                <input
                                    type="date"
                                    className={styles.input}
                                    value={formTagihan.tanggalMasuk || ""}
                                    onChange={(e) =>
                                        setFormTagihan((prev) => ({
                                            ...prev,
                                            tanggalMasuk: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                        )}

                        {/* CONDITIONAL: TANGGAL KELUAR (untuk Biaya Kamar) */}
                        {isBiayaKamar && (
                            <div className={styles.formGroup}>
                                <div className={styles.labelWithBadge}>
                                    <label className={styles.label}>
                                        Tanggal Keluar{" "}
                                        <span className={styles.required}>
                                            *
                                        </span>
                                    </label>
                                    <span className={styles.autoBadge}>
                                        Auto
                                    </span>
                                </div>
                                <input
                                    type="date"
                                    className={styles.input}
                                    value={formTagihan.tanggalKeluar || ""}
                                    disabled={true}
                                    title="Otomatis dihitung dari Tanggal Masuk, Durasi, dan Jumlah"
                                />
                                <div className={styles.autoCalculatedNote}>
                                    Dihitung otomatis berdasarkan durasi dan jumlah
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ===== SECTION 2: PERHITUNGAN ===== */}
                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h4 className={styles.sectionTitle}>
                            Perhitungan
                        </h4>
                    </div>

                    <div className={styles.grid}>
                        {/* JUMLAH */}
                        <div className={styles.formGroup}>
                            <label className={styles.label}>
                                Jumlah (Qty){" "}
                                <span className={styles.required}>*</span>
                            </label>
                            <input
                                type="number"
                                className={styles.input}
                                min="0"
                                step="1"
                                value={formTagihan.jumlah || ""}
                                onChange={handleJumlahChange}
                                placeholder="0"
                            />
                        </div>

                        {/* HARGA SATUAN */}
                        <div className={styles.formGroup}>
                            <label className={styles.label}>
                                Harga Satuan{" "}
                                <span className={styles.required}>*</span>
                            </label>
                            <input
                                type="number"
                                className={styles.input}
                                min="0"
                                step="1000"
                                value={formTagihan.hargaSatuan || ""}
                                onChange={handleHargaSatuanChange}
                                placeholder="0"
                            />
                            {subtotal > 0 && (
                                <div className={styles.helperText}>
                                    Subtotal: Rp {subtotalDisplay}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ===== SECTION 3: DISKON ===== */}
                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h4 className={styles.sectionTitle}>
                            Diskon <span className={styles.badge}>Optional</span>
                        </h4>
                    </div>

                    <div className={styles.discountInfo}>
                        <p className={styles.discountHelpText}>
                            Pilih salah satu: Diskon Persen atau Diskon Rupiah.
                            Sistem akan otomatis menghitung nilai lainnya.
                        </p>
                    </div>

                    <div className={styles.grid}>
                        {/* DISKON PERSEN */}
                        <div className={styles.formGroup}>
                            <label className={styles.label}>
                                Diskon Persen (%)
                            </label>
                            <div className={styles.inputSuffix}>
                                <input
                                    type="number"
                                    className={`${styles.input} ${
                                        validationErrors.diskonPersen
                                            ? styles.inputError
                                            : ""
                                    }`}
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    value={formTagihan.diskonPersen || ""}
                                    onChange={handleDiskonPersenChange}
                                    placeholder="0"
                                    disabled={!subtotal}
                                />
                                <span className={styles.suffix}>%</span>
                            </div>
                            {validationErrors.diskonPersen && (
                                <div className={styles.errorMessage}>
                                    <AlertCircle size={14} />
                                    {validationErrors.diskonPersen}
                                </div>
                            )}
                            {!validationErrors.diskonPersen &&
                                formTagihan.diskonPersen > 0 && (
                                    <div className={styles.helperText}>
                                        Diskon: Rp {diskonRupiahDisplay}
                                    </div>
                                )}
                        </div>

                        {/* DISKON RUPIAH */}
                        <div className={styles.formGroup}>
                            <label className={styles.label}>
                                Diskon Rupiah (Rp)
                            </label>
                            <input
                                type="number"
                                className={`${styles.input} ${
                                    validationErrors.diskonRupiah
                                        ? styles.inputError
                                        : ""
                                }`}
                                min="0"
                                step="1000"
                                value={formTagihan.diskonRupiah || ""}
                                onChange={handleDiskonRupiahChange}
                                placeholder="0"
                                disabled={!subtotal}
                            />
                            {validationErrors.diskonRupiah && (
                                <div className={styles.errorMessage}>
                                    <AlertCircle size={14} />
                                    {validationErrors.diskonRupiah}
                                </div>
                            )}
                            {!validationErrors.diskonRupiah &&
                                formTagihan.diskonRupiah > 0 && (
                                    <div className={styles.helperText}>
                                        {formTagihan.diskonPersen?.toFixed(2)}%
                                    </div>
                                )}
                        </div>
                    </div>
                </div>

                {/* ===== SECTION 4: TOTAL (HIGHLIGHTED) ===== */}
                <div className={styles.section}>
                    <div className={styles.totalCard}>
                        <div className={styles.totalContent}>
                            <span className={styles.totalLabel}>
                                Total Tagihan
                            </span>
                            <div className={styles.totalAmount}>
                                Rp {totalDisplay}
                            </div>
                        </div>
                        <div className={styles.totalBreakdown}>
                            {subtotal > 0 && (
                                <div className={styles.breakdownItem}>
                                    <span className={styles.breakdownLabel}>
                                        Subtotal:
                                    </span>
                                    <span className={styles.breakdownValue}>
                                        Rp {subtotalDisplay}
                                    </span>
                                </div>
                            )}
                            {formTagihan.diskonRupiah > 0 && (
                                <div className={styles.breakdownItem}>
                                    <span className={styles.breakdownLabel}>
                                        Diskon:
                                    </span>
                                    <span className={styles.breakdownValue}>
                                        -Rp {diskonRupiahDisplay}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ===== FORM ACTIONS ===== */}
            <div className={styles.formActions}>
                <button
                    className={styles.btnSubmit}
                    onClick={() => {
                        // Set total to state and call parent handler immediately
                        // with calculated total value to avoid async race condition
                        setFormTagihan((prev) => ({
                            ...prev,
                            total: total,
                        }));
                        // Call parent handler with current calculated total
                        onSaveTagihan(total);
                    }}
                    disabled={
                        savingTagihan ||
                        !formTagihan.deskripsiTagihan ||
                        !formTagihan.jumlah ||
                        !formTagihan.hargaSatuan ||
                        Object.values(validationErrors).some(
                            (err) => err !== ""
                        ) ||
                        (isBiayaKamar &&
                            (!formTagihan.durasi ||
                                !formTagihan.tanggalMasuk ||
                                !formTagihan.tanggalKeluar))
                    }
                >
                    {savingTagihan ? (
                        <>
                            <span className={styles.spinner}></span>
                            Menyimpan...
                        </>
                    ) : (
                        "💾 Buat Tagihan"
                    )}
                </button>
            </div>
        </div>
    );
};

export default CreateInvoiceForm;
