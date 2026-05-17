import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import { createKasOperasional, getKasOperasional } from "../../services/kasOperasionalService";
import styles from "./KasOperasional.module.css";

const DEFAULT_ID_KAS = "KAS-1";

const initialFilter = {
    startDate: "",
    endDate: "",
};

const initialForm = {
    tanggalMutasiKas: "",
    total: "",
    keterangan: "",
};

const formatTanggal = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(date);
};

const formatRupiah = (amount) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(Number(amount || 0));

const KasOperasional = () => {
    const [filters, setFilters] = useState(initialFilter);
    const [records, setRecords] = useState([]);
    const [loadingTable, setLoadingTable] = useState(false);
    const [errorTable, setErrorTable] = useState("");
    const [hasSearched, setHasSearched] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState(initialForm);
    const [formError, setFormError] = useState({});

    const totalKeluarPeriode = useMemo(
        () => records.reduce((sum, item) => sum + Number(item?.total || 0), 0),
        [records]
    );

    const closeModal = () => {
        setShowModal(false);
        setForm(initialForm);
        setFormError({});
    };

    const runSearch = async () => {
        setHasSearched(true);
        setErrorTable("");

        if (filters.startDate && filters.endDate && new Date(filters.endDate) < new Date(filters.startDate)) {
            setErrorTable("Tanggal akhir tidak boleh lebih kecil dari tanggal mulai.");
            setRecords([]);
            return;
        }

        const params = {
            startDate: filters.startDate || undefined,
            endDate: filters.endDate || undefined,
            id_kas: DEFAULT_ID_KAS,
            tipe: "MASUK",
            limit: 100,
        };

        try {
            setLoadingTable(true);
            const res = await getKasOperasional(params);
            const rows = Array.isArray(res?.data) ? res.data : [];
            setRecords(rows);
        } catch (err) {
            setRecords([]);
            setErrorTable(err?.message || "Gagal memuat data kas operasional.");
        } finally {
            setLoadingTable(false);
        }
    };

    const validateForm = () => {
        const nextError = {};
        if (!form.tanggalMutasiKas) nextError.tanggalMutasiKas = "Tanggal wajib diisi.";
        if (!form.total || Number(form.total) <= 0) nextError.total = "Total harus berupa angka lebih dari 0.";

        setFormError(nextError);
        return Object.keys(nextError).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            setSaving(true);
            const payload = {
                idKas: DEFAULT_ID_KAS,
                tanggalMutasiKas: form.tanggalMutasiKas,
                total: Number(form.total),
                keterangan: form.keterangan.trim(),
                tipe: "MASUK",
            };

            await createKasOperasional(payload);
            toast.success("Kas operasional berhasil dicatat.");
            closeModal();

            if (hasSearched) {
                await runSearch();
            }
        } catch (err) {
            toast.error(err?.message || "Gagal menyimpan mutasi kas.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.headerRow}>
                <div>
                    <div className={styles.titleRow}>
                        <h2 className={styles.title}>Kas Operasional</h2>
                    </div>
                    <p className={styles.subtitle}>
                        Catat dan pantau kas operasional untuk kebutuhan operasional.
                    </p>
                </div>
                <button type="button" className={styles.addButton} onClick={() => setShowModal(true)}>
                    + Tambah
                </button>
            </div>

            <div className={styles.card}>
                <div className={styles.filterGrid}>
                    <div className={styles.field}>
                        <label htmlFor="koStartDate">Tanggal mulai</label>
                        <input
                            id="koStartDate"
                            type="date"
                            className="form-control"
                            value={filters.startDate}
                            onChange={(e) => setFilters((prev) => ({ ...prev, startDate: e.target.value }))}
                        />
                    </div>
                    <div className={styles.field}>
                        <label htmlFor="koEndDate">Tanggal akhir</label>
                        <input
                            id="koEndDate"
                            type="date"
                            className="form-control"
                            value={filters.endDate}
                            onChange={(e) => setFilters((prev) => ({ ...prev, endDate: e.target.value }))}
                        />
                    </div>
                    <div className={styles.filterAction}>
                        <button type="button" className="btn btn-primary" onClick={runSearch} disabled={loadingTable}>
                            {loadingTable ? "Memuat..." : "🔍 Tampilkan"}
                        </button>
                    </div>
                </div>
            </div>

            <div className={styles.card}>
                {hasSearched && records.length > 0 && !loadingTable && !errorTable ? (
                    <div className={styles.totalInfo}>Total keluar periode ini: {formatRupiah(totalKeluarPeriode)}</div>
                ) : null}

                {loadingTable && <div className={styles.stateText}>Memuat data kas operasional...</div>}
                {!loadingTable && errorTable && <div className={styles.errorText}>{errorTable}</div>}
                {!loadingTable && !errorTable && !hasSearched && (
                    <div className={styles.stateText}>
                        Atur periode tanggal, lalu klik Tampilkan untuk memuat mutasi kas operasional.
                    </div>
                )}
                {!loadingTable && !errorTable && hasSearched && records.length === 0 && (
                    <div className={styles.stateText}>Data kas operasional tidak ditemukan.</div>
                )}

                {!loadingTable && !errorTable && hasSearched && records.length > 0 ? (
                    <div className="table-responsive">
                        <table className={`table table-hover align-middle ${styles.table}`}>
                            <thead>
                                <tr>
                                    <th>Tanggal</th>
                                    <th>Keterangan</th>
                                    <th className="text-end">Total</th>
                                    <th>Tipe</th>
                                    <th>Kas</th>
                                </tr>
                            </thead>
                            <tbody>
                                {records.map((item) => (
                                    <tr key={item.id}>
                                        <td>{formatTanggal(item.tanggalMutasiKas)}</td>
                                        <td className={styles.boldCell}>{item.keterangan || "-"}</td>
                                        <td className={`text-end ${styles.amountCell}`}>{formatRupiah(item.total)}</td>
                                        <td>
                                            <span className={styles.badgeKeluar}>{item.tipe || "KELUAR"}</span>
                                        </td>
                                        <td>{item.kas?.nama || item.kas?.id || "-"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : null}
            </div>

            {showModal ? (
                <form onSubmit={handleSubmit} className={styles.modalForm}>
                    <div className={styles.overlay}>
                        <div className={styles.modal}>
                            <div className={styles.header}>
                                <h5>Tambah Kas Operasional</h5>
                                <button type="button" onClick={closeModal} aria-label="Tutup">
                                    ×
                                </button>
                            </div>

                            <div className={styles.body}>
                                <div className={styles.section}>
                                    <div className="row">
                                        <div className="col-md-12 mb-3">
                                            <label htmlFor="tanggalMutasiKas">Tanggal *</label>
                                            <input
                                                id="tanggalMutasiKas"
                                                type="date"
                                                className={`form-control ${formError.tanggalMutasiKas ? "is-invalid" : ""}`}
                                                value={form.tanggalMutasiKas}
                                                disabled={saving}
                                                onChange={(e) =>
                                                    setForm((prev) => ({ ...prev, tanggalMutasiKas: e.target.value }))
                                                }
                                            />
                                            {formError.tanggalMutasiKas ? (
                                                <span className={styles.fieldError}>{formError.tanggalMutasiKas}</span>
                                            ) : null}
                                        </div>
                                        <div className="col-md-12 mb-3">
                                            <label htmlFor="totalKo">Total *</label>
                                            <input
                                                id="totalKo"
                                                type="number"
                                                min="0"
                                                step="1"
                                                className={`form-control ${formError.total ? "is-invalid" : ""}`}
                                                placeholder="Masukkan nominal"
                                                value={form.total}
                                                disabled={saving}
                                                onChange={(e) => setForm((prev) => ({ ...prev, total: e.target.value }))}
                                            />
                                            {formError.total ? (
                                                <span className={styles.fieldError}>{formError.total}</span>
                                            ) : null}
                                        </div>
                                        <div className="col-md-12 mb-3">
                                            <label htmlFor="keteranganKo">Keterangan (Opsional)</label>
                                            <textarea
                                                id="keteranganKo"
                                                rows={3}
                                                className={`form-control ${formError.keterangan ? "is-invalid" : ""}`}
                                                placeholder="-"
                                                value={form.keterangan}
                                                disabled={saving}
                                                onChange={(e) => setForm((prev) => ({ ...prev, keterangan: e.target.value }))}
                                            />
                                            {formError.keterangan ? (
                                                <span className={styles.fieldError}>{formError.keterangan}</span>
                                            ) : null}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.footer}>
                                <button type="button" className={styles.btnCancel} onClick={closeModal} disabled={saving}>
                                    Batal
                                </button>
                                <button type="submit" className={styles.btnSave} disabled={saving}>
                                    {saving ? "Menyimpan..." : "💾 Simpan"}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            ) : null}
        </div>
    );
};

export default KasOperasional;
