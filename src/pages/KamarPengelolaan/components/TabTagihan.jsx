import { useState, useEffect } from "react";
import BayarModal from "../../../components/BayarModal/BayarModal";
import ConfirmDialog from "../../../components/ConfirmDialog/ConfirmDialog";
import { getDeskripsiTagihan } from "../../../services/deskripsiTagihan";
import styles from "./TabTagihan.module.css";
import { CreditCard, Trash2 } from "lucide-react";

const TabTagihan = ({
    tagihanList,
    formPembayaran,
    setFormPembayaran,
    onSavePembayaran,
    formTagihan,
    setFormTagihan,
    onSaveTagihan,
    onDeleteTagihan,
    sewaData,
    loading,
    savingTagihan,
    deletingTagihanId
}) => {

    // =========================
    // STATE
    // =========================
    const [showModal, setShowModal] = useState(false);
    const [selectedTagihan, setSelectedTagihan] = useState(null);

    const [showConfirmDelete, setShowConfirmDelete] = useState(false);
    const [selectedTagihanDelete, setSelectedTagihanDelete] = useState(null);

    const [deskripsiOptions, setDeskripsiOptions] = useState([]);

    // =========================
    // LOAD DESKRIPSI TAGIHAN
    // =========================
    useEffect(() => {
        const loadDeskripsiTagihan = async () => {
            try {
                const response = await getDeskripsiTagihan();

                // response.data contains array
                setDeskripsiOptions(response.data || []);
            } catch (error) {
                console.error("Gagal load deskripsi tagihan:", error);
            }
        };

        loadDeskripsiTagihan();
    }, []);

    // =========================
    // HANDLE DELETE
    // =========================
    const handleConfirmDelete = (tagihan) => {
        setSelectedTagihanDelete(tagihan);
        setShowConfirmDelete(true);
    };

    const handleDeleteConfirmed = async () => {
        if (selectedTagihanDelete?.id) {
            await onDeleteTagihan(selectedTagihanDelete.id);

            setShowConfirmDelete(false);
            setSelectedTagihanDelete(null);
        }
    };

    // =========================
    // LOADING
    // =========================
    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loadingContainer}>
                    <div className={styles.spinner}></div>
                    <p>Memuat data tagihan...</p>
                </div>
            </div>
        );
    }

    const tagihanArray = Array.isArray(tagihanList)
        ? tagihanList
        : [];

    // =========================
    // EMPTY STATE
    // =========================
    if (tagihanArray.length === 0) {
        return (
            <div className={styles.container}>
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>💰</div>

                    <h3 className={styles.emptyTitle}>
                        Belum Ada Tagihan
                    </h3>

                    <p className={styles.emptySubtitle}>
                        Tidak ada tagihan untuk sewa ini.
                        Semua pembayaran sudah lunas!
                    </p>
                </div>
            </div>
        );
    }

    // =========================
    // TOTAL
    // =========================
    const totalTagihan = tagihanArray.reduce(
        (sum, item) => sum + (parseInt(item.total) || 0),
        0
    );

    // =========================
    // HANDLE BAYAR
    // =========================
    const handleBayar = (tagihan) => {
        setSelectedTagihan(tagihan);
        setShowModal(true);
    };

    const handleSave = async (payload) => {
        const success = await onSavePembayaran(payload);

        if (success) {
            setShowModal(false);
        }
    };

    return (
        <div className={styles.container}>

            {/* ========================= */}
            {/* FORM BUAT TAGIHAN */}
            {/* ========================= */}
            {sewaData?.id && (
                <div className={styles.formCreateTagihanCard}>

                    <div className={styles.formHeader}>
                        <h3 className={styles.formTitle}>
                            📝 Buat Tagihan Baru
                        </h3>

                        <p className={styles.formSubtitle}>
                            Tambahkan tagihan untuk penyewa aktif
                        </p>
                    </div>

                    <div className={styles.formGrid}>

                        {/* DESKRIPSI */}
                        <div className={styles.formGroup}>
                            <label className={styles.label}>
                                Deskripsi Tagihan *
                            </label>

                            <select
                                className={styles.select}
                                value={formTagihan.deskripsiTagihan}
                                onChange={(e) =>
                                    setFormTagihan((prev) => ({
                                        ...prev,
                                        deskripsiTagihan: e.target.value,
                                    }))
                                }
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
                        </div>

                        {/* TANGGAL TAGIHAN */}
                        {/* <div className={styles.formGroup}>
                            <label className={styles.label}>
                                Tanggal Tagihan *
                            </label>

                            <input
                                type="date"
                                className={styles.input}
                                value={formTagihan.tanggalTagihan}
                                onChange={(e) =>
                                    setFormTagihan((prev) => ({
                                        ...prev,
                                        tanggalTagihan: e.target.value,
                                    }))
                                }
                            />
                        </div> */}

                        {/* JATUH TEMPO */}
                        {/* <div className={styles.formGroup}>
                            <label className={styles.label}>
                                Tanggal Jatuh Tempo *
                            </label>

                            <input
                                type="date"
                                className={styles.input}
                                value={formTagihan.tanggalJatuhTempo}
                                onChange={(e) =>
                                    setFormTagihan((prev) => ({
                                        ...prev,
                                        tanggalJatuhTempo: e.target.value,
                                    }))
                                }
                            />
                        </div> */}

                        {/* TOTAL */}
                        <div className={styles.formGroup}>
                            <label className={styles.label}>
                                Total *
                            </label>

                            <input
                                type="number"
                                className={styles.input}
                                min="1"
                                step="1000"
                                value={formTagihan.total ?? 0}
                                onChange={(e) =>
                                    setFormTagihan((prev) => ({
                                        ...prev,
                                        total:
                                            parseInt(
                                                e.target.value,
                                                10
                                            ) || 0,
                                    }))
                                }
                                placeholder="Masukkan total tagihan"
                            />
                        </div>
                    </div>

                    <div className={styles.formActions}>
                        <button
                            className={styles.btnSubmit}
                            onClick={onSaveTagihan}
                            disabled={savingTagihan}
                        >
                            {savingTagihan
                                ? "Menyimpan..."
                                : "💾 Buat Tagihan"}
                        </button>
                    </div>
                </div>
            )}

            {/* ========================= */}
            {/* SUMMARY */}
            {/* ========================= */}
            <div className={styles.summaryGrid}>
                <div className={styles.summaryCard}>
                    <div className={styles.summaryIcon}>
                        💰
                    </div>

                    <div className={styles.summaryContent}>
                        <span className={styles.summaryLabel}>
                            Total Tagihan
                        </span>

                        <span className={styles.summaryValue}>
                            Rp{" "}
                            {parseInt(totalTagihan)
                                .toLocaleString("id-ID")}
                        </span>
                    </div>
                </div>
            </div>

            {/* ========================= */}
            {/* LIST TAGIHAN */}
            {/* ========================= */}
            <div className={styles.tagihanListContainer}>

                <div className={styles.listHeader}>
                    <h3 className={styles.listTitle}>
                        📋 Daftar Tagihan
                    </h3>

                    <span className={styles.itemCount}>
                        {tagihanList.length} tagihan
                    </span>
                </div>

                <div className={styles.tagihanList}>

                    {tagihanList.map((tagihan, index) => (

                        <div
                            key={tagihan.id || index}
                            className={styles.tagihanItem}
                        >

                            <div className={styles.itemNumber}>
                                {index + 1}
                            </div>

                            <div className={styles.itemContent}>

                                <div className={styles.itemHeader}>

                                    <span className={styles.itemTitle}>
                                        {tagihan.idDeskripsiTagihan}
                                    </span>

                                    <div className={styles.statusAction}>

                                        <span className={styles.tagihanId}>
                                            {tagihan.id}
                                        </span>

                                        <span
                                            className={`${styles.statusBadge} ${
                                                tagihan.statusTagihan.nama === "Lunas"
                                                    ? styles.statusLunas
                                                    : styles.statusBelumLunas
                                            }`}
                                        >
                                            {tagihan.statusTagihan.nama}
                                        </span>

                                        {tagihan.statusTagihan.nama !== "Lunas" && (
                                            <button
                                                className={styles.iconBayar}
                                                onClick={() => handleBayar(tagihan)}
                                                title="Bayar tagihan"
                                            >
                                                <CreditCard
                                                    size={16}
                                                    strokeWidth={2.2}
                                                />
                                            </button>
                                        )}

                                        <button
                                            className={styles.iconDelete}
                                            onClick={() =>
                                                handleConfirmDelete(tagihan)
                                            }
                                            disabled={
                                                deletingTagihanId === tagihan.id
                                            }
                                            title="Hapus tagihan"
                                        >
                                            {deletingTagihanId === tagihan.id ? (
                                                <span
                                                    className={styles.spinnerSmall}
                                                ></span>
                                            ) : (
                                                <Trash2
                                                    size={16}
                                                    strokeWidth={2.2}
                                                />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div className={styles.itemDetails}>

                                    <div className={styles.detailItem}>
                                        <span className={styles.detailLabel}>
                                            Nominal
                                        </span>

                                        <span className={styles.detailValue}>
                                            Rp{" "}
                                            {parseInt(tagihan.total || 0)
                                                .toLocaleString("id-ID")}
                                        </span>
                                    </div>

                                    {tagihan.tanggalJatuhTempo && (
                                        <div className={styles.detailItem}>
                                            <span className={styles.detailLabel}>
                                                Jatuh Tempo
                                            </span>

                                            <span className={styles.detailValue}>
                                                {new Date(
                                                    tagihan.tanggalJatuhTempo
                                                ).toLocaleDateString(
                                                    "id-ID",
                                                    {
                                                        year: "numeric",
                                                        month: "long",
                                                        day: "numeric",
                                                    }
                                                )}
                                            </span>
                                        </div>
                                    )}

                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ========================= */}
            {/* MODAL BAYAR */}
            {/* ========================= */}
            <BayarModal
                show={showModal}
                onClose={() => setShowModal(false)}
                tagihan={selectedTagihan}
                formPembayaran={formPembayaran}
                setFormPembayaran={setFormPembayaran}
                onSave={handleSave}
            />

            {/* ========================= */}
            {/* CONFIRM DELETE */}
            {/* ========================= */}
            <ConfirmDialog
                show={showConfirmDelete}
                onClose={() => {
                    setShowConfirmDelete(false);
                    setSelectedTagihanDelete(null);
                }}
                title="Hapus Tagihan?"
                message={
                    selectedTagihanDelete
                        ? `Apakah Anda yakin ingin menghapus tagihan ${selectedTagihanDelete.idDeskripsiTagihan} sebesar Rp ${parseInt(
                            selectedTagihanDelete.total || 0
                        ).toLocaleString("id-ID")}?`
                        : ""
                }
                confirmText="Hapus"
                cancelText="Batal"
                onConfirm={handleDeleteConfirmed}
                isLoading={deletingTagihanId !== null}
                isDanger={true}
            />
        </div>
    );
};

export default TabTagihan;