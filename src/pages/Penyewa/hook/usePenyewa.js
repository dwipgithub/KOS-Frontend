import { useState, useEffect, useCallback } from "react";
import { getPenyewa, createPenyewa } from "../../../services/penyewaService";
import { getJenisKelamin } from "../../../services/jenisKelaminService";
import { getStatusPernikahan } from "../../../services/statusPernikahanService";
import { getPengenal } from "../../../services/pengenalService";
import { getProfesi } from "../../../services/profesiService";
import { toast } from "react-toastify";

export const usePenyewa = () => {
    const [penyewaList, setPenyewaList] = useState([]);
    const [jenisKelaminList, setJenisKelaminList] = useState([]);
    const [statusPernikahanList, setStatusPernikahanList] = useState([]);
    const [pengenalList, setPengenalList] = useState([]);
    const [profesiList, setProfesiList] = useState([]);
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
        idProfesi: "",
        noTelp: "",
        alamat: "",
        email: "",
        namaInstitusi: "",
        alamatInstitusi: "",
        noTelpInstitusi: "",
        dokumenFile: null
    });

    const refreshPenyewa = useCallback(async () => {
        try {
            const data = await getPenyewa();
            setPenyewaList(data.data);
        } catch (err) {
            setError(err.message || "Gagal memuat data penyewa");
        }
    }, []);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            setError(null);
            try {
                const [pRes, jkRes, spRes, pgRes, prRes] = await Promise.all([
                    getPenyewa(),
                    getJenisKelamin(),
                    getStatusPernikahan(),
                    getPengenal(),
                    getProfesi()
                ]);
                if (!cancelled) {
                    setPenyewaList(pRes.data);
                    setJenisKelaminList(jkRes.data);
                    setStatusPernikahanList(spRes.data);
                    setPengenalList(pgRes.data);
                    setProfesiList(prRes.data);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err.message || "Gagal memuat data penyewa");
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

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
        fd.append("idProfesi", f.idProfesi ?? "");
        fd.append("namaInstitusi", f.namaInstitusi ?? "");
        fd.append("alamatInstitusi", f.alamatInstitusi ?? "");
        fd.append("noTelpInstitusi", f.noTelpInstitusi ?? "");
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
            await refreshPenyewa();
            setForm({
                nama: "",
                idPengenal: "",
                noPengenal: "",
                idJenisKelamin: "",
                idStatusPernikahan: "",
                idProfesi: "",
                noTelp: "",
                alamat: "",
                email: "",
                namaInstitusi: "",
                alamatInstitusi: "",
                noTelpInstitusi: "",
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
        profesiList,
        showModal,
        handleSave,
        setShowModal,
        closeModal,
        setSearch,
    };
};