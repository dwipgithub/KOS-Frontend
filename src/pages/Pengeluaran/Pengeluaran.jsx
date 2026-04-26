import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { getProperti } from "../../services/propertiService";
import { getKamar } from "../../services/kamarService";
import { getKategoriPengeluaran } from "../../services/kategoriPengeluaranService";
import { createPengeluaran, getPengeluaran } from "../../services/pengeluaranService";
import styles from "./Pengeluaran.module.css";

const BUKTI_ACCEPT = "application/pdf,image/jpeg,image/png,image/webp,image/gif";
const BUKTI_MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIME = new Set([
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
]);

const initialFilter = {
    startDate: "",
    endDate: "",
    idProperti: "",
    idKamar: "",
};

const initialForm = {
    idProperti: "",
    idKamar: "",
    idKategoriPengeluaran: "",
    tanggalPengeluaran: "",
    nama: "",
    total: "",
    catatan: "",
    buktiPengeluaran: null,
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

const validateBukti = (file) => {
    if (!file) return "Bukti pengeluaran wajib diunggah.";
    if (file.size > BUKTI_MAX_BYTES) return "Ukuran file maksimal 10 MB.";
    if (!ALLOWED_MIME.has(file.type)) return "Hanya PDF atau gambar (JPEG, PNG, WebP, GIF).";
    return "";
};

const Pengeluaran = () => {
    const [filters, setFilters] = useState(initialFilter);
    const [records, setRecords] = useState([]);
    const [loadingTable, setLoadingTable] = useState(false);
    const [loadingMaster, setLoadingMaster] = useState(true);
    const [errorTable, setErrorTable] = useState("");
    const [hasSearched, setHasSearched] = useState(false);

    const [propertiList, setPropertiList] = useState([]);
    const [kategoriList, setKategoriList] = useState([]);
    const [filterKamarList, setFilterKamarList] = useState([]);
    const [formKamarList, setFormKamarList] = useState([]);
    const [loadingFilterKamar, setLoadingFilterKamar] = useState(false);
    const [loadingFormKamar, setLoadingFormKamar] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState(initialForm);
    const [formError, setFormError] = useState({});
    const [dragOver, setDragOver] = useState(false);
    const [previewUrl, setPreviewUrl] = useState("");
    const fileInputRef = useRef(null);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                setLoadingMaster(true);
                const [propertiRes, kategoriRes] = await Promise.all([
                    getProperti({ limit: 200 }),
                    getKategoriPengeluaran({ limit: 200 }),
                ]);

                if (cancelled) return;

                setPropertiList(Array.isArray(propertiRes?.data) ? propertiRes.data : []);
                setKategoriList(Array.isArray(kategoriRes?.data) ? kategoriRes.data : []);
            } catch (err) {
                if (!cancelled) {
                    toast.error(err?.message || "Gagal memuat data master pengeluaran.");
                }
            } finally {
                if (!cancelled) setLoadingMaster(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        if (!filters.idProperti) {
            setFilterKamarList([]);
            setFilters((prev) => ({ ...prev, idKamar: "" }));
            return;
        }

        let cancelled = false;
        (async () => {
            try {
                setLoadingFilterKamar(true);
                const res = await getKamar({ id_properti: filters.idProperti, limit: 200 });
                if (cancelled) return;
                setFilterKamarList(Array.isArray(res?.data) ? res.data : []);
            } catch {
                if (!cancelled) setFilterKamarList([]);
            } finally {
                if (!cancelled) setLoadingFilterKamar(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [filters.idProperti]);

    useEffect(() => {
        if (!form.idProperti) {
            setFormKamarList([]);
            setForm((prev) => ({ ...prev, idKamar: "" }));
            return;
        }

        let cancelled = false;
        (async () => {
            try {
                setLoadingFormKamar(true);
                const res = await getKamar({ id_properti: form.idProperti, limit: 200 });
                if (cancelled) return;
                setFormKamarList(Array.isArray(res?.data) ? res.data : []);
            } catch {
                if (!cancelled) setFormKamarList([]);
            } finally {
                if (!cancelled) setLoadingFormKamar(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [form.idProperti]);

    useEffect(() => {
        if (!form.buktiPengeluaran || form.buktiPengeluaran.type === "application/pdf") {
            setPreviewUrl("");
            return;
        }
        const url = URL.createObjectURL(form.buktiPengeluaran);
        setPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [form.buktiPengeluaran]);

    const totalPengeluaran = useMemo(
        () => records.reduce((sum, item) => sum + Number(item?.total || 0), 0),
        [records]
    );

    const closeModal = () => {
        setShowModal(false);
        setForm(initialForm);
        setFormError({});
        setDragOver(false);
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
            id_properti: filters.idProperti || undefined,
            id_kamar: filters.idKamar || undefined,
            limit: 200,
        };

        try {
            setLoadingTable(true);
            const res = await getPengeluaran(params);
            setRecords(Array.isArray(res?.data) ? res.data : []);
        } catch (err) {
            setRecords([]);
            setErrorTable(err?.message || "Gagal memuat data pengeluaran.");
        } finally {
            setLoadingTable(false);
        }
    };

    const handleChooseFile = (file) => {
        if (!file) {
            setFormError((prev) => ({ ...prev, buktiPengeluaran: "Bukti pengeluaran wajib diunggah." }));
            setForm((prev) => ({ ...prev, buktiPengeluaran: null }));
            return;
        }

        const message = validateBukti(file);
        if (message) {
            setFormError((prev) => ({ ...prev, buktiPengeluaran: message }));
            setForm((prev) => ({ ...prev, buktiPengeluaran: null }));
            return;
        }

        setFormError((prev) => ({ ...prev, buktiPengeluaran: "" }));
        setForm((prev) => ({ ...prev, buktiPengeluaran: file || null }));
    };

    const validateForm = () => {
        const nextError = {};
        if (!form.idProperti) nextError.idProperti = "Properti wajib dipilih.";
        if (!form.idKategoriPengeluaran) nextError.idKategoriPengeluaran = "Kategori pengeluaran wajib dipilih.";
        if (!form.tanggalPengeluaran) nextError.tanggalPengeluaran = "Tanggal pengeluaran wajib diisi.";
        if (!form.nama.trim()) nextError.nama = "Nama pengeluaran wajib diisi.";
        if (!form.total || Number(form.total) <= 0) nextError.total = "Jumlah pengeluaran harus lebih dari 0.";

        const buktiError = validateBukti(form.buktiPengeluaran);
        if (buktiError) nextError.buktiPengeluaran = buktiError;

        setFormError(nextError);
        return Object.keys(nextError).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            setSaving(true);
            const payload = new FormData();
            payload.append("idProperti", form.idProperti);
            payload.append("idKategoriPengeluaran", form.idKategoriPengeluaran);
            payload.append("tanggalPengeluaran", form.tanggalPengeluaran);
            payload.append("nama", form.nama.trim());
            payload.append("total", String(form.total));
            payload.append("catatan", form.catatan.trim());

            if (form.idKamar) payload.append("idKamar", form.idKamar);
            if (form.buktiPengeluaran) payload.append("buktiPengeluaran", form.buktiPengeluaran);

            await createPengeluaran(payload);
            toast.success("Pengeluaran berhasil ditambahkan.");
            closeModal();

            if (hasSearched) {
                await runSearch();
            }
        } catch (err) {
            toast.error(err?.message || "Gagal menyimpan pengeluaran.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.headerRow}>
                <div>
                    <h2 className={styles.title}>Pengeluaran</h2>
                    <p className={styles.subtitle}>
                        Kelola dan telusuri transaksi pengeluaran secara cepat dan rapi.
                    </p>
                </div>
                <button type="button" className={styles.addButton} onClick={() => setShowModal(true)}>
                    + Tambah
                </button>
            </div>

            <div className={styles.card}>
                <div className={styles.filterGrid}>
                    <div className={styles.field}>
                        <label htmlFor="startDate">Tanggal mulai</label>
                        <input
                            id="startDate"
                            type="date"
                            className="form-control"
                            value={filters.startDate}
                            onChange={(e) => setFilters((prev) => ({ ...prev, startDate: e.target.value }))}
                        />
                    </div>
                    <div className={styles.field}>
                        <label htmlFor="endDate">Tanggal akhir</label>
                        <input
                            id="endDate"
                            type="date"
                            className="form-control"
                            value={filters.endDate}
                            onChange={(e) => setFilters((prev) => ({ ...prev, endDate: e.target.value }))}
                        />
                    </div>
                    <div className={styles.field}>
                        <label htmlFor="idProperti">Properti (opsional)</label>
                        <select
                            id="idProperti"
                            className="form-select"
                            value={filters.idProperti}
                            disabled={loadingMaster}
                            onChange={(e) =>
                                setFilters((prev) => ({
                                    ...prev,
                                    idProperti: e.target.value,
                                    idKamar: "",
                                }))
                            }
                        >
                            <option value="">Semua properti</option>
                            {propertiList.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.nama}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className={styles.field}>
                        <label htmlFor="idKamar">Kamar (opsional)</label>
                        <select
                            id="idKamar"
                            className="form-select"
                            value={filters.idKamar}
                            disabled={!filters.idProperti || loadingFilterKamar}
                            onChange={(e) => setFilters((prev) => ({ ...prev, idKamar: e.target.value }))}
                        >
                            <option value="">
                                {!filters.idProperti
                                    ? "Pilih properti dahulu"
                                    : loadingFilterKamar
                                        ? "Memuat kamar..."
                                        : "Semua kamar"}
                            </option>
                            {filterKamarList.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.nama}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className={styles.filterAction}>
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={runSearch}
                            disabled={loadingTable}
                        >
                            {loadingTable ? "Memuat..." : "🔍 Tampilkan"}
                        </button>
                    </div>
                </div>
            </div>

            <div className={styles.card}>
                {hasSearched && records.length > 0 && !loadingTable && !errorTable ? (
                    <div className={styles.totalInfo}>Total Pengeluaran: {formatRupiah(totalPengeluaran)}</div>
                ) : null}

                {loadingTable && <div className={styles.stateText}>Memuat data pengeluaran...</div>}
                {!loadingTable && errorTable && <div className={styles.errorText}>{errorTable}</div>}
                {!loadingTable && !errorTable && !hasSearched && (
                    <div className={styles.stateText}>
                        Atur filter sesuai kebutuhan, lalu klik tombol Cari untuk menampilkan data.
                    </div>
                )}
                {!loadingTable && !errorTable && hasSearched && records.length === 0 && (
                    <div className={styles.stateText}>Data pengeluaran tidak ditemukan.</div>
                )}

                {!loadingTable && !errorTable && hasSearched && records.length > 0 ? (
                    <div className="table-responsive">
                        <table className={`table table-hover align-middle ${styles.table}`}>
                            <thead>
                                <tr>
                                    <th>Tanggal</th>
                                    <th>Nama Pengeluaran</th>
                                    <th>Kategori</th>
                                    <th>Properti</th>
                                    <th>Kamar</th>
                                    <th>Catatan</th>
                                    <th className="text-end">Jumlah</th>
                                </tr>
                            </thead>
                            <tbody>
                                {records.map((item) => (
                                    <tr key={item.id}>
                                        <td>{formatTanggal(item.tanggalPengeluaran)}</td>
                                        <td className={styles.boldCell}>{item.nama || "-"}</td>
                                        <td>{item.kategoriPengeluaran?.nama || "-"}</td>
                                        <td>{item.properti?.nama || "-"}</td>
                                        <td>{item.kamar?.nama || "-"}</td>
                                        <td>{item.catatan || "-"}</td>
                                        <td className={`text-end ${styles.amountCell}`}>
                                            {formatRupiah(item.total)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : null}
            </div>

            {showModal ? (
                <form onSubmit={handleSubmit} className={styles.modalForm}>
                    <div
                        className={styles.overlay}>
                        <div className={styles.modal}>
                            <div className={styles.header}>
                                <h5>Tambah Pengeluaran</h5>
                                <button type="button" onClick={closeModal}>
                                    ×
                                </button>
                            </div>

                            {/* BODY */}
                            <div className={styles.body}>
                                <div className={styles.section}>
                                    <div className={styles.sectionHeader}>
                                        <span>Informasi Utama</span>
                                    </div>
                                    <p className={styles.sectionDescription}>
                                        Pilih properti, kamar, kategori, dan tanggal transaksi.
                                    </p>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label>Pilih Properti *</label>
                                            <select
                                                className={`form-select ${formError.idProperti ? "is-invalid" : ""}`}
                                                value={form.idProperti}
                                                disabled={saving || loadingMaster}
                                                onChange={(e) =>
                                                    setForm((prev) => ({
                                                        ...prev,
                                                        idProperti: e.target.value,
                                                        idKamar: "",
                                                    }))
                                                }
                                            >
                                                <option value="">-- Pilih properti --</option>
                                                {propertiList.map((item) => (
                                                    <option key={item.id} value={item.id}>
                                                        {item.nama}
                                                    </option>
                                                ))}
                                            </select>
                                            {formError.idProperti ? (
                                                <span className={styles.fieldError}>{formError.idProperti}</span>
                                            ) : null}
                                        </div>

                                        <div className="col-md-6 mb-3">
                                            <label>Pilih Kamar (opsional)</label>
                                            <select
                                                className="form-select"
                                                value={form.idKamar}
                                                disabled={!form.idProperti || saving || loadingFormKamar}
                                                onChange={(e) => setForm((prev) => ({ ...prev, idKamar: e.target.value }))}
                                            >
                                                <option value="">
                                                    {!form.idProperti
                                                        ? "-- Pilih properti dahulu --"
                                                        : loadingFormKamar
                                                            ? "Memuat kamar..."
                                                            : "-- Tanpa kamar --"}
                                                </option>
                                                {formKamarList.map((item) => (
                                                    <option key={item.id} value={item.id}>
                                                        {item.nama}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="col-md-6 mb-3">
                                            <label>Pilih Kategori Pengeluaran *</label>
                                            <select
                                                className={`form-select ${formError.idKategoriPengeluaran ? "is-invalid" : ""
                                                    }`}
                                                value={form.idKategoriPengeluaran}
                                                disabled={saving || loadingMaster}
                                                onChange={(e) =>
                                                    setForm((prev) => ({
                                                        ...prev,
                                                        idKategoriPengeluaran: e.target.value,
                                                    }))
                                                }
                                            >
                                                <option value="">-- Pilih kategori --</option>
                                                {kategoriList.map((item) => (
                                                    <option key={item.id} value={item.id}>
                                                        {item.nama}
                                                    </option>
                                                ))}
                                            </select>
                                            {formError.idKategoriPengeluaran ? (
                                                <span className={styles.fieldError}>
                                                    {formError.idKategoriPengeluaran}
                                                </span>
                                            ) : null}
                                        </div>

                                        <div className="col-md-6 mb-3">
                                            <label>Tanggal Pengeluaran *</label>
                                            <input
                                                type="date"
                                                className={`form-control ${formError.tanggalPengeluaran ? "is-invalid" : ""
                                                    }`}
                                                value={form.tanggalPengeluaran}
                                                disabled={saving}
                                                onChange={(e) =>
                                                    setForm((prev) => ({
                                                        ...prev,
                                                        tanggalPengeluaran: e.target.value,
                                                    }))
                                                }
                                            />
                                            {formError.tanggalPengeluaran ? (
                                                <span className={styles.fieldError}>{formError.tanggalPengeluaran}</span>
                                            ) : null}
                                        </div>

                                    </div>

                                </div>

                                <div className={styles.section}>
                                    <div className={styles.sectionHeader}>
                                        <span>Detail Pengeluaran</span>
                                    </div>
                                    <p className={styles.sectionDescription}>
                                        Lengkapi nama, nominal, dan catatan bila diperlukan.
                                    </p>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label>Nama Pengeluaran *</label>
                                            <input
                                                type="text"
                                                className={`form-control ${formError.nama ? "is-invalid" : ""}`}
                                                placeholder="Contoh: Perbaikan atap kamar 2A"
                                                value={form.nama}
                                                disabled={saving}
                                                onChange={(e) => setForm((prev) => ({ ...prev, nama: e.target.value }))}
                                            />
                                            {formError.nama ? (
                                                <span className={styles.fieldError}>{formError.nama}</span>
                                            ) : null}
                                        </div>

                                        <div className="col-md-6 mb-3">
                                            <label>Jumlah Pengeluaran *</label>
                                            <input
                                                type="number"
                                                min="0"
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
                                            <label>Catatan (opsional)</label>
                                            <textarea
                                                rows={3}
                                                className="form-control"
                                                placeholder="Tambahkan catatan bila diperlukan"
                                                value={form.catatan}
                                                disabled={saving}
                                                onChange={(e) => setForm((prev) => ({ ...prev, catatan: e.target.value }))}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.section}>
                                    <div className={styles.formCardHeader}>
                                        <h5>Bukti Pengeluaran</h5>
                                        <p>Wajib upload PDF atau gambar dengan drag & drop.</p>
                                    </div>
                                    <div className={styles.field}>
                                        <label>
                                            Upload Bukti Pengeluaran *
                                        </label>
                                        <p className={styles.hintText}>Wajib — PDF atau gambar, maksimal 10 MB.</p>
                                        <div
                                            className={`${styles.dropzone} ${dragOver ? styles.dropzoneActive : ""}`}
                                            role="button"
                                            tabIndex={0}
                                            onClick={() => fileInputRef.current?.click()}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter" || e.key === " ") {
                                                    e.preventDefault();
                                                    fileInputRef.current?.click();
                                                }
                                            }}
                                            onDragOver={(e) => {
                                                e.preventDefault();
                                                if (!saving) setDragOver(true);
                                            }}
                                            onDragLeave={() => setDragOver(false)}
                                            onDrop={(e) => {
                                                e.preventDefault();
                                                setDragOver(false);
                                                if (saving) return;
                                                const file = e.dataTransfer.files?.[0];
                                                handleChooseFile(file || null);
                                            }}
                                        >
                                            {form.buktiPengeluaran && previewUrl ? (
                                                <div className={styles.filePicked}>
                                                    <img
                                                        src={previewUrl}
                                                        alt="Pratinjau bukti pengeluaran"
                                                        className={styles.preview}
                                                    />
                                                    <div className={styles.fileMeta}>
                                                        <span className={styles.fileName}>{form.buktiPengeluaran.name}</span>
                                                        <span className={styles.fileSize}>
                                                            {(form.buktiPengeluaran.size / 1024).toFixed(1)} KB
                                                        </span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        className={styles.btnRemoveFile}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setForm((prev) => ({ ...prev, buktiPengeluaran: null }));
                                                            setFormError((prev) => ({
                                                                ...prev,
                                                                buktiPengeluaran: "Bukti pengeluaran wajib diunggah.",
                                                            }));
                                                        }}
                                                    >
                                                        Hapus
                                                    </button>
                                                </div>
                                            ) : null}

                                            {form.buktiPengeluaran && form.buktiPengeluaran.type === "application/pdf" ? (
                                                <div className={styles.filePicked}>
                                                    <div className={styles.pdfBadge}>PDF</div>
                                                    <div className={styles.fileMeta}>
                                                        <span className={styles.fileName}>{form.buktiPengeluaran.name}</span>
                                                        <span className={styles.fileSize}>
                                                            {(form.buktiPengeluaran.size / 1024).toFixed(1)} KB
                                                        </span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        className={styles.btnRemoveFile}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setForm((prev) => ({ ...prev, buktiPengeluaran: null }));
                                                            setFormError((prev) => ({
                                                                ...prev,
                                                                buktiPengeluaran: "Bukti pengeluaran wajib diunggah.",
                                                            }));
                                                        }}
                                                    >
                                                        Hapus
                                                    </button>
                                                </div>
                                            ) : null}

                                            {!form.buktiPengeluaran ? (
                                                <div className={styles.dropPlaceholder}>
                                                    <strong>Seret file ke sini</strong>
                                                    <span>atau klik untuk memilih file</span>
                                                </div>
                                            ) : null}
                                        </div>

                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept={BUKTI_ACCEPT}
                                            className={styles.fileInput}
                                            onChange={(e) => {
                                                handleChooseFile(e.target.files?.[0] || null);
                                                e.target.value = "";
                                            }}
                                        />
                                        {formError.buktiPengeluaran ? (
                                            <span className={styles.fieldError}>{formError.buktiPengeluaran}</span>
                                        ) : null}
                                    </div>
                                </div>

                                
                            </div>

                            {/* FOOTER */}
                            <div className={styles.footer}>
                                <button type="button" className={styles.btnCancel} onClick={closeModal} disabled={saving}>
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className={styles.btnSave}
                                    disabled={saving || !form.buktiPengeluaran || !!formError.buktiPengeluaran}
                                >
                                    💾 Simpan
                                </button>
                            </div>

                            {/* <form onSubmit={handleSubmit} className={styles.modalForm}>
                            <section className={styles.formCard}>
                                <div className={styles.formCardHeader}>
                                    <h5>Informasi Utama</h5>
                                    <p>Pilih properti, kamar, kategori, dan tanggal transaksi.</p>
                                </div>
                                <div className={styles.modalGrid}>
                                    <div className={styles.field}>
                                        <label>Pilih Properti *</label>
                                        <select
                                            className={`form-select ${formError.idProperti ? "is-invalid" : ""}`}
                                            value={form.idProperti}
                                            disabled={saving || loadingMaster}
                                            onChange={(e) =>
                                                setForm((prev) => ({
                                                    ...prev,
                                                    idProperti: e.target.value,
                                                    idKamar: "",
                                                }))
                                            }
                                        >
                                            <option value="">-- Pilih properti --</option>
                                            {propertiList.map((item) => (
                                                <option key={item.id} value={item.id}>
                                                    {item.nama}
                                                </option>
                                            ))}
                                        </select>
                                        {formError.idProperti ? (
                                            <span className={styles.fieldError}>{formError.idProperti}</span>
                                        ) : null}
                                    </div>

                                    <div className={styles.field}>
                                        <label>Pilih Kamar (opsional)</label>
                                        <select
                                            className="form-select"
                                            value={form.idKamar}
                                            disabled={!form.idProperti || saving || loadingFormKamar}
                                            onChange={(e) => setForm((prev) => ({ ...prev, idKamar: e.target.value }))}
                                        >
                                            <option value="">
                                                {!form.idProperti
                                                    ? "-- Pilih properti dahulu --"
                                                    : loadingFormKamar
                                                    ? "Memuat kamar..."
                                                    : "-- Tanpa kamar --"}
                                            </option>
                                            {formKamarList.map((item) => (
                                                <option key={item.id} value={item.id}>
                                                    {item.nama}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className={styles.field}>
                                        <label>Pilih Kategori Pengeluaran *</label>
                                        <select
                                            className={`form-select ${
                                                formError.idKategoriPengeluaran ? "is-invalid" : ""
                                            }`}
                                            value={form.idKategoriPengeluaran}
                                            disabled={saving || loadingMaster}
                                            onChange={(e) =>
                                                setForm((prev) => ({
                                                    ...prev,
                                                    idKategoriPengeluaran: e.target.value,
                                                }))
                                            }
                                        >
                                            <option value="">-- Pilih kategori --</option>
                                            {kategoriList.map((item) => (
                                                <option key={item.id} value={item.id}>
                                                    {item.nama}
                                                </option>
                                            ))}
                                        </select>
                                        {formError.idKategoriPengeluaran ? (
                                            <span className={styles.fieldError}>
                                                {formError.idKategoriPengeluaran}
                                            </span>
                                        ) : null}
                                    </div>

                                    <div className={styles.field}>
                                        <label>Tanggal Pengeluaran *</label>
                                        <input
                                            type="date"
                                            className={`form-control ${
                                                formError.tanggalPengeluaran ? "is-invalid" : ""
                                            }`}
                                            value={form.tanggalPengeluaran}
                                            disabled={saving}
                                            onChange={(e) =>
                                                setForm((prev) => ({
                                                    ...prev,
                                                    tanggalPengeluaran: e.target.value,
                                                }))
                                            }
                                        />
                                        {formError.tanggalPengeluaran ? (
                                            <span className={styles.fieldError}>{formError.tanggalPengeluaran}</span>
                                        ) : null}
                                    </div>
                                </div>
                            </section>

                            <section className={styles.formCard}>
                                <div className={styles.formCardHeader}>
                                    <h5>Detail Pengeluaran</h5>
                                    <p>Lengkapi nama, nominal, dan catatan bila diperlukan.</p>
                                </div>
                                <div className={styles.modalGrid}>
                                    <div className={styles.field}>
                                        <label>Nama Pengeluaran *</label>
                                        <input
                                            type="text"
                                            className={`form-control ${formError.nama ? "is-invalid" : ""}`}
                                            placeholder="Contoh: Perbaikan atap kamar 2A"
                                            value={form.nama}
                                            disabled={saving}
                                            onChange={(e) => setForm((prev) => ({ ...prev, nama: e.target.value }))}
                                        />
                                        {formError.nama ? (
                                            <span className={styles.fieldError}>{formError.nama}</span>
                                        ) : null}
                                    </div>

                                    <div className={styles.field}>
                                        <label>Jumlah Pengeluaran *</label>
                                        <input
                                            type="number"
                                            min="0"
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
                                </div>
                                <div className={styles.field}>
                                    <label>Catatan (opsional)</label>
                                    <textarea
                                        rows={3}
                                        className="form-control"
                                        placeholder="Tambahkan catatan bila diperlukan"
                                        value={form.catatan}
                                        disabled={saving}
                                        onChange={(e) => setForm((prev) => ({ ...prev, catatan: e.target.value }))}
                                    />
                                </div>
                            </section>

                            <section className={styles.formCard}>
                                <div className={styles.formCardHeader}>
                                    <h5>Bukti Pengeluaran</h5>
                                    <p>Wajib upload PDF atau gambar dengan drag & drop.</p>
                                </div>
                                <div className={styles.field}>
                                    <label>
                                        Upload Bukti Pengeluaran *
                                    </label>
                                    <p className={styles.hintText}>Wajib — PDF atau gambar, maksimal 10 MB.</p>
                                    <div
                                        className={`${styles.dropzone} ${dragOver ? styles.dropzoneActive : ""}`}
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => fileInputRef.current?.click()}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" || e.key === " ") {
                                                e.preventDefault();
                                                fileInputRef.current?.click();
                                            }
                                        }}
                                        onDragOver={(e) => {
                                            e.preventDefault();
                                            if (!saving) setDragOver(true);
                                        }}
                                        onDragLeave={() => setDragOver(false)}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            setDragOver(false);
                                            if (saving) return;
                                            const file = e.dataTransfer.files?.[0];
                                            handleChooseFile(file || null);
                                        }}
                                    >
                                        {form.buktiPengeluaran && previewUrl ? (
                                            <div className={styles.filePicked}>
                                                <img
                                                    src={previewUrl}
                                                    alt="Pratinjau bukti pengeluaran"
                                                    className={styles.preview}
                                                />
                                                <div className={styles.fileMeta}>
                                                    <span className={styles.fileName}>{form.buktiPengeluaran.name}</span>
                                                    <span className={styles.fileSize}>
                                                        {(form.buktiPengeluaran.size / 1024).toFixed(1)} KB
                                                    </span>
                                                </div>
                                                <button
                                                    type="button"
                                                    className={styles.btnRemoveFile}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setForm((prev) => ({ ...prev, buktiPengeluaran: null }));
                                                        setFormError((prev) => ({
                                                            ...prev,
                                                            buktiPengeluaran: "Bukti pengeluaran wajib diunggah.",
                                                        }));
                                                    }}
                                                >
                                                    Hapus
                                                </button>
                                            </div>
                                        ) : null}

                                        {form.buktiPengeluaran && form.buktiPengeluaran.type === "application/pdf" ? (
                                            <div className={styles.filePicked}>
                                                <div className={styles.pdfBadge}>PDF</div>
                                                <div className={styles.fileMeta}>
                                                    <span className={styles.fileName}>{form.buktiPengeluaran.name}</span>
                                                    <span className={styles.fileSize}>
                                                        {(form.buktiPengeluaran.size / 1024).toFixed(1)} KB
                                                    </span>
                                                </div>
                                                <button
                                                    type="button"
                                                    className={styles.btnRemoveFile}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setForm((prev) => ({ ...prev, buktiPengeluaran: null }));
                                                        setFormError((prev) => ({
                                                            ...prev,
                                                            buktiPengeluaran: "Bukti pengeluaran wajib diunggah.",
                                                        }));
                                                    }}
                                                >
                                                    Hapus
                                                </button>
                                            </div>
                                        ) : null}

                                        {!form.buktiPengeluaran ? (
                                            <div className={styles.dropPlaceholder}>
                                                <strong>Seret file ke sini</strong>
                                                <span>atau klik untuk memilih file</span>
                                            </div>
                                        ) : null}
                                    </div>

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept={BUKTI_ACCEPT}
                                        className={styles.fileInput}
                                        onChange={(e) => {
                                            handleChooseFile(e.target.files?.[0] || null);
                                            e.target.value = "";
                                        }}
                                    />
                                    {formError.buktiPengeluaran ? (
                                        <span className={styles.fieldError}>{formError.buktiPengeluaran}</span>
                                    ) : null}
                                </div>
                            </section>

                            <div className={styles.modalActions}>
                                <button type="button" className="btn btn-outline-secondary" onClick={closeModal} disabled={saving}>
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={saving || !form.buktiPengeluaran || !!formError.buktiPengeluaran}
                                >
                                    {saving ? "Menyimpan..." : "Simpan"}
                                </button>
                            </div>
                        </form> */}
                        </div>
                    </div>
                </form>
            ) : null}
        </div>
    );
};

export default Pengeluaran;
