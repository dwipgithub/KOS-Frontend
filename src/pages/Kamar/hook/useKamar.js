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
    const [selectedProperti, setSelectedProperti] = useState(null);

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

    const refreshKamar = useCallback(async (idProperti) => {
        try {
            if (!idProperti) {
                setKamarList([]);
                return;
            }
            const data = await getKamar({ id_properti: idProperti });
            setKamarList(data.data);
        } catch (err) {
            console.error(err);
        }
    }, []);

    const loadInitial = useCallback(async (showLoading) => {
        if (showLoading) setLoading(true);
        try {
            const [pRes, sRes] = await Promise.all([getProperti(), getStatusKamar()]);
            setPropertiList(pRes.data);
            setStatusKamarList(sRes.data);
        } catch (err) {
            setError(err.message || "Gagal memuat data kamar");
        } finally {
            if (showLoading) setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadInitial(true);
    }, [loadInitial]);

    const handleSelectProperti = async (properti) => {
        setSelectedProperti(properti);
        setSearch("");
        setError(null);
        setLoading(true);
        try {
            const kRes = await getKamar({ id_properti: properti.id });
            setKamarList(kRes.data);
        } catch (err) {
            setError(err.message || "Gagal memuat data kamar");
            setKamarList([]);
        } finally {
            setLoading(false);
        }
    };

    const handleBackToProperti = () => {
        setSelectedProperti(null);
        setSearch("");
        setError(null);
        setKamarList([]);
    };

    const handleSave = async () => {
        try {
            await createKamar(form);
            toast.success("Kamar berhasil disimpan", { position: "top-right" });

            setShowModal(false);
            await refreshKamar(selectedProperti?.id);
            setForm({
                nama: "",
                idProperti: selectedProperti?.id || "",
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
        selectedProperti,
        propertiList,
        loading,
        error,
        search,
        form,
        setForm,
        statusKamarList,
        showModal,
        handleSave,
        setShowModal,
        setSearch,
        handleSelectProperti,
        handleBackToProperti,
    };
};