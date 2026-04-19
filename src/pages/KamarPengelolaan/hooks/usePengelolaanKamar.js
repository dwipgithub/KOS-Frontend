import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { showKamar, updateKamar } from "../../../services/kamarService";
import { getPenyewa, showPenyewa } from "../../../services/penyewaService";
import { showSewa, createSewa } from "../../../services/sewaService";
import { getTagihan } from "../../../services/tagihanService";
import { createPembayaran } from "../../../services/pembayaranService";
import { createKeluar } from "../../../services/keluarService";
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
function computeTanggalKeluarSewa(tanggalMasuk, durasiSewa, jumlahDurasi) {
    if (!tanggalMasuk || !durasiSewa) return "";
    const n = Math.max(1, parseInt(String(jumlahDurasi), 10) || 1);
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

    // State untuk loading
    const [loadingKamar, setLoadingKamar] = useState(true);
    const [loadingSewa, setLoadingSewa] = useState(false);
    const [loadingTagihan, setLoadingTagihan] = useState(false);
    const [loadingPenyewa, setLoadingPenyewa] = useState(false);

    // State untuk form profil kamar
    const [formProfil, setFormProfil] = useState({
        nama: "",
        hargaPerHari: 0,
        hargaPerMinggu: 0,
        hargaPerBulan: "",
        hargaPerTahun: "",
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
        jumlahDurasi: 1,
        hargaPerDurasi: 0,
        hargaTotal: 0,
        uangMuka: 0,
        catatan: "",
    });

    // State untuk form pembayaran tagihan
    const [formPembayaran, setFormPembayaran] = useState({
        idTagihan: "",
        tanggalBayar: "",
        idMetodeBayar: "",
        totalBayar: 0,
        buktiFile: null
    });

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
            console.log("✅ Data penyewa berhasil dimuat:", response.data);
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

    // Fetch daftar tagihan berdasarkan idSewa
    const fetchTagihanList = useCallback(async (idSewa) => {
        try {
            setLoadingTagihan(true);
            const response = await getTagihan({ idSewa });
            const data = response.data;
            setTagihanList(Array.isArray(data) ? data : []);
            console.log("✅ Daftar tagihan berhasil dimuat:", data);
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
                hargaPerBulan: kamar.hargaPerBulan || "",
                hargaPerTahun: kamar.hargaPerTahun || "",
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
    }, [
        fetchKamarData,
        fetchPenyewaList
    ]);

    useEffect(() => {
        setFormSewa((prev) => {
            const keluar = computeTanggalKeluarSewa(
                prev.tanggalMasuk,
                prev.durasiSewa,
                prev.jumlahDurasi
            );
            if (keluar === prev.tanggalKeluar) return prev;
            return { ...prev, tanggalKeluar: keluar };
        });
    }, [formSewa.tanggalMasuk, formSewa.durasiSewa, formSewa.jumlahDurasi]);

    // Reset form keluar saat data sewa berubah (default tanggal = hari ini)
    useEffect(() => {
        if (!sewaData?.id) return;
        setFormKeluar({
            tanggalKeluar: todayDateString(),
            catatan: "",
        });
    }, [sewaData?.id]);

    // Fetch sewa when active tab is sewa dan ada idSewa
    // useEffect(() => {
    //     if (activeTab === "sewa" && kamarData?.idSewa) {
    //         console.log("🔄 Fetching sewa data for tab sewa - idSewa:", kamarData.idSewa);
    //         fetchSewaData(kamarData.idSewa);
    //     }
    // }, [activeTab, kamarData?.idSewa, fetchSewaData]);

    // Fetch tagihan when active tab is tagihan dan ada idSewa
    // useEffect(() => {
    //     if (activeTab === "tagihan" && sewaData?.id) {
    //         fetchTagihanList(sewaData.id);
    //     }
    // }, [activeTab, sewaData?.id, fetchTagihanList]);

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
            const qty = Math.max(1, prev.jumlahDurasi || 1);
            const hargaTotal = harga * qty;

            return {
                ...prev,
                durasiSewa: durasi,
                idDurasi: idDurasi,
                hargaPerDurasi: harga,
                hargaTotal,
            };
        });
    };

    // Handle jumlah durasi perubahan
    const handleJumlahDurasiChange = (jumlah) => {
        const qty = Math.max(1, jumlah);
        setFormSewa((prev) => {
            const hargaTotal = prev.hargaPerDurasi * qty;
            return {
                ...prev,
                jumlahDurasi: qty,
                hargaTotal,
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

    // Handle save sewa
    const handleSaveSewa = async () => {
        try {
            if (!formSewa.idPenyewa) {
                toast.error("Pilih penyewa terlebih dahulu");
                return;
            }
            if (!formSewa.tanggalMasuk) {
                toast.error("Tanggal masuk wajib diisi");
                return;
            }
            if (!formSewa.tanggalKeluar) {
                toast.error("Tanggal keluar belum terhitung — periksa durasi dan jumlah");
                return;
            }

            const dataToSend = {
                idKamar,
                idPenyewa: formSewa.idPenyewa,
                tanggalMasuk: formSewa.tanggalMasuk,
                tanggalKeluar: formSewa.tanggalKeluar,
                idDurasi: formSewa.idDurasi,
                hargaPerDurasi: formSewa.hargaPerDurasi,
                jumlahDurasi: formSewa.jumlahDurasi,
                uangMuka: formSewa.uangMuka != null ? Number(formSewa.uangMuka) : 0,
                catatan: formSewa.catatan || "",
            };

            const response = await createSewa(dataToSend);
            toast.success("Data sewa berhasil disimpan");
            
            // Fetch ulang data kamar dan sewa
            await fetchKamarData();
            if (response.data?.id) {
                await fetchSewaData(response.data.id);
            }

            // Reset form
            const hHarian = Number(kamarData?.hargaPerHari) || 0;
            setFormSewa({
                idKamar: "",
                idPenyewa: "",
                idDurasi: "DAY",
                durasiSewa: "Harian",
                tanggalMasuk: "",
                tanggalKeluar: "",
                jumlahDurasi: 1,
                hargaPerDurasi: hHarian,
                hargaTotal: hHarian,
                uangMuka: 0,
                catatan: "",
            });
        } catch (err) {
            toast.error(err.message || "Gagal menyimpan data sewa");
        }
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

    return {
        // Data
        kamarData,
        sewaData,
        penyewaData,
        tagihanList,
        penyewaList,

        // Loading states
        loadingKamar,
        loadingSewa,
        loadingTagihan,
        loadingPenyewa,

        // Forms
        formProfil,
        setFormProfil,
        formSewa,
        setFormSewa,
        formPembayaran,
        setFormPembayaran,
        formKeluar,
        setFormKeluar,

        // Tab
        activeTab,
        setActiveTab,

        // Handlers
        handleDurasiSewaChange,
        handleJumlahDurasiChange,
        handleSaveProfil,
        handleSaveSewa,
        handleSavePembayaran,
        handleKeluar,
        savingKeluar,

        // Refetch
        fetchKamarData,
        fetchTagihanList,
    };
};
