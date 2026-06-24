import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "react-toastify";
import BayarModal from "../../../components/BayarModal/BayarModal";
import ConfirmDialog from "../../../components/ConfirmDialog/ConfirmDialog";
import CreateInvoiceForm from "./CreateInvoiceForm";
import { getDeskripsiTagihan } from "../../../services/deskripsiTagihan";
import { fetchPrivateFileBlob } from "../../../services/penyewaService";
import styles from "./TabTagihan.module.css";
import { CreditCard, Trash2, FileText, X, History, Plus, Calendar, LogIn, LogOut } from "lucide-react";

function inferMimeFromPath(path, blobType) {
    if (blobType && blobType !== "application/octet-stream") return blobType;
    const lower = (path || "").toLowerCase();
    if (lower.endsWith(".pdf")) return "application/pdf";
    if (lower.endsWith(".png")) return "image/png";
    if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
    if (lower.endsWith(".webp")) return "image/webp";
    if (lower.endsWith(".gif")) return "image/gif";
    return blobType || "application/octet-stream";
}

const formatTanggal = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return new Intl.DateTimeFormat("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
    }).format(date);
};

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
    const [activeTab, setActiveTab] = useState("riwayat"); // "riwayat" | "baru"
    const [showModal, setShowModal] = useState(false);
    const [selectedTagihan, setSelectedTagihan] = useState(null);

    const [showConfirmDelete, setShowConfirmDelete] = useState(false);
    const [selectedTagihanDelete, setSelectedTagihanDelete] = useState(null);

    const [deskripsiOptions, setDeskripsiOptions] = useState([]);

    const [showProofModal, setShowProofModal] = useState(false);
    const [proofLoading, setProofLoading] = useState(false);
    const [proofObjectUrl, setProofObjectUrl] = useState(null);
    const [proofMime, setProofMime] = useState("");
    const proofUrlRef = useRef(null);

    const revokeProofUrl = useCallback(() => {
        if (proofUrlRef.current) {
            URL.revokeObjectURL(proofUrlRef.current);
            proofUrlRef.current = null;
        }
        setProofObjectUrl(null);
        setProofMime("");
    }, []);

    useEffect(() => () => revokeProofUrl(), [revokeProofUrl]);

    const handleCloseProofModal = () => {
        setShowProofModal(false);
        revokeProofUrl();
    };

    const handleViewProof = async (buktiBayar) => {
        if (!buktiBayar) return;

        setShowProofModal(true);
        setProofLoading(true);
        revokeProofUrl();

        try {
            const blob = await fetchPrivateFileBlob(buktiBayar);
            if (!blob) {
                throw new Error("File tidak ditemukan");
            }

            const mime = inferMimeFromPath(buktiBayar, blob.type);
            const url = URL.createObjectURL(blob);
            proofUrlRef.current = url;
            setProofObjectUrl(url);
            setProofMime(mime);
        } catch (err) {
            const message =
                err?.message ||
                err?.response?.data?.message ||
                "Gagal memuat bukti pembayaran";
            toast.error(message, { position: "top-right" });
            setShowProofModal(false);
            revokeProofUrl();
        } finally {
            setProofLoading(false);
        }
    };

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

    const isNotRentable = sewaData?.kamar?.bisa_disewakan === false;
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
            {/* TAB MENU */}
            {/* ========================= */}
            {sewaData?.id && (
                <div className={styles.tabContainer}>
                    <div className={styles.tabMenu}>
                        <button
                            className={`${styles.tabButton} ${
                                activeTab === "riwayat" ? styles.tabActive : ""
                            }`}
                            onClick={() => setActiveTab("riwayat")}
                        >
                            <History size={18} />
                            <span>Riwayat Tagihan</span>
                        </button>

                        <button
                            className={`${styles.tabButton} ${
                                activeTab === "baru" ? styles.tabActive : ""
                            }`}
                            onClick={() => setActiveTab("baru")}
                        >
                            <Plus size={18} />
                            <span>Tagihan Baru</span>
                        </button>
                    </div>
                </div>
            )}

            {/* ========================= */}
            {/* TAB CONTENT: TAGIHAN BARU */}
            {/* ========================= */}
            {sewaData?.id && activeTab === "baru" && (
                <CreateInvoiceForm
                    deskripsiOptions={deskripsiOptions}
                    formTagihan={formTagihan}
                    setFormTagihan={setFormTagihan}
                    onSaveTagihan={onSaveTagihan}
                    savingTagihan={savingTagihan}
                />
            )}

            {/* ========================= */}
            {/* TAB CONTENT: RIWAYAT TAGIHAN */}
            {/* ========================= */}
            {activeTab === "riwayat" && !isNotRentable && (
                <>
                    {/* ========================= */}
                    {/* SUMMARY */}
                    {/* ========================= */}
                    {tagihanArray.length > 0 && (
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
                    )}

                    {/* ========================= */}
                    {/* LIST TAGIHAN */}
                    {/* ========================= */}
                    {tagihanArray.length > 0 ? (
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
                                            className={`${styles.statusBadge} ${tagihan.statusTagihan.nama === "Lunas"
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

                                    {/* Tanggal Masuk & Keluar */}
                                    {(tagihan.tanggalMasukTagihan || tagihan.tanggalKeluarTagihan) && (
                                        <div className={styles.detailItemDate}>
                                            <div className={styles.dateSection}>
                                                {tagihan.tanggalMasukTagihan && (
                                                    <div className={styles.dateItem}>
                                                        <div className={styles.dateIcon}>
                                                            <LogIn size={14} />
                                                        </div>
                                                        <div className={styles.dateContent}>
                                                            <span className={styles.dateLabel}>
                                                                Masuk
                                                            </span>
                                                            <span className={styles.dateValue}>
                                                                {formatTanggal(tagihan.tanggalMasukTagihan)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}

                                                {tagihan.tanggalKeluarTagihan && (
                                                    <div className={styles.dateItem}>
                                                        <div className={styles.dateIcon}>
                                                            <LogOut size={14} />
                                                        </div>
                                                        <div className={styles.dateContent}>
                                                            <span className={styles.dateLabel}>
                                                                Keluar
                                                            </span>
                                                            <span className={styles.dateValue}>
                                                                {formatTanggal(tagihan.tanggalKeluarTagihan)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div className={styles.detailItem}>
                                        <span className={styles.detailLabel}>
                                            Tanggal Bayar
                                        </span>

                                        <span className={styles.detailValue}>
                                            {tagihan.pembayaran?.tanggalBayar
                                                ? formatTanggal(tagihan.pembayaran.tanggalBayar)
                                                : '-'}
                                        </span>
                                    </div>

                                    <div className={styles.detailItem}>
                                        <span className={styles.detailLabel}>
                                            Metode Bayar
                                        </span>

                                        <div className={styles.paymentMethodContainer}>
                                            <span className={styles.detailValue}>
                                                {tagihan.pembayaran?.idMetodeBayar || ''}
                                            </span>

                                            {tagihan.pembayaran?.buktiBayar && (
                                                <button
                                                    className={styles.proofButton}
                                                    onClick={() => handleViewProof(tagihan.pembayaran.buktiBayar)}
                                                    title="Lihat bukti pembayaran"
                                                >
                                                    <FileText size={16} strokeWidth={2} />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    ))}
                            </div>
                        </div>
                    ) : (
                        <div className={styles.emptyStateTab}>
                            <div className={styles.emptyIcon}>📋</div>
                            <h3 className={styles.emptyTitle}>
                                Belum Ada Tagihan
                            </h3>
                            <p className={styles.emptySubtitle}>
                                Tidak ada tagihan untuk sewa ini.
                                Buat tagihan baru di tab "Tagihan Baru"
                            </p>
                        </div>
                    )}
                </>
            )}

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

            {showProofModal ? (
                <div className={styles.proofOverlay} onClick={handleCloseProofModal}>
                    <div
                        className={styles.proofModal}
                        onClick={(e) => e.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Bukti pembayaran"
                    >
                        <div className={styles.proofModalHeader}>
                            <h4>Bukti Pembayaran</h4>
                            <button
                                type="button"
                                className={styles.proofCloseButton}
                                onClick={handleCloseProofModal}
                                aria-label="Tutup"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className={styles.proofModalBody}>
                            {proofLoading && (
                                <div className={styles.proofPlaceholder}>
                                    <div className={styles.spinnerSmall} />
                                    <span>Memuat bukti pembayaran…</span>
                                </div>
                            )}

                            {!proofLoading && proofObjectUrl && proofMime.startsWith("image/") && (
                                <img
                                    src={proofObjectUrl}
                                    alt="Bukti pembayaran"
                                    className={styles.proofImage}
                                />
                            )}

                            {!proofLoading && proofObjectUrl && proofMime === "application/pdf" && (
                                <iframe
                                    title="Bukti pembayaran PDF"
                                    src={proofObjectUrl}
                                    className={styles.proofIframe}
                                />
                            )}

                            {!proofLoading && !proofObjectUrl && (
                                <div className={styles.proofPlaceholder}>
                                    <span>Bukti pembayaran tidak dapat ditampilkan.</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
};

export default TabTagihan;