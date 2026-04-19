import styles from "./PropertiModal.module.css";

const PropertiModal = ({
    show,
    onClose,
    form,
    setForm,
    provinsiList,
    kabKotaList,
    kecamatanList,
    kelurahanList,
    onSave
}) => {
    if (!show) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>

                {/* HEADER */}
                <div className={styles.header}>
                    <h5>Tambah Properti</h5>
                    <button onClick={onClose}>✖</button>
                </div>

                {/* BODY */}
                <div className={styles.body}>

                    {/* INFORMASI UMUM */}
                    <div className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <span>Informasi Umum</span>
                            <span className={styles.emojiHome}>🏠</span>
                        </div>

                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label>Nama Properti</label>
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
                                <label>No. Telp</label>
                                <input
                                    type="text"
                                    className={`form-control ${styles.input}`}
                                    value={form.noTelp}
                                    onChange={(e) =>
                                        setForm({ ...form, noTelp: e.target.value })
                                    }
                                />
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
                            <span>Detail Lokasi</span>
                            <span className={styles.emojiLocation}>📍</span>
                        </div>

                        <div className="mb-3">
                            <label>Alamat</label>
                            <textarea
                                className={`form-control ${styles.input}`}
                                value={form.alamat}
                                onChange={(e) =>
                                    setForm({ ...form, alamat: e.target.value })
                                }
                            />
                        </div>

                        <div className="row">

                            {/* PROVINSI */}
                            <div className="col-md-6 mb-3">
                                <label>Provinsi</label>
                                <select
                                    className={`form-control ${styles.input}`}
                                    value={form.idProvinsi}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            idProvinsi: e.target.value,
                                            idKabKota: "",
                                            idKecamatan: "",
                                            idKelurahan: ""
                                        })
                                    }
                                >
                                    <option value="">-- Pilih Provinsi --</option>
                                    {provinsiList.map((prov) => (
                                        <option key={prov.id} value={prov.id}>
                                            {prov.nama}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* KAB KOTA */}
                            <div className="col-md-6 mb-3">
                                <label>Kab/Kota</label>
                                <select
                                    className={`form-control ${styles.input}`}
                                    value={form.idKabKota}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            idKabKota: e.target.value,
                                            idKecamatan: "",
                                            idKelurahan: ""
                                        })
                                    }
                                >
                                    <option value="">-- Pilih Kab/Kota --</option>
                                    {kabKotaList.map((kab) => (
                                        <option key={kab.id} value={kab.id}>
                                            {kab.nama}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* KECAMATAN */}
                            <div className="col-md-6 mb-3">
                                <label>Kecamatan</label>
                                <select
                                    className={`form-control ${styles.input}`}
                                    value={form.idKecamatan}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            idKecamatan: e.target.value,
                                            idKelurahan: ""
                                        })
                                    }
                                >
                                    <option value="">-- Pilih Kecamatan --</option>
                                    {kecamatanList.map((kec) => (
                                        <option key={kec.id} value={kec.id}>
                                            {kec.nama}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* KELURAHAN */}
                            <div className="col-md-6 mb-3">
                                <label>Kelurahan</label>
                                <select
                                    className={`form-control ${styles.input}`}
                                    value={form.idKelurahan}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            idKelurahan: e.target.value
                                        })
                                    }
                                >
                                    <option value="">-- Pilih Kelurahan --</option>
                                    {kelurahanList.map((kel) => (
                                        <option key={kel.id} value={kel.id}>
                                            {kel.nama}
                                        </option>
                                    ))}
                                </select>
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

export default PropertiModal;