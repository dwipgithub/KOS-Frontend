import { useState, useEffect, useCallback } from "react";
import { getKamar } from "../../../api/kamar";
import { getProperti } from "../../../api/properti"
import { getStatusKamar } from "../../../api/status-kamar";
import { createKamar } from "../../../api/kamar";
import { toast } from "react-toastify";

export const useKamar = () => {
    const [kamarList, setKamarList] = useState([]);
    const [propertiList, setPropertiList] = useState([]);
    const [statusKamarList, setStatusKamarList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);

    const [form, setForm] = useState({
        nama: "",
        idProperti: "",
        idStatusKamar: "",
        catatan: "",
        hargaPerHari: "",
        hargaPerMinggu: "",
        hargaPerBulan: "",
        hargaPerTahun: ""
    });

    const fetchKamar = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getKamar();
            setKamarList(data.data);
        } catch (err) {
            setError(err.message || "Gagal memuat data properti");
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchProperti = useCallback(async () => {
        try {
            const data = await getProperti();
            setPropertiList(data.data);
        } catch (err) {
            console.error(err);
        }
    }, []);

    const fetchStatusKamar = useCallback(async () => {
        try {
            const data = await getStatusKamar();
            setStatusKamarList(data.data);
        } catch (err) {
            console.error(err);
        }
    }, []);

    useEffect(() => {
        fetchKamar();
        fetchProperti();
        fetchStatusKamar();
    }, [fetchKamar, fetchProperti, fetchStatusKamar]);

    const handleSave = async () => {
        try {
            await createKamar(form);
            toast.success("Kamar berhasil disimpan", { position: "top-right" });

            setShowModal(false);
            fetchKamar();
            setForm({
                nama: "",
                idProperti: "",
                idStatusKamar: "",
                catatan: "",
                hargaPerHari: "",
                hargaPerMinggu: "",
                hargaPerBulan: "",
                hargaPertahun: ""
            });
        } catch (err) {
            console.error(err);
            toast.error(err.message || "Gagal menyimpan properti", { position: "top-right" });  
        }
    };

    const filteredKamar = kamarList.filter((item) =>
        item.nama.toLowerCase().includes(search.toLowerCase())
    );

    return {
        filteredKamar,
        loading,
        error,
        search,
        form,
        setForm,
        propertiList,
        statusKamarList,
        showModal,
        handleSave,
        setShowModal,
        setSearch,
    };
};