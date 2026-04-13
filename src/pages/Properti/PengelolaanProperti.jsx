import { useParams, useNavigate } from "react-router-dom";
import { usePengelolaanProperti } from "./hook/usePengelolaanProperti";
import styles from "./PengelolaanProperti.module.css";

const EMO = {
    rumah: String.fromCodePoint(0x1f3e0),
    kamar: String.fromCodePoint(0x1f6cf),
    edit: String.fromCodePoint(0x270f, 0xfe0f)
};

const formatAlamatLengkap = (d) => {
    if (!d) return "—";
    return [d.alamat, d.kelurahan?.nama, d.kecamatan?.nama, d.kabKota?.nama, d.provinsi?.nama]
        .filter(Boolean)
        .join(", ") || "—";
};

const statusClass = (status) => {
    switch (status) {
        case "Tersedia":
            return styles.badgeHijau;
        case "Sudah disewa":
            return styles.badgeMerah;
        case "Sudah dipesan":
            return styles.badgeKuning;
        default:
            return styles.badgeNetral;
    }
};

const PengelolaanProperti = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const {
        propertiData,
        form,
        setForm,
        provinsiList,
        kabKotaList,
        kecamatanList,
        kelurahanList,
        loading,
        saving,
        handleSave,
        handleProvinsiChange,
        handleKabKotaChange,
        handleKecamatanChange,
        handleKelurahanChange
    } = usePengelolaanProperti(id);

    const handleBack = () => navigate("/properti");
    const kamarList = propertiData?.kamar || [];
    const jumlahKamar = kamarList.length;

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div className={styles.headerInner}>
                    <button type="button" className={styles.backBtn} onClick={handleBack}>
                        ← Kembali
                    </button>
                    <div className={styles.headerText}>
                        <h1 className={styles.title}>Pengelolaan Properti</h1>
                        <p className={styles.subtitle}>
                            {loading ? "Memuat…" : propertiData?.nama || "—"}
                        </p>
                    </div>
                </div>
            </header>

            <div className={styles.body}>
                {loading && (
                    <div className={styles.loading}>
                        <div className={styles.spinner} aria-hidden />
                        <p>Memuat data properti…</p>
                    </div>
                )}

                {!loading && !propertiData && (
                    <div className={styles.empty}>
                        <p>Properti tidak ditemukan.</p>
                        <button type="button" className={styles.secondaryBtn} onClick={handleBack}>
                            Kembali ke daftar
                        </button>
                    </div>
                )}

                {!loading && propertiData && (
                    <div className={styles.grid}>
                        <section className={styles.column}>
                            <article className={styles.card}>
                                <div className={styles.cardHead}>
                                    <span className={styles.cardIcon} aria-hidden>{EMO.rumah}</span>
                                    <div>
                                        <h2 className={styles.cardTitle}>Profil properti</h2>
                                        <p className={styles.cardDesc}>Informasi singkat yang tersimpan</p>
                                    </div>
                                </div>

                                <div className={styles.hero}>
                                    <div className={styles.heroIcon} aria-hidden>{EMO.rumah}</div>
                                    <div>
                                        <h3 className={styles.heroTitle}>{propertiData.nama}</h3>
                                        <p className={styles.heroMeta}>
                                            {jumlahKamar} kamar terdaftar
                                        </p>
                                    </div>
                                </div>

                                <div className={styles.infoGrid}>
                                    <div className={styles.infoCell}>
                                        <span className={styles.label}>Telepon</span>
                                        <span className={styles.value}>{propertiData.noTelp || "—"}</span>
                                    </div>
                                    <div className={`${styles.infoCell} ${styles.span2}`}>
                                        <span className={styles.label}>Alamat lengkap</span>
                                        <span className={styles.value}>{formatAlamatLengkap(propertiData)}</span>
                                    </div>
                                    <div className={`${styles.infoCell} ${styles.span2}`}>
                                        <span className={styles.label}>Catatan</span>
                                        <span className={styles.value}>
                                            {propertiData.catatan?.trim() ? propertiData.catatan : "—"}
                                        </span>
                                    </div>
                                </div>
                            </article>

                            <article className={styles.card}>
                                <div className={styles.cardHead}>
                                    <span className={styles.cardIcon} aria-hidden>{EMO.kamar}</span>
                                    <div>
                                        <h2 className={styles.cardTitle}>Kamar</h2>
                                        <p className={styles.cardDesc}>Ringkasan status sewa per kamar</p>
                                    </div>
                                </div>

                                {jumlahKamar === 0 ? (
                                    <p className={styles.muted}>Belum ada kamar pada properti ini.</p>
                                ) : (
                                    <ul className={styles.kamarList}>
                                        {kamarList.map((k) => (
                                            <li key={k.id} className={styles.kamarRow}>
                                                <span className={styles.kamarNama}>{k.nama}</span>
                                                <span className={statusClass(k.statusSewa)}>
                                                    {k.statusSewa}
                                                </span>
                                                <span className={styles.kamarHarga}>
                                                    Rp {Number(k.hargaPerBulan || 0).toLocaleString("id-ID")}
                                                    <span className={styles.per}> / bln</span>
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </article>
                        </section>

                        <section className={styles.column}>
                            <article className={styles.card}>
                                <div className={styles.cardHead}>
                                    <span className={styles.cardIcon} aria-hidden>{EMO.edit}</span>
                                    <div>
                                        <h2 className={styles.cardTitle}>Ubah data properti</h2>
                                        <p className={styles.cardDesc}>Perbarui nama, kontak, dan lokasi</p>
                                    </div>
                                </div>

                                <div className={styles.formGrid}>
                                    <label className={styles.field}>
                                        <span className={styles.fieldLabel}>Nama properti</span>
                                        <input
                                            type="text"
                                            className={styles.input}
                                            value={form.nama}
                                            onChange={(e) => setForm({ ...form, nama: e.target.value })}
                                        />
                                    </label>
                                    <label className={styles.field}>
                                        <span className={styles.fieldLabel}>No. telepon</span>
                                        <input
                                            type="text"
                                            className={styles.input}
                                            value={form.noTelp}
                                            onChange={(e) => setForm({ ...form, noTelp: e.target.value })}
                                        />
                                    </label>

                                    <label className={`${styles.field} ${styles.span2}`}>
                                        <span className={styles.fieldLabel}>Catatan</span>
                                        <textarea
                                            className={styles.textarea}
                                            rows={3}
                                            value={form.catatan}
                                            onChange={(e) => setForm({ ...form, catatan: e.target.value })}
                                        />
                                    </label>

                                    <label className={`${styles.field} ${styles.span2}`}>
                                        <span className={styles.fieldLabel}>Alamat jalan / detail</span>
                                        <textarea
                                            className={styles.textarea}
                                            rows={3}
                                            value={form.alamat}
                                            onChange={(e) => setForm({ ...form, alamat: e.target.value })}
                                        />
                                    </label>

                                    <label className={styles.field}>
                                        <span className={styles.fieldLabel}>Provinsi</span>
                                        <select
                                            className={styles.input}
                                            value={form.idProvinsi}
                                            onChange={(e) => handleProvinsiChange(e.target.value)}
                                        >
                                            <option value="">Pilih</option>
                                            {provinsiList.map((p) => (
                                                <option key={p.id} value={p.id}>
                                                    {p.nama}
                                                </option>
                                            ))}
                                        </select>
                                    </label>

                                    <label className={styles.field}>
                                        <span className={styles.fieldLabel}>Kabupaten / kota</span>
                                        <select
                                            className={styles.input}
                                            value={form.idKabKota}
                                            onChange={(e) => handleKabKotaChange(e.target.value)}
                                            disabled={!form.idProvinsi}
                                        >
                                            <option value="">Pilih</option>
                                            {kabKotaList.map((k) => (
                                                <option key={k.id} value={k.id}>
                                                    {k.nama}
                                                </option>
                                            ))}
                                        </select>
                                    </label>

                                    <label className={styles.field}>
                                        <span className={styles.fieldLabel}>Kecamatan</span>
                                        <select
                                            className={styles.input}
                                            value={form.idKecamatan}
                                            onChange={(e) => handleKecamatanChange(e.target.value)}
                                            disabled={!form.idKabKota}
                                        >
                                            <option value="">Pilih</option>
                                            {kecamatanList.map((k) => (
                                                <option key={k.id} value={k.id}>
                                                    {k.nama}
                                                </option>
                                            ))}
                                        </select>
                                    </label>

                                    <label className={styles.field}>
                                        <span className={styles.fieldLabel}>Kelurahan</span>
                                        <select
                                            className={styles.input}
                                            value={form.idKelurahan}
                                            onChange={(e) => handleKelurahanChange(e.target.value)}
                                            disabled={!form.idKecamatan}
                                        >
                                            <option value="">Pilih</option>
                                            {kelurahanList.map((k) => (
                                                <option key={k.id} value={k.id}>
                                                    {k.nama}
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                </div>

                                <button
                                    type="button"
                                    className={styles.primaryBtn}
                                    onClick={handleSave}
                                    disabled={saving}
                                >
                                    {saving ? "Menyimpan…" : "Simpan perubahan"}
                                </button>
                            </article>
                        </section>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PengelolaanProperti;
