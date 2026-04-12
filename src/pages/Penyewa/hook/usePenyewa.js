import { useState, useEffect, useCallback } from "react";
import { getPenyewa, createPenyewa } from "../../../api/penyewa";
import { getJenisKelamin } from "../../../api/jenis-kelamin";
import { getStatusPernikahan } from "../../../api/status-pernikahan";
import { getPengenal } from "../../../api/pengenal";
import { toast } from "react-toastify";

export const usePenyewa = () => {
    const [penyewaList, setPenyewaList] = useState([]);
    const [jenisKelaminList, setJenisKelaminList] = useState([]);
    const [statusPernikahanList, setStatusPernikahanList] = useState([]);
    const [pengenalList, setPengenalList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);

    const [form, setForm] = useState({
        nama: "",
        idPengenal: "",
        noPengenal: "",
        idJenisKelamin: "",
        idStatusPernikahan: "",
        noTelp: "",
        alamat: "",
        email: "",
        dokumenFile: null
    });

    const fetchJenisKelamin = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getJenisKelamin();
            setJenisKelaminList(data.data);
        } catch (err) {
            setError(err.message || "Gagal memuat data properti");
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchStatusPernikahan = useCallback(async () => {
        try {
            const data = await getStatusPernikahan();
            setStatusPernikahanList(data.data);
        } catch (err) {
            setError(err.message || "Gagal memuat data status pernikahan");
        }
    }, []);

    const fetchPengenal = useCallback(async () => {
        try {
            const data = await getPengenal();
            setPengenalList(data.data);
        } catch (err) {
            setError(err.message || "Gagal memuat data pengenal");
        }
    }, []);

    const fetchPenyewa = useCallback(async () => {
        try {
            const data = await getPenyewa();
            console.log("Data penyewa:", data.data);
            setPenyewaList(data.data);
        } catch (err) {
            setError(err.message || "Gagal memuat data penyewa");
        }
    }, []);

    useEffect(() => {
        fetchPenyewa();
        fetchJenisKelamin();
        fetchStatusPernikahan();
        fetchPengenal();
    }, [fetchPenyewa, fetchJenisKelamin, fetchStatusPernikahan, fetchPengenal]);

    const buildPenyewaFormData = (f) => {
        const fd = new FormData();
        fd.append("nama", f.nama ?? "");
        fd.append("alamat", f.alamat ?? "");
        fd.append("noTelp", f.noTelp ?? "");
        fd.append("email", f.email ?? "");
        fd.append("idPengenal", f.idPengenal ?? "");
        fd.append("noPengenal", f.noPengenal ?? "");
        fd.append("idJenisKelamin", f.idJenisKelamin ?? "");
        fd.append("idStatusPernikahan", f.idStatusPernikahan ?? "");
        fd.append("dokumen_pengenal", f.dokumenFile);
        return fd;
    };

    const handleSave = async () => {
        try {
            if (!form.dokumenFile) {
                toast.error("Dokumen pengenal wajib diunggah", { position: "top-right" });
                return;
            }
            await createPenyewa(buildPenyewaFormData(form));
            toast.success("Penyewa berhasil disimpan", { position: "top-right" });

            setShowModal(false);
            fetchPenyewa();
            setForm({
                nama: "",
                idPengenal: "",
                noPengenal: "",
                idJenisKelamin: "",
                idStatusPernikahan: "",
                noTelp: "",
                alamat: "",
                email: "",
                dokumenFile: null
            });
        } catch (err) {
            console.error(err);
            toast.error(err.message || "Gagal menyimpan penyewa", { position: "top-right" });  
        }
    };

    const filteredPenyewa = penyewaList.filter((item) =>
        item.nama.toLowerCase().includes(search.toLowerCase())
    );

    const closeModal = () => {
        setShowModal(false);
        setForm((prev) => ({ ...prev, dokumenFile: null }));
    };

    return {
        filteredPenyewa,
        loading,
        error,
        search,
        form,
        setForm,
        jenisKelaminList,
        statusPernikahanList,
        pengenalList,
        showModal,
        handleSave,
        setShowModal,
        closeModal,
        setSearch,
    };
};