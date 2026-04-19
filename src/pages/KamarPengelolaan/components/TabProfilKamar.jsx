import styles from "./TabProfilKamar.module.css";

const TabProfilKamar = ({ kamarData, formProfil, setFormProfil, onSave, loading }) => {
    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loadingContainer}>
                    <div className={styles.spinner}></div>
                    <p>Memuat data kamar...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.contentGrid}>
                <div className={styles.infoSection}>
                    <div className={styles.infoCardModern}>
                        <div className={styles.infoHeaderModern}>
                            <div>
                                <h3 className={styles.infoTitle}>🛏️ Profil Kamar</h3>
                                <p className={styles.cardSubtitle}>
                                    Informasi utama kamar dan properti
                                </p>
                            </div>
                        </div>

                        <div className={styles.infoGridModern}>
                            <div className={styles.infoBox}>
                                <span className={styles.label}>Nama Kamar</span>
                                <span className={styles.value}>{kamarData?.nama || "-"}</span>
                            </div>

                            <div className={styles.infoBox}>
                                <span className={styles.label}>Properti</span>
                                <span className={styles.value}>
                                    {kamarData?.properti?.nama || "-"}
                                </span>
                            </div>

                            <div className={styles.infoBox}>
                                <span className={styles.label}>Status Sewa</span>
                                <span className={styles.value}>{kamarData?.statusSewa || "-"}</span>
                            </div>

                            <div className={styles.infoBox}>
                                <span className={styles.label}>Kondisi Kamar</span>
                                <span className={styles.value}>{kamarData?.statusKamar.nama || "-"}</span>
                            </div>

                            <div className={`${styles.infoBox} ${styles.fullWidth}`}>
                                <span className={styles.label}>Catatan</span>
                                <span className={styles.value}>
                                    {kamarData?.catatan || "Tidak ada catatan"}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className={styles.hargaCard}>
                        <div className={styles.hargaHeader}>
                            <div>
                                <h3 className={styles.hargaTitle}>💵 Harga Dasar</h3>
                                <p className={styles.cardSubtitle}>
                                    Tarif sewa per periode.
                                </p>
                            </div>
                        </div>

                        <div className={styles.hargaGrid}>
                            {/* <div className={styles.hargaItem}>
                                <span className={styles.hargaLabel}>Per Hari</span>
                                <span className={styles.hargaValue}>
                                    Rp {parseInt(kamarData?.hargaPerHari || 0).toLocaleString("id-ID")}
                                </span>
                            </div>
                            <div className={styles.hargaItem}>
                                <span className={styles.hargaLabel}>Per Minggu</span>
                                <span className={styles.hargaValue}>
                                    Rp {parseInt(kamarData?.hargaPerMinggu || 0).toLocaleString("id-ID")}
                                </span>
                            </div> */}
                            <div className={styles.hargaItem}>
                                <span className={styles.hargaLabel}>Per Bulan</span>
                                <span className={styles.hargaValue}>
                                    Rp {parseInt(kamarData?.hargaPerBulan || 0).toLocaleString("id-ID")}
                                </span>
                            </div>
                            <div className={styles.hargaItem}>
                                <span className={styles.hargaLabel}>Per Tahun</span>
                                <span className={styles.hargaValue}>
                                    Rp {parseInt(kamarData?.hargaPerTahun || 0).toLocaleString("id-ID")}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.formSection}>
                    <h3 className={styles.formTitle}>✏️ Ubah Profil Kamar</h3>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Nama Kamar</label>
                        <input
                            type="text"
                            className={styles.input}
                            value={formProfil.nama}
                            onChange={(e) => setFormProfil({ ...formProfil, nama: e.target.value })}
                            placeholder="Nama kamar"
                        />
                    </div>

                    <div className={styles.priceGridForm}>
                        {/* <div className={styles.formGroup}>
                            <label className={styles.label}>Harga Per Hari</label>
                            <input
                                type="number"
                                className={styles.input}
                                value={formProfil.hargaPerHari}
                                onChange={(e) => setFormProfil({ ...formProfil, hargaPerHari: e.target.value })}
                                placeholder="0"
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Harga Per Minggu</label>
                            <input
                                type="number"
                                className={styles.input}
                                value={formProfil.hargaPerMinggu}
                                onChange={(e) => setFormProfil({ ...formProfil, hargaPerMinggu: e.target.value })}
                                placeholder="0"
                            />
                        </div> */}
                    </div>

                    <div className={styles.priceGridForm}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Harga Per Bulan</label>
                            <input
                                type="number"
                                className={styles.input}
                                value={formProfil.hargaPerBulan}
                                onChange={(e) => setFormProfil({ ...formProfil, hargaPerBulan: e.target.value })}
                                placeholder="0"
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Harga Per Tahun</label>
                            <input
                                type="number"
                                className={styles.input}
                                value={formProfil.hargaPerTahun}
                                onChange={(e) => setFormProfil({ ...formProfil, hargaPerTahun: e.target.value })}
                                placeholder="0"
                            />
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Catatan</label>
                        <textarea
                            className={styles.textarea}
                            value={formProfil.catatan}
                            onChange={(e) => setFormProfil({ ...formProfil, catatan: e.target.value })}
                            placeholder="Catatan tambahan untuk kamar"
                        />
                    </div>

                    <button
                        type="button"
                        className={styles.saveBtn}
                        onClick={onSave}
                        disabled={loading}
                    >
                        {loading ? "Menyimpan..." : "Simpan Profil"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TabProfilKamar;
