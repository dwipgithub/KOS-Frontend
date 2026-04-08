import styles from "./PenyewaModal.module.css";

const PenyewaModal = ({
    show,
    onClose,
    form,
    setForm,
    jenisKelaminList,
    statusPernikahanList,
    pengenalList,
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

                    {/* INFORMASI PERSONAL */}
                    <div className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <span>Informasi Personal</span>
                            <span className={styles.emojiPersonalInformation}>🪪</span>
                        </div>

                        <div className="row">
                            <div className="col-md-12 mb-3">
                                <label>Nama Lengkap</label>
                                <input
                                    type="text"
                                    className={`form-control ${styles.input}`}
                                    value={form.nama}
                                    onChange={(e) =>
                                        setForm({ ...form, nama: e.target.value })
                                    }
                                />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label>Jenis Kelamin</label>
                                <select
                                    className={`form-control ${styles.input}`}
                                    value={form.idJenisKelamin}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            idJenisKelamin: e.target.value
                                        })
                                    }
                                >
                                    <option value="">-- Pilih Jenis Kelamin --</option>
                                    {jenisKelaminList.map((jenisKelamin) => (
                                        <option key={jenisKelamin.id} value={jenisKelamin.id}>
                                            {jenisKelamin.nama}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="col-md-6 mb-3">
                                <label>Status Pernikahan</label>
                                <select
                                    className={`form-control ${styles.input}`}
                                    value={form.idStatusPernikahan}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            idStatusPernikahan: e.target.value
                                        })
                                    }
                                >
                                    <option value="">-- Pilih Status Pernikahan --</option>
                                    {statusPernikahanList.map((statusPernikahan) => (
                                        <option key={statusPernikahan.id} value={statusPernikahan.id}>
                                            {statusPernikahan.nama}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-md-12 mb-3">
                                <label>Alamat</label>
                                <textarea
                                    className={`form-control ${styles.input}`}
                                    value={form.alamat}
                                    onChange={(e) =>
                                        setForm({ ...form, alamat: e.target.value })
                                    }
                                />
                            </div>
                        </div>
                    </div>

                    {/* IDENTITY */}
                    <div className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <span>Identitas dan Kontak</span>
                            <span className={styles.emojiIdentity}>📇</span>
                        </div>

                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label>ID Pengenal</label>
                                <select
                                    className={`form-control ${styles.input}`}
                                    value={form.idPengenal}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            idPengenal: e.target.value
                                        })
                                    }
                                >
                                    <option value="">-- Pilih ID Pengenal --</option>
                                    {pengenalList.map((pengenal) => (
                                        <option key={pengenal.id} value={pengenal.id}>
                                            {pengenal.nama}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-md-6 mb-3">
                                <label>No.Pengenal</label>
                                <input
                                    type="string"
                                    className={`form-control ${styles.input}`}
                                    value={form.noPengenal}
                                    onChange={(e) =>
                                        setForm({ ...form, noPengenal: e.target.value })
                                    }
                                />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label>No.Telp</label>
                                <input
                                    type="string"
                                    className={`form-control ${styles.input}`}
                                    value={form.noTelp}
                                    onChange={(e) =>
                                        setForm({ ...form, noTelp: e.target.value })
                                    }
                                />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label>Email</label>
                                <input
                                    type="string"
                                    className={`form-control ${styles.input}`}
                                    value={form.email}
                                    onChange={(e) =>
                                        setForm({ ...form, email: e.target.value })
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

export default PenyewaModal;