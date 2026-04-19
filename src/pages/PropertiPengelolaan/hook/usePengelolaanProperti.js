import { useState, useEffect, useCallback } from "react";
import { getPropertiById, updateProperti } from "../../../services/propertiService";
import { getProvinsi } from "../../../services/provinsiService";
import { getKabKota } from "../../../services/kabKotaService";
import { getKecamatan } from "../../../services/kecamatanService";
import { getKelurahan } from "../../../services/kelurahanService";
import { toast } from "react-toastify";

const emptyForm = () => ({
    nama: "",
    noTelp: "",
    catatan: "",
    alamat: "",
    idProvinsi: "",
    idKabKota: "",
    idKecamatan: "",
    idKelurahan: ""
});

export const usePengelolaanProperti = (id) => {
    const [propertiData, setPropertiData] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [provinsiList, setProvinsiList] = useState([]);
    const [kabKotaList, setKabKotaList] = useState([]);
    const [kecamatanList, setKecamatanList] = useState([]);
    const [kelurahanList, setKelurahanList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const fetchKabKota = useCallback(async (provId) => {
        if (!provId) {
            setKabKotaList([]);
            return;
        }
        try {
            const data = await getKabKota({ provinsiId: provId });
            setKabKotaList(data.data || []);
        } catch {
            setKabKotaList([]);
        }
    }, []);

    const fetchKecamatan = useCallback(async (kabKotaId) => {
        if (!kabKotaId) {
            setKecamatanList([]);
            return;
        }
        try {
            const data = await getKecamatan({ kabKotaId });
            setKecamatanList(data.data || []);
        } catch {
            setKecamatanList([]);
        }
    }, []);

    const fetchKelurahan = useCallback(async (kecId) => {
        if (!kecId) {
            setKelurahanList([]);
            return;
        }
        try {
            const data = await getKelurahan({ kecamatanId: kecId });
            setKelurahanList(data.data || []);
        } catch {
            setKelurahanList([]);
        }
    }, []);

    useEffect(() => {
        setPropertiData(null);
        setForm(emptyForm());
        setKabKotaList([]);
        setKecamatanList([]);
        setKelurahanList([]);
    }, [id]);

    const loadProperti = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        try {
            const [provRes, detailRes] = await Promise.all([
                getProvinsi(),
                getPropertiById(id)
            ]);
            setProvinsiList(provRes.data || []);

            const d = detailRes.data;
            setPropertiData(d);

            const provId = d.provinsi?.id || "";
            const kabId = d.kabKota?.id || "";
            const kecId = d.kecamatan?.id || "";
            const kelId = d.kelurahan?.id || "";

            if (provId) {
                const kabData = await getKabKota({ provinsiId: provId });
                setKabKotaList(kabData.data || []);
            } else {
                setKabKotaList([]);
            }

            if (kabId) {
                const kecData = await getKecamatan({ kabKotaId: kabId });
                setKecamatanList(kecData.data || []);
            } else {
                setKecamatanList([]);
            }

            if (kecId) {
                const kelData = await getKelurahan({ kecamatanId: kecId });
                setKelurahanList(kelData.data || []);
            } else {
                setKelurahanList([]);
            }

            setForm({
                nama: d.nama ?? "",
                noTelp: d.noTelp ?? "",
                catatan: d.catatan ?? "",
                alamat: d.alamat ?? "",
                idProvinsi: provId,
                idKabKota: kabId,
                idKecamatan: kecId,
                idKelurahan: kelId
            });
        } catch (err) {
            const msg = err?.message;
            toast.error(typeof msg === "string" ? msg : "Gagal memuat properti", {
                position: "top-right"
            });
            setPropertiData(null);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        loadProperti();
    }, [loadProperti]);

    const handleProvinsiChange = (provId) => {
        setForm((prev) => ({
            ...prev,
            idProvinsi: provId,
            idKabKota: "",
            idKecamatan: "",
            idKelurahan: ""
        }));
        fetchKabKota(provId);
        setKecamatanList([]);
        setKelurahanList([]);
    };

    const handleKabKotaChange = (kabId) => {
        setForm((prev) => ({
            ...prev,
            idKabKota: kabId,
            idKecamatan: "",
            idKelurahan: ""
        }));
        fetchKecamatan(kabId);
        setKelurahanList([]);
    };

    const handleKecamatanChange = (kecId) => {
        setForm((prev) => ({
            ...prev,
            idKecamatan: kecId,
            idKelurahan: ""
        }));
        fetchKelurahan(kecId);
    };

    const handleKelurahanChange = (kelId) => {
        setForm((prev) => ({ ...prev, idKelurahan: kelId }));
    };

    const handleSave = async () => {
        if (!id) return;
        setSaving(true);
        try {
            await updateProperti(id, { ...form });
            toast.success("Properti diperbarui", { position: "top-right" });
            await loadProperti();
        } catch (err) {
            const msg = err?.message;
            toast.error(typeof msg === "string" ? msg : "Gagal menyimpan", { position: "top-right" });
        } finally {
            setSaving(false);
        }
    };

    return {
        propertiData,
        form,
        setForm,
        provinsiList,
        kabKotaList,
        kecamatanList,
        kelurahanList,
        loading,
        saving,
        handleSave,
        handleProvinsiChange,
        handleKabKotaChange,
        handleKecamatanChange,
        handleKelurahanChange,
        reload: loadProperti
    };
};
