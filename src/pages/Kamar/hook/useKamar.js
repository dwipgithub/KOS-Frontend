import { useState, useEffect, useCallback } from "react";
import { getKamar, createKamar } from "../../../services/kamarService";
import { getProperti } from "../../../services/propertiService";
import { getStatusKamar } from "../../../services/statusKamarService";
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
        hargaPerHari: "0",
        hargaPerMinggu: "0",
        hargaPerBulan: "",
        hargaPerTahun: ""
    });

    const refreshKamar = useCallback(async () => {
        try {
            const data = await getKamar();
            setKamarList(data.data);
        } catch (err) {
            console.error(err);
        }
    }, []);

    const loadAll = useCallback(async (showLoading) => {
        if (showLoading) setLoading(true);
        try {
            const [kRes, pRes, sRes] = await Promise.all([
                getKamar(),
                getProperti(),
                getStatusKamar()
            ]);
            setKamarList(kRes.data);
            setPropertiList(pRes.data);
            setStatusKamarList(sRes.data);
        } catch (err) {
            setError(err.message || "Gagal memuat data kamar");
        } finally {
            if (showLoading) setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadAll(true);
    }, [loadAll]);

    const handleSave = async () => {
        try {
            await createKamar(form);
            toast.success("Kamar berhasil disimpan", { position: "top-right" });

            setShowModal(false);
            await refreshKamar();
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