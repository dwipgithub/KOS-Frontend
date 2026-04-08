import { useState, useEffect, useCallback } from "react";
import { showKamar, updateKamar } from "../../../api/kamar";
import { getPenyewa, showPenyewa } from "../../../api/penyewa";
import { showSewa, createSewa } from "../../../api/sewa";
import { getTagihan } from "../../../api/tagihan";
import { createPembayaran } from "../../../api/pembayaran";
import { toast } from "react-toastify";

export const usePengelolaanKamar = (idKamar) => {
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
        hargaPerHari: "",
        hargaPerMinggu: "",
        hargaPerBulan: "",
        hargaPerTahun: "",
        catatan: "",
    });

    // State untuk form sewa
    const [formSewa, setFormSewa] = useState({
        idKamar: "",
        idPenyewa: "",
        idDurasi: "",
        tanggalMasuk: "",
        tanggalKeluar: "",
        jumlahDurasi: 1,
        hargaPerDurasi: 0,
    });

    // State untuk form pembayaran tagihan
    const [formPembayaran, setFormPembayaran] = useState({
        idTagihan: "",
        tanggalBayar: "",
        idMetodeBayar: "",
        totalBayar: 0
    });

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
                hargaPerHari: kamar.hargaPerHari || "",
                hargaPerMinggu: kamar.hargaPerMinggu || "",
                hargaPerBulan: kamar.hargaPerBulan || "",
                hargaPerTahun: kamar.hargaPerTahun || "",
                catatan: kamar.catatan || "",
            });

            // Check if kamar has sewa
            if (kamar.sewa !== null) {
                await fetchSewaData(kamar.sewa.id);
                await showPenyewaData(kamar.sewa.penyewa.id);
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
            const hargaTotal = harga * (prev.jumlahDurasi || 0);

            return {
                ...prev,
                idDurasi: idDurasi,
                hargaPerDurasi: harga,
                hargaTotal,
            };
        });
    };

    // Handle jumlah durasi perubahan
    const handleJumlahDurasiChange = (jumlah) => {
        setFormSewa((prev) => {
            const hargaTotal = prev.hargaPerDurasi * jumlah;
            return {
                ...prev,
                jumlahDurasi: jumlah,
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

            const dataToSend = {
                idKamar,
                idPenyewa: formSewa.idPenyewa,
                tanggalMasuk: formSewa.tanggalMasuk,
                tanggalKeluar: formSewa.tanggalKeluar,
                idDurasi: formSewa.idDurasi,
                hargaPerDurasi: formSewa.hargaPerDurasi,
                jumlahDurasi: formSewa.jumlahDurasi,
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
            setFormSewa({
                idPenyewa: "",
                durasiSewa: "Harian",
                jumlahDurasi: 1,
                hargaPerDurasi: 0,
                hargaTotal: 0,
            });
        } catch (err) {
            toast.error(err.message || "Gagal menyimpan data sewa");
        }
    };

    const handleSavePembayaran = async () => {
        try {

            const dataToSend = {
                idTagihan: formPembayaran.idTagihan,
                tanggalBayar: formPembayaran.tanggalBayar,
                idMetodeBayar: formPembayaran.idMetodeBayar,
                totalBayar: formPembayaran.totalBayar,
            };

            await createPembayaran(dataToSend);
            toast.success("Pembayaran berhasil disimpan");

            await fetchKamarData();

            setFormPembayaran({
                idTagihan: "",
                tanggalBayar: "",
                idMetodeBayar: "",
                totalBayar: 0
            });

            return true;
        } catch (err) {
            toast.error(err.message || "Gagal menyimpan tagihan");
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

        // Tab
        activeTab,
        setActiveTab,

        // Handlers
        handleDurasiSewaChange,
        handleJumlahDurasiChange,
        handleSaveProfil,
        handleSaveSewa,
        handleSavePembayaran,

        // Refetch
        fetchKamarData,
        fetchTagihanList,
    };
};
