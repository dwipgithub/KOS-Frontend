import styles from "./KamarModal.module.css";

const KamariModal = ({
    show,
    onClose,
    form,
    setForm,
    propertiList,
    statusKamarList,
    onSave
}) => {
    if (!show) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>

                {/* HEADER */}
                <div className={styles.header}>
                    <h5>Tambah Kamar</h5>
                    <button onClick={onClose}>✖</button>
                </div>

                {/* BODY */}
                <div className={styles.body}>

                    {/* INFORMASI UMUM */}
                    <div className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <span>Informasi Umum</span>
                            <span className={styles.emojiCurrency}>🛏️</span>
                            
                        </div>

                        <div className="row">
                            <div className="col-md-4 mb-3">
                                <label>Nama Kamar</label>
                                <input
                                    type="text"
                                    className={`form-control ${styles.input}`}
                                    value={form.nama}
                                    onChange={(e) =>
                                        setForm({ ...form, nama: e.target.value })
                                    }
                                />
                            </div>

                            <div className="col-md-4 mb-3">
                                <label>Nama Properti</label>
                                <select
                                    className={`form-control ${styles.input}`}
                                    value={form.idProperti}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            idProperti: e.target.value
                                        })
                                    }
                                >
                                    <option value="">-- Pilih Nama Properti --</option>
                                    {propertiList.map((properti) => (
                                        <option key={properti.id} value={properti.id}>
                                            {properti.nama}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="col-md-4 mb-3">
                                <label>Status Kamar</label>
                                <select
                                    className={`form-control ${styles.input}`}
                                    value={form.idStatusKamar}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            idStatusKamar: e.target.value
                                        })
                                    }
                                >
                                    <option value="">-- Pilih Status Kamar --</option>
                                    {statusKamarList.map((statusKamar) => (
                                        <option key={statusKamar.id} value={statusKamar.id}>
                                            {statusKamar.nama}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="mb-3">
                            <label>Catatan</label>
                            <textarea
                                className={`form-control ${styles.input}`}
                                value={form.catatan}
                                onChange={(e) =>
                                    setForm({ ...form, catatan: e.target.value })
                                }
                            />
                        </div>
                    </div>

                    {/* DETAIL LOKASI */}
                    <div className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <span>Harga Detail</span>
                            <span className={styles.emojiCurrency}>💰</span>
                        </div>

                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label>Harga Per Hari</label>
                                <input
                                    type="number"
                                    className={`form-control ${styles.input}`}
                                    value={form.hargaPerHari}
                                    onChange={(e) =>
                                        setForm({ ...form, hargaPerHari: e.target.value })
                                    }
                                />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label>Harga Per Minggu</label>
                                <input
                                    type="number"
                                    className={`form-control ${styles.input}`}
                                    value={form.hargaPerMinggu}
                                    onChange={(e) =>
                                        setForm({ ...form, hargaPerMinggu: e.target.value })
                                    }
                                />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label>Harga Per Bulan</label>
                                <input
                                    type="number"
                                    className={`form-control ${styles.input}`}
                                    value={form.hargaPerBulan}
                                    onChange={(e) =>
                                        setForm({ ...form, hargaPerBulan: e.target.value })
                                    }
                                />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label>Harga Per Tahun</label>
                                <input
                                    type="number"
                                    className={`form-control ${styles.input}`}
                                    value={form.hargaPerTahun}
                                    onChange={(e) =>
                                        setForm({ ...form, hargaPerTahun: e.target.value })
                                    }
                                />
                            </div>

                        </div>
                    </div>
                </div>

                {/* FOOTER */}
                <div className={styles.footer}>
                    <button className={styles.btnCancel} onClick={onClose}>
                        Batal
                    </button>
                    <button className={styles.btnSave} onClick={onSave}>
                        💾 Simpan
                    </button>
                </div>

            </div>
        </div>
    );
};

export default KamariModal;