import { useState, useEffect, useCallback } from "react";
import { getProperti } from "../../../api/properti";
import { getProvinsi } from "../../../api/provinsi";
import { getKabKota } from "../../../api/kab-kota";
import { getKecamatan } from "../../../api/kecamatan";
import { getKelurahan } from "../../../api/kelurahan";
import { createProperti } from "../../../api/properti";
import { toast } from "react-toastify";

export const useProperti = () => {
    const [propertiList, setPropertiList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);

    const [provinsiList, setProvinsiList] = useState([]);
    const [kabKotaList, setKabKotaList] = useState([]);
    const [kecamatanList, setKecamatanList] = useState([]);
    const [kelurahanList, setKelurahanList] = useState([]);

    const [form, setForm] = useState({
        nama: "",
        noTelp: "",
        catatan: "",
        alamat: "",
        idProvinsi: "",
        idKabKota: "",
        idKecamatan: "",
        idKelurahan: "",
    });

    // API Calls
    const fetchProperti = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getProperti();
            setPropertiList(data.data);
        } catch (err) {
            setError(err.message || "Gagal memuat data properti");
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchProvinsi = useCallback(async () => {
        try {
            const data = await getProvinsi();
            setProvinsiList(data.data || []);
        } catch (err) {
            console.error(err);
        }
    }, []);

    const fetchKabKota = useCallback(async (provId) => {
        if (!provId) return setKabKotaList([]);
        try {
            const data = await getKabKota({ provinsiId: provId });
            setKabKotaList(data.data || []);
        } catch (err) {
            console.error(err);
        }
    }, []);

    const fetchKecamatan = useCallback(async (kabKotaId) => {
        if (!kabKotaId) return setKecamatanList([]);
        try {
            const data = await getKecamatan({ kabKotaId });
            setKecamatanList(data.data || []);
        } catch (err) {
            console.error(err);
        }
    }, []);

    const fetchKelurahan = useCallback(async (kecId) => {
        if (!kecId) return setKelurahanList([]);
        try {
            const data = await getKelurahan({ kecamatanId: kecId });
            setKelurahanList(data.data || []);
        } catch (err) {
            console.error(err);
        }
    }, []);

    // Effect
    useEffect(() => {
        fetchProperti();
        fetchProvinsi();
    }, [fetchProperti, fetchProvinsi]);

    useEffect(() => {
        if (!form.idProvinsi) {
            setKabKotaList([]);
            setForm(prev => ({ ...prev, idKabKota: "", idKecamatan: "", idKelurahan: "" }));
            return;
        }
        fetchKabKota(form.idProvinsi);
        setForm(prev => ({ ...prev, idKabKota: "", idKecamatan: "", idKelurahan: "" }));
    }, [form.idProvinsi, fetchKabKota]);

    useEffect(() => {
        if (!form.idKabKota) {
            setKecamatanList([]);
            setForm(prev => ({ ...prev, idKecamatan: "", idKelurahan: "" }));
            return;
        }
        fetchKecamatan(form.idKabKota);
        setForm(prev => ({ ...prev, idKecamatan: "", idKelurahan: "" }));
    }, [form.idKabKota, fetchKecamatan]);

    useEffect(() => {
        if (!form.idKecamatan) {
            setKelurahanList([]);
            setForm(prev => ({ ...prev, idKelurahan: "" }));
            return;
        }
        fetchKelurahan(form.idKecamatan);
        setForm(prev => ({ ...prev, idKelurahan: "" }));
    }, [form.idKecamatan, fetchKelurahan]);

    // Handlers
    const handleSave = async () => {
        try {
            await createProperti(form);
            toast.success("Properti berhasil disimpan", { position: "top-right" });

            setShowModal(false);
            fetchProperti();
            setForm({
                nama: "",
                noTelp: "",
                catatan: "",
                alamat: "",
                idProvinsi: "",
                idKabKota: "",
                idKecamatan: "",
                idKelurahan: "",
            });
        } catch (err) {
            console.error(err);
            toast.error(err.message || "Gagal menyimpan properti", { position: "top-right" });  
        }
    };

    const filteredProperti = propertiList.filter((item) =>
        item.nama.toLowerCase().includes(search.toLowerCase())
    );

    const formatAlamat = (card) => {
        return [
            card.alamat,
            card.kelurahan?.nama,
            card.kecamatan?.nama,
            card.kabKota?.nama,
            card.provinsi?.nama,
        ]
            .filter(Boolean)
            .join(", ");
    };

    return {
        propertiList,
        loading,
        error,
        search,
        setSearch,
        showModal,
        setShowModal,
        form,
        setForm,
        provinsiList,
        kabKotaList,
        kecamatanList,
        kelurahanList,
        fetchKabKota,
        fetchKecamatan,
        fetchKelurahan,
        handleSave,
        filteredProperti,
        formatAlamat,
    };
};