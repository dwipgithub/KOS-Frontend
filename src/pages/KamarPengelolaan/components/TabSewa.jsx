import Select from "react-select";
import styles from "./TabSewa.module.css";

const TabSewa = ({
    kamarData,
    sewaData,
    penyewaData,
    formSewa,
    setFormSewa,
    penyewaList,
    onSave,
    onDurasiChange,
    onJumlahDurasiChange,
    loadingPenyewa,
}) => {
    console.log("📋 TabSewa rendered - sewaData:", sewaData, "kamarData.idSewa:", kamarData?.idSewa);

    const isActive = sewaData?.statusSewa?.id === "ACTIVE";
    const isBooked = sewaData?.statusSewa?.id === "BOOKED";

    // Jika kamar sudah disewa, tampilkan info penyewa
    if (isActive || isBooked) {
        console.log("✅ Showing penyewa info - sewaData.id:", sewaData.id);
        console.log("📋 Penyewa data:", penyewaData);
        return (
            <div className={styles.container}>
                <div className={styles.activeSewaContainer}>
                    <div className={styles.statusHeader}>
                        <span className={styles.statusIcon}>
                            {isActive ? "✅" : "📅"}
                        </span>
                        <div>
                            <h3 className={styles.statusTitle}>
                                {isActive
                                    ? "Kamar Sedang Disewa"
                                    : "Kamar Sudah Dibooking"}
                            </h3>
                            <p className={styles.statusSubtitle}>
                                {isActive
                                    ? "Data penyewa dan detail sewa"
                                    : "Data booking dan jadwal sewa"}
                            </p>
                        </div>
                    </div>

                    <div className={styles.sewaGrid}>
                        {/* INFORMASI PENYEWA */}
                        <div className={styles.sewaCardModern}>
                            <div className={styles.cardHeaderModern}>
                                <div>
                                    <h4 className={styles.cardTitle}>👤 Informasi Penyewa</h4>
                                    <p className={styles.cardSubtitle}>
                                        Detail identitas penyewa
                                    </p>
                                </div>
                            </div>

                            <div className={styles.infoGridModern}>
                                <div className={styles.infoBox}>
                                    <span className={styles.label}>ID {penyewaData?.pengenal.id || "-"}</span>
                                    <span className={styles.value}>{penyewaData?.pengenal.noPengenal || "-"}</span>
                                </div>

                                <div className={styles.infoBox}>
                                    <span className={styles.label}>Nama</span>
                                    <span className={styles.value}>{penyewaData?.nama || "-"}</span>
                                </div>

                                <div className={styles.infoBox}>
                                    <span className={styles.label}>Telepon</span>
                                    <span className={styles.value}>{penyewaData?.noTelp || "-"}</span>
                                </div>

                                <div className={styles.infoBox}>
                                    <span className={styles.label}>Email</span>
                                    <span className={styles.value}>{penyewaData?.email || "-"}</span>
                                </div>

                                <div className={`${styles.infoBox} ${styles.fullWidth}`}>
                                    <span className={styles.label}>Alamat</span>
                                    <span className={styles.value}>{penyewaData?.alamat || "-"}</span>
                                </div>
                            </div>
                        </div>

                        {/* DETAIL SEWA */}
                        <div className={styles.sewaCardModern}>
                            <div className={styles.cardHeaderModern}>
                                <div>
                                    <h4 className={styles.cardTitle}>📋 Detail Sewa</h4>
                                    <p className={styles.cardSubtitle}>
                                        Periode & biaya sewa
                                    </p>
                                </div>
                            </div>

                            <div className={styles.infoGridModern}>
                                <div className={styles.infoBox}>
                                    <span className={styles.label}>Durasi</span>
                                    <span className={styles.value}>
                                        {sewaData?.durasi?.nama || sewaData?.durasiSewa || "-"}
                                    </span>
                                </div>

                                <div className={styles.infoBox}>
                                    <span className={styles.label}>Jumlah</span>
                                    <span className={styles.value}>
                                        {sewaData?.jumlahDurasi || "-"}
                                    </span>
                                </div>

                                <div className={styles.infoBox}>
                                    <span className={styles.label}>Masuk</span>
                                    <span className={styles.value}>
                                        {sewaData?.tanggalMasuk
                                            ? new Date(sewaData.tanggalMasuk).toLocaleDateString("id-ID", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                            })
                                            : "-"}
                                    </span>
                                </div>

                                <div className={styles.infoBox}>
                                    <span className={styles.label}>Keluar</span>
                                    <span className={styles.value}>
                                        {sewaData?.tanggalKeluar
                                            ? new Date(sewaData.tanggalKeluar).toLocaleDateString("id-ID", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                            })
                                            : "-"}
                                    </span>
                                </div>

                                <div className={styles.infoBox}>
                                    <span className={styles.label}>Harga</span>
                                    <span className={styles.value}>
                                        Rp {parseInt(sewaData?.hargaPerDurasi || 0).toLocaleString("id-ID")}
                                    </span>
                                </div>

                                <div className={styles.infoBox}>
                                    <span className={styles.label}>Uang Muka</span>
                                    <span className={styles.value}>
                                        Rp{" "}
                                        {Number(sewaData?.uangMuka ?? 0).toLocaleString("id-ID")}
                                    </span>
                                </div>

                                {/* TOTAL HIGHLIGHT */}
                                <div className={`${styles.infoBox}`}>
                                    <span className={styles.label}>Total</span>
                                    <span className={styles.value}>
                                        Rp{" "}
                                        {parseInt(
                                            sewaData?.hargaPerDurasi *
                                            parseInt(sewaData?.jumlahDurasi || 0)
                                        ).toLocaleString("id-ID")}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Form sewa untuk kamar yang belum disewa
    console.log("📝 Showing form sewa - no sewaData or no sewaData.id");
    return (
        <div className={styles.container}>
            <div className={styles.formContainer}>
                <div className={styles.formHeader}>
                    <span className={styles.formIcon}>📝</span>
                    <div>
                        <h3 className={styles.formHeaderTitle}>Tambah Sewa Kamar</h3>
                        <p className={styles.formHeaderSubtitle}>
                            Isi formulir untuk memasukkan data penyewa
                        </p>
                    </div>
                </div>

                <div className={styles.formContent}>
                    {/* PILIH PENYEWA */}
                    <div className={styles.formSection}>
                        <div className={styles.sectionTitle}>👤 Pilih Penyewa</div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Nama Penyewa *</label>
                            <Select
                                classNamePrefix="custom-select"
                                options={penyewaList.map((p) => ({
                                    value: p.id,
                                    label: `${p.nama} • ${p.noTelp}`,
                                }))}
                                value={
                                    penyewaList
                                        .map((p) => ({
                                            value: p.id,
                                            label: `${p.nama} • ${p.noTelp}`,
                                        }))
                                        .find((opt) => opt.value === formSewa.idPenyewa) || null
                                }
                                onChange={(selected) =>
                                    setFormSewa({
                                        ...formSewa,
                                        idPenyewa: selected?.value || "",
                                    })
                                }
                                isLoading={loadingPenyewa}
                                placeholder="-- Pilih Penyewa --"
                                isClearable
                            />
                        </div>
                    </div>

                    {/* DETAIL DURASI SEWA */}
                    <div className={styles.formSection}>
                        <div className={styles.sectionTitle}>⏱️ Durasi Sewa</div>

                        <div className={styles.durasiGrid}>
                            {["Bulanan", "Tahunan"].map(
                                (durasi) => (
                                    <button
                                        key={durasi}
                                        className={`${styles.durasiBtn} ${formSewa.durasiSewa === durasi
                                            ? styles.active
                                            : ""
                                            }`}
                                        onClick={() => onDurasiChange(durasi)}
                                    >
                                        <span className={styles.durasisiBtnText}>
                                            {durasi}
                                        </span>
                                        <span className={styles.durasiPrice}>
                                            Rp{" "}
                                            {parseInt(
                                                kamarData?.[
                                                durasi === "Bulanan"
                                                    ? "hargaPerBulan"
                                                    : "hargaPerTahun"
                                                ] || 0
                                            ).toLocaleString("id-ID")}
                                        </span>
                                    </button>
                                )
                            )}
                        </div>
                    </div>

                    {/* TANGGAL SEWA */}
                    <div className={styles.formSection}>
                        <div className={styles.sectionTitle}>📅 Periode Sewa</div>

                        <div className={styles.calculationGrid}>
                            {/* TANGGAL MASUK */}
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Tanggal Masuk *</label>
                                <input
                                    type="date"
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

                            {/* TANGGAL KELUAR (otomatis) */}
                            <div className={styles.formGroup}>
                                <label className={styles.label}>
                                    Tanggal Keluar
                                </label>
                                <input
                                    type="date"
                                    readOnly
                                    aria-readonly="true"
                                    title="Dihitung otomatis dari tanggal masuk, jenis durasi, dan jumlah"
                                    className={`${styles.input} ${styles.dateInput} ${styles.dateInputReadonly}`}
                                    value={formSewa.tanggalKeluar || ""}
                                    tabIndex={-1}
                                />
                            </div>
                        </div>
                    </div>

                    {/* DETAIL PERHITUNGAN */}
                    <div className={styles.formSection}>
                        <div className={styles.sectionTitle}>💰 Detail Perhitungan</div>

                        <div className={styles.calculationGrid}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>
                                    Jumlah {formSewa.durasiSewa} *
                                </label>
                                <input
                                    type="number"
                                    className={styles.input}
                                    value={formSewa.jumlahDurasi}
                                    onChange={(e) =>
                                        onJumlahDurasiChange(
                                            parseInt(e.target.value) || 1
                                        )
                                    }
                                    min="1"
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>
                                    Harga Per {formSewa.durasiSewa}
                                </label>
                                <div className={styles.staticValue}>
                                    Rp{" "}
                                    {parseInt(
                                        formSewa.hargaPerDurasi || 0
                                    ).toLocaleString("id-ID")}
                                </div>
                            </div>

                            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                <label className={styles.label}>Uang Muka</label>
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
                                                v === ""
                                                    ? 0
                                                    : Math.max(0, parseFloat(v) || 0),
                                        }));
                                    }}
                                />
                            </div>
                            
                        </div>

                        {/* HARGA TOTAL */}
                        <div className={styles.totalPriceSection}>
                            <span className={styles.totalLabel}>Total Harga</span>
                            <span className={styles.totalPrice}>
                                Rp{" "}
                                {parseInt(
                                    formSewa.hargaTotal || 0
                                ).toLocaleString("id-ID")}
                            </span>
                        </div>
                    </div>

                    {/* BUTTON SIMPAN */}
                    <button className={styles.saveBtn} onClick={onSave}>
                        💾 Simpan
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TabSewa;
