import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { showKamar, updateKamar } from "../../../services/kamarService";
import { getPenyewa, showPenyewa, createPenyewa } from "../../../services/penyewaService";
import { showSewa, createSewa } from "../../../services/sewaService";
import { getTagihan, createTagihan, deleteTagihan } from "../../../services/tagihanService";
import { createPembayaran } from "../../../services/pembayaranService";
import { createKeluar } from "../../../services/keluarService";
import { getJenisKelamin } from "../../../services/jenisKelaminService";
import { getStatusPernikahan } from "../../../services/statusPernikahanService";
import { getPengenal } from "../../../services/pengenalService";
import { getProfesi } from "../../../services/profesiService";
import { toast } from "react-toastify";

function todayDateString() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
        d.getDate()
    ).padStart(2, "0")}`;
}

/**
 * Tanggal keluar = tanggal masuk + (jumlah × satuan durasi).
 * Harian: +N hari kalender; Mingguan: +N×7 hari; Bulanan: +N bulan; Tahunan: +N tahun.
 */
function computeTanggalKeluarSewa(tanggalMasuk, durasiSewa, jumlah) {
    if (!tanggalMasuk || !durasiSewa) return "";
    const n = Math.max(1, parseInt(String(jumlah), 10) || 1);
    const start = new Date(`${tanggalMasuk}T12:00:00`);
    if (Number.isNaN(start.getTime())) return "";
    const out = new Date(start);
    switch (durasiSewa) {
        case "Harian":
            out.setDate(out.getDate() + n);
            break;
        case "Mingguan":
            out.setDate(out.getDate() + n * 7);
            break;
        case "Bulanan":
            out.setMonth(out.getMonth() + n);
            break;
        case "Tahunan":
            out.setFullYear(out.getFullYear() + n);
            break;
        default:
            return "";
    }
    const y = out.getFullYear();
    const m = String(out.getMonth() + 1).padStart(2, "0");
    const d = String(out.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

export const usePengelolaanKamar = (idKamar) => {
    const navigate = useNavigate();

    // State untuk data kamar
    const [kamarData, setKamarData] = useState(null);
    const [sewaData, setSewaData] = useState(null);
    const [penyewaData, setPenyewaData] = useState(null);
    const [tagihanList, setTagihanList] = useState([]);
    const [penyewaList, setPenyewaList] = useState([]);
    const [jenisKelaminList, setJenisKelaminList] = useState([]);
    const [statusPernikahanList, setStatusPernikahanList] = useState([]);
    const [pengenalList, setPengenalList] = useState([]);
    const [profesiList, setProfesiList] = useState([]);

    // State untuk loading
    const [loadingKamar, setLoadingKamar] = useState(true);
    const [loadingSewa, setLoadingSewa] = useState(false);
    const [loadingTagihan, setLoadingTagihan] = useState(false);
    const [loadingPenyewa, setLoadingPenyewa] = useState(false);
    const [loadingMasterPenyewa, setLoadingMasterPenyewa] = useState(false);
    const [savingTransaksiSewa, setSavingTransaksiSewa] = useState(false);

    // State untuk form profil kamar
    const [formProfil, setFormProfil] = useState({
        nama: "",
        hargaPerHari: 0,
        hargaPerMinggu: 0,
        hargaPerBulan: 0,
        hargaPerTahun: 0,
        catatan: "",
    });

    // State untuk form sewa
    const [formSewa, setFormSewa] = useState({
        idKamar: "",
        idPenyewa: "",
        idDurasi: "DAY",
        durasiSewa: "Harian",
        tanggalMasuk: "",
        tanggalKeluar: "",
        jumlah: 1,
        diskonPersen: 0,
        diskonNominal:0,
        hargaSatuan: 0,
        total: 0,
        uangMuka: 0,
        uangJaminan: 0,
        catatan: "",
    });

    const [formPenyewaBaru, setFormPenyewaBaru] = useState({
        nama: "",
        idPengenal: "",
        noPengenal: "",
        idJenisKelamin: "",
        profesi: "",
        noTelp: "",
        namaOrangTua: "",
        noTelpOrangTua: "",
        alamat: "",
        namaInstitusi: "",
        alamatInstitusi: "",
        dokumenFile: null,
    });

    // State untuk form pembayaran tagihan
    const [formPembayaran, setFormPembayaran] = useState({
        idTagihan: "",
        tanggalBayar: "",
        idMetodeBayar: "",
        totalBayar: 0,
        buktiFile: null
    });

    // State untuk form membuat tagihan
    const [formTagihan, setFormTagihan] = useState({
        deskripsiTagihan: "",
        tanggalTagihan: "",
        tanggalJatuhTempo: "",
        total: 0,
    });
    const [savingTagihan, setSavingTagihan] = useState(false);
    const [deletingTagihanId, setDeletingTagihanId] = useState(null);

    // Form check-out / keluar
    const [formKeluar, setFormKeluar] = useState({
        tanggalKeluar: "",
        catatan: "",
    });
    const [savingKeluar, setSavingKeluar] = useState(false);

    // Active tab
    const [activeTab, setActiveTab] = useState("profil");

    // Fetch data sewa berdasarkan idSewa
    const fetchSewaData = useCallback(async (idSewa) => {
        try {
            setLoadingSewa(true);
            const response = await showSewa(idSewa);
            setSewaData(response.data);
        } catch (err) {
            console.error("Gagal memuat data sewa:", err);
        } finally {
            setLoadingSewa(false);
        }
    }, []);

    // Fetch data penyewa berdasarkan idPenyewa
    const showPenyewaData = useCallback(async (idPenyewa) => {
        try {
            const response = await showPenyewa(idPenyewa);
            setPenyewaData(response.data);
        } catch (err) {
            console.error("Gagal memuat data penyewa:", err);
            return null;
        }
    }, []);

    // Fetch daftar penyewa
    const fetchPenyewaList = useCallback(async () => {
        try {
            setLoadingPenyewa(true);
            const response = await getPenyewa();
            setPenyewaList(response.data || []);
        } catch (err) {
            console.error("Gagal memuat daftar penyewa:", err);
        } finally {
            setLoadingPenyewa(false);
        }
    }, []);

    const fetchMasterPenyewa = useCallback(async () => {
        try {
            setLoadingMasterPenyewa(true);
            const [jkRes, spRes, pgRes, prRes] = await Promise.all([
                getJenisKelamin(),
                getStatusPernikahan(),
                getPengenal(),
                getProfesi(),
            ]);
            setJenisKelaminList(jkRes.data || []);
            setStatusPernikahanList(spRes.data || []);
            setPengenalList(pgRes.data || []);
            setProfesiList(prRes.data || []);
        } catch (err) {
            console.error("Gagal memuat data referensi penyewa:", err);
        } finally {
            setLoadingMasterPenyewa(false);
        }
    }, []);

    // Fetch daftar tagihan berdasarkan idSewa
    const fetchTagihanList = useCallback(async (idSewa) => {
        try {
            setLoadingTagihan(true);
            const response = await getTagihan({ idSewa });
            const data = response.data;
            setTagihanList(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Gagal memuat daftar tagihan:", err);
            setTagihanList([]);
        } finally {
            setLoadingTagihan(false);
        }
    }, []);

    // Fetch data kamar
    const fetchKamarData = useCallback(async () => {
        try {
            setLoadingKamar(true);
            const response = await showKamar(idKamar);
            const kamar = response.data;
            setKamarData(kamar);

            setFormProfil({
                nama: kamar.nama || "",
                hargaPerHari: kamar.hargaPerHari || 0,
                hargaPerMinggu: kamar.hargaPerMinggu || 0,
                hargaPerBulan: kamar.hargaPerBulan || 0,
                hargaPerTahun: kamar.hargaPerTahun || 0,
                catatan: kamar.catatan || "",
            });

            // Check if kamar has sewa
            if (kamar.sewa !== null) {
                await fetchSewaData(kamar.sewa.id);
                await showPenyewaData(kamar.routeIdPenyewa);
                await fetchPenyewaList();
                await fetchTagihanList(kamar.sewa.id);
            } else {
                setSewaData(null);
                setTagihanList([]);
            }
        } catch (err) {
            toast.error(err.message || "Gagal memuat data kamar");
        } finally {
            setLoadingKamar(false);
        }
    }, [
        idKamar, 
        fetchSewaData,
        showPenyewaData,
        fetchPenyewaList,
        fetchTagihanList
    ]);

    // Initial fetch
    // useEffect(() => {
    //     fetchKamarData();
    //     fetchPenyewaList();
    // }, [fetchKamarData, fetchPenyewaList]);

    useEffect(() => {
        fetchKamarData();
        fetchPenyewaList();
        fetchMasterPenyewa();
    }, [
        fetchKamarData,
        fetchPenyewaList,
        fetchMasterPenyewa,
    ]);

    useEffect(() => {
        setFormSewa((prev) => {
            const keluar = computeTanggalKeluarSewa(
                prev.tanggalMasuk,
                prev.durasiSewa,
                prev.jumlah
            );
            if (keluar === prev.tanggalKeluar) return prev;
            return { ...prev, tanggalKeluar: keluar };
        });
    }, [formSewa.tanggalMasuk, formSewa.durasiSewa, formSewa.jumlah]);

    // Reset form keluar saat data sewa berubah (default tanggal = hari ini)
    useEffect(() => {
        if (!sewaData?.id) return;
        setFormKeluar({
            tanggalKeluar: todayDateString(),
            catatan: "",
        });
    }, [sewaData?.id]);

    // Handle harga perubahan ketika durasi sewa berubah
    const handleDurasiSewaChange = (durasi) => {
        setFormSewa((prev) => {
            const durasiConfig = {
                Harian: {
                    id: "DAY",
                    harga: kamarData?.hargaPerHari || 0,
                },
                Mingguan: {
                    id: "WEEK",
                    harga: kamarData?.hargaPerMinggu || 0,
                },
                Bulanan: {
                    id: "MONTH",
                    harga: kamarData?.hargaPerBulan || 0,
                },
                Tahunan: {
                    id: "YEAR",
                    harga: kamarData?.hargaPerTahun || 0,
                },
            };

            const config = durasiConfig[durasi] || {};
            const harga = config.harga || 0;
            const idDurasi = config.id || "";
            const qty = Math.max(1, prev.jumlah || 1);
            const hargaTotal = harga * qty;

            return {
                ...prev,
                durasiSewa: durasi,
                idDurasi: idDurasi,
                hargaSatuan: harga,
                total: hargaTotal,
            };
        });
    };

    // Handle jumlah perubahan
    const handleJumlahChange = (jumlah) => {
        const qty = Math.max(1, jumlah);
        setFormSewa((prev) => {
            const hargaTotal = prev.hargaSatuan * qty;
            return {
                ...prev,
                jumlah: qty,
                total: hargaTotal,
            };
        });
    };

    // Handle save profil kamar
    const handleSaveProfil = async () => {
        try {
            await updateKamar(idKamar, formProfil);
            toast.success("Data profil kamar berhasil disimpan");
            fetchKamarData();
        } catch (err) {
            toast.error(err.message || "Gagal menyimpan data profil kamar");
        }
    };

    /**
     * Simpan transaksi sewa: penyewa baru (multipart) bila perlu, lalu sewa.
     * Validasi UI dilakukan di TabSewa sebelum memanggil fungsi ini.
     * @param {{ isExistingPenyewa: boolean }} opts
     */
    const handleSimpanTransaksiSewa = async ({ isExistingPenyewa }) => {
        try {
            setSavingTransaksiSewa(true);
            let idPenyewa = formSewa.idPenyewa;

            if (!isExistingPenyewa) {
                const response = await createPenyewa(buildPenyewaFormData(formPenyewaBaru));
                idPenyewa = response?.data?.id ?? response?.id;
                if (!idPenyewa) {
                    toast.error("Gagal mendapatkan ID penyewa baru");
                    return;
                }
            } else if (!idPenyewa) {
                toast.error("Pilih penyewa dari pencarian terlebih dahulu");
                return;
            }

            if (!formSewa.tanggalMasuk) {
                toast.error("Tanggal mulai wajib diisi");
                return;
            }
            if (!formSewa.tanggalKeluar) {
                toast.error("Tanggal selesai belum terhitung — periksa durasi dan jumlah");
                return;
            }

            const dataToSend = {
                idKamar,
                idPenyewa,
                tanggalMasuk: formSewa.tanggalMasuk,
                tanggalKeluar: formSewa.tanggalKeluar,
                idDurasi: formSewa.idDurasi,
                hargaSatuan: formSewa.hargaSatuan,
                jumlah: formSewa.jumlah,
                diskonPersen: formSewa.diskonPersen || 0,
                diskonNominal: formSewa.diskonNominal || 0,
                uangMuka: formSewa.uangMuka != null ? Number(formSewa.uangMuka) : 0,
                uangJaminan: formSewa.uangJaminan != null ? Number(formSewa.uangJaminan) : 0,
                catatan: formSewa.catatan || "",
            };

            const response = await createSewa(dataToSend);
            toast.success("Transaksi sewa berhasil disimpan");

            await fetchKamarData();
            if (response.data?.id) {
                await fetchSewaData(response.data.id);
            }

            const hHarian = Number(kamarData?.hargaPerHari) || 0;
            setFormSewa({
                idKamar: "",
                idPenyewa: "",
                idDurasi: "DAY",
                durasiSewa: "Harian",
                tanggalMasuk: "",
                tanggalKeluar: "",
                jumlah: 1,
                diskonPersen: 0,
                diskonNominal: 0,
                hargaSatuan: hHarian,
                hargaTotal: hHarian,
                uangMuka: 0,
                uangJaminan: 0,
                catatan: "",
            });
            setFormPenyewaBaru({
                nama: "",
                idPengenal: "",
                noPengenal: "",
                idJenisKelamin: "",
                profesi: "",
                noTelp: "",
                namaOrangTua: "",
                noTelpOrangTua: "",
                alamat: "",
                namaInstitusi: "",
                alamatInstitusi: "",
                dokumenFile: null,
            });
        } catch (err) {
            toast.error(err.message || "Gagal menyimpan transaksi sewa");
        } finally {
            setSavingTransaksiSewa(false);
        }
    };

    const buildPenyewaFormData = (f) => {
        const fd = new FormData();
        fd.append("nama", f.nama ?? "");
        fd.append("alamat", f.alamat ?? "");
        fd.append("noTelp", f.noTelp ?? "");
        fd.append("namaOrangTua", f.namaOrangTua ?? "");
        fd.append("noTelpOrangTua", f.noTelpOrangTua ?? "");
        // fd.append("email", f.email ?? "");
        fd.append("idPengenal", f.idPengenal ?? "");
        fd.append("noPengenal", f.noPengenal ?? "");
        fd.append("idJenisKelamin", f.idJenisKelamin ?? "");
        // fd.append("idStatusPernikahan", f.idStatusPernikahan ?? "");
        fd.append("profesi", f.profesi ?? "");
        fd.append("namaInstitusi", f.namaInstitusi ?? "");
        fd.append("alamatInstitusi", f.alamatInstitusi ?? "");
        // fd.append("noTelpInstitusi", f.noTelpInstitusi ?? "");
        fd.append("dokumen_pengenal", f.dokumenFile);
        return fd;
    };

    const handleKeluar = async () => {
        try {
            if (!sewaData?.id) {
                toast.error("Data sewa tidak tersedia");
                return;
            }
            if (!formKeluar.tanggalKeluar) {
                toast.error("Tanggal keluar wajib diisi");
                return;
            }
            setSavingKeluar(true);
            await createKeluar({
                idSewa: sewaData.id,
                tanggalKeluar: formKeluar.tanggalKeluar,
                catatan: (formKeluar.catatan || "").trim(),
            });
            toast.success("Check-out berhasil disimpan");
            navigate("/kamar");
        } catch (err) {
            toast.error(err?.message || "Gagal menyimpan check-out");
        } finally {
            setSavingKeluar(false);
        }
    };

    const handleSavePembayaran = async (payload) => {
        const data = payload || formPembayaran;
        try {
            if (!data.buktiFile) {
                toast.error("Bukti bayar wajib diunggah", { position: "top-right" });
                return false;
            }
            const { buktiFile, ...fields } = data;
            const fd = new FormData();
            fd.append("idTagihan", fields.idTagihan ?? "");
            fd.append("tanggalBayar", fields.tanggalBayar ?? "");
            fd.append("idMetodeBayar", fields.idMetodeBayar ?? "");
            fd.append("totalBayar", String(fields.totalBayar ?? ""));
            fd.append("buktiBayar", buktiFile);

            await createPembayaran(fd);
            toast.success("Pembayaran berhasil disimpan");

            await fetchKamarData();

            setFormPembayaran({
                idTagihan: "",
                tanggalBayar: "",
                idMetodeBayar: "",
                totalBayar: 0,
                buktiFile: null
            });

            return true;
        } catch (err) {
            toast.error(err.message || "Gagal menyimpan tagihan");
            return false;
        }
    };

    const handleSaveTagihan = async (calculatedTotal) => {
        try {
            if (!sewaData?.id) {
                toast.error("Data sewa tidak tersedia");
                return;
            }
            if (!formTagihan.deskripsiTagihan) {
                toast.error("Deskripsi tagihan wajib dipilih");
                return;
            }
            // Use calculated total passed from form component
            const totalToUse = calculatedTotal || formTagihan.total;
            if (!totalToUse || totalToUse <= 0) {
                toast.error("Total tagihan harus lebih besar dari 0");
                return;
            }

            setSavingTagihan(true);
            const dataToSend = {
                idSewa: sewaData.id,
                idDeskripsiTagihan: formTagihan.deskripsiTagihan,
                tanggalTagihan: new Date(),
                tanggalJatuhTempo: new Date(),
                hargaSatuan: totalToUse,
                total: totalToUse,
                // Include conditional fields for Biaya Kamar
                ...(formTagihan.durasi && { idDurasi: formTagihan.durasi }),
                ...(formTagihan.tanggalMasuk && { tanggalMasuk: formTagihan.tanggalMasuk }),
                ...(formTagihan.tanggalKeluar && { tanggalKeluar: formTagihan.tanggalKeluar }),
                // Include discount fields
                ...(formTagihan.diskonPersen && { diskonPersen: formTagihan.diskonPersen }),
                ...(formTagihan.diskonRupiah && { diskonRupiah: formTagihan.diskonRupiah }),
                // Include jumlah (qty)
                ...(formTagihan.jumlah && { jumlah: formTagihan.jumlah }),
                ...(formTagihan.hargaSatuan && { hargaSatuan: formTagihan.hargaSatuan }),
            };

            await createTagihan(dataToSend);
            toast.success("Tagihan berhasil dibuat");

            // Reset form
            setFormTagihan({
                deskripsiTagihan: "",
                tanggalTagihan: "",
                tanggalJatuhTempo: "",
                total: 0,
                // Reset calculation fields
                jumlah: "",
                hargaSatuan: "",
                diskonPersen: 0,
                diskonRupiah: 0,
                // Reset conditional fields
                durasi: "",
                tanggalMasuk: "",
                tanggalKeluar: "",
            });

            // Refresh data
            await fetchTagihanList(sewaData.id);
        } catch (err) {
            toast.error(err.message || "Gagal membuat tagihan");
        } finally {
            setSavingTagihan(false);
        }
    };

    const handleDeleteTagihan = async (idTagihan) => {
        try {
            if (!sewaData?.id) {
                toast.error("Data sewa tidak tersedia");
                return;
            }

            setDeletingTagihanId(idTagihan);
            await deleteTagihan(idTagihan);
            toast.success("Tagihan berhasil dihapus");

            // Refresh data
            await fetchTagihanList(sewaData.id);
        } catch (err) {
            toast.error(err.message || "Gagal menghapus tagihan");
        } finally {
            setDeletingTagihanId(null);
        }
    };

    return {
        // Data
        kamarData,
        sewaData,
        penyewaData,
        tagihanList,
        penyewaList,
        jenisKelaminList,
        statusPernikahanList,
        pengenalList,
        profesiList,

        // Loading states
        loadingKamar,
        loadingSewa,
        loadingTagihan,
        loadingPenyewa,
        loadingMasterPenyewa,
        savingTransaksiSewa,
        savingTagihan,
        deletingTagihanId,

        // Forms
        formProfil,
        setFormProfil,
        formSewa,
        setFormSewa,
        formPenyewaBaru,
        setFormPenyewaBaru,
        formPembayaran,
        setFormPembayaran,
        formTagihan,
        setFormTagihan,
        formKeluar,
        setFormKeluar,

        // Tab
        activeTab,
        setActiveTab,

        // Handlers
        handleDurasiSewaChange,
        handleJumlahChange,
        handleSaveProfil,
        handleSimpanTransaksiSewa,
        handleSavePembayaran,
        handleSaveTagihan,
        handleDeleteTagihan,
        handleKeluar,
        savingKeluar,

        // Refetch
        fetchKamarData,
        fetchTagihanList,
    };
};
