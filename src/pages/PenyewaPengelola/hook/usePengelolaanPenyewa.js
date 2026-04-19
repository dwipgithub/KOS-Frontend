import { useState, useEffect, useCallback, useRef } from "react";
import { showPenyewa, updatePenyewa, fetchPrivateFileBlob } from "../../../services/penyewaService";
import { getJenisKelamin } from "../../../services/jenisKelaminService";
import { getStatusPernikahan } from "../../../services/statusPernikahanService";
import { getPengenal } from "../../../services/pengenalService";
import { getProfesi } from "../../../services/profesiService";
import { toast } from "react-toastify";

function inferMimeFromPath(path, blobType) {
    if (blobType && blobType !== "application/octet-stream") return blobType;
    const lower = (path || "").toLowerCase();
    if (lower.endsWith(".pdf")) return "application/pdf";
    if (lower.endsWith(".png")) return "image/png";
    if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
    if (lower.endsWith(".webp")) return "image/webp";
    if (lower.endsWith(".gif")) return "image/gif";
    return blobType || "application/octet-stream";
}

const emptyForm = () => ({
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

export const usePengelolaanPenyewa = (id) => {
    const [penyewaData, setPenyewaData] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [jenisKelaminList, setJenisKelaminList] = useState([]);
    const [statusPernikahanList, setStatusPernikahanList] = useState([]);
    const [pengenalList, setPengenalList] = useState([]);
    const [profesiList, setProfesiList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [docLoading, setDocLoading] = useState(false);
    const [docObjectUrl, setDocObjectUrl] = useState(null);
    const [docMime, setDocMime] = useState("");
    const docUrlRef = useRef(null);

    const revokeDocUrl = useCallback(() => {
        if (docUrlRef.current) {
            URL.revokeObjectURL(docUrlRef.current);
            docUrlRef.current = null;
        }
        setDocObjectUrl(null);
        setDocMime("");
    }, []);

    const loadReference = useCallback(async () => {
        const [jk, sp, pg, pr] = await Promise.all([
            getJenisKelamin(),
            getStatusPernikahan(),
            getPengenal(),
            getProfesi()
        ]);
        setJenisKelaminList(jk.data || []);
        setStatusPernikahanList(sp.data || []);
        setPengenalList(pg.data || []);
        setProfesiList(pr.data || []);
    }, []);

    const loadPenyewa = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        try {
            await loadReference();
            const res = await showPenyewa(id);
            const d = res.data;
            setPenyewaData(d);
            setForm({
                nama: d.nama ?? "",
                idPengenal: d.pengenal?.id ?? "",
                noPengenal: d.pengenal?.noPengenal ?? "",
                idJenisKelamin: d.jenisKelamin?.id ?? "",
                idStatusPernikahan: d.statusPernikahan?.id ?? "",
                idProfesi: d.profesi?.id ?? "",
                noTelp: d.noTelp ?? "",
                alamat: d.alamat ?? "",
                email: d.email ?? "",
                namaInstitusi: d.institusi?.nama ?? "",
                alamatInstitusi: d.institusi?.alamat ?? "",
                noTelpInstitusi: d.institusi?.noTelp ?? "",
                dokumenFile: null
            });
        } catch (err) {
            const msg = err?.message || "Gagal memuat penyewa";
            toast.error(typeof msg === "string" ? msg : "Gagal memuat penyewa", { position: "top-right" });
            setPenyewaData(null);
        } finally {
            setLoading(false);
        }
    }, [id, loadReference]);

    useEffect(() => {
        setPenyewaData(null);
        setForm(emptyForm());
        revokeDocUrl();
    }, [id, revokeDocUrl]);

    useEffect(() => {
        loadPenyewa();
    }, [loadPenyewa]);

    useEffect(() => {
        const path = penyewaData?.dokumenPengenal;
        if (!path) {
            revokeDocUrl();
            return undefined;
        }

        let cancelled = false;
        (async () => {
            setDocLoading(true);
            revokeDocUrl();
            try {
                const blob = await fetchPrivateFileBlob(path);
                if (cancelled || !blob) return;
                const mime = inferMimeFromPath(path, blob.type);
                const url = URL.createObjectURL(blob);
                docUrlRef.current = url;
                setDocObjectUrl(url);
                setDocMime(mime);
            } catch {
                if (!cancelled) {
                    toast.error("Gagal memuat dokumen identitas", { position: "top-right" });
                }
            } finally {
                if (!cancelled) setDocLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [penyewaData?.dokumenPengenal, revokeDocUrl]);

    useEffect(() => () => revokeDocUrl(), [revokeDocUrl]);

    const buildFormData = useCallback((f) => {
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
        if (f.dokumenFile) fd.append("dokumen_pengenal", f.dokumenFile);
        return fd;
    }, []);

    const handleSave = async () => {
        if (!id) return;
        setSaving(true);
        try {
            if (form.dokumenFile) {
                await updatePenyewa(id, buildFormData(form));
            } else {
                await updatePenyewa(id, {
                    nama: form.nama,
                    alamat: form.alamat,
                    noTelp: form.noTelp,
                    email: form.email,
                    idPengenal: form.idPengenal,
                    noPengenal: form.noPengenal,
                    idJenisKelamin: form.idJenisKelamin,
                    idStatusPernikahan: form.idStatusPernikahan,
                    idProfesi: form.idProfesi,
                    namaInstitusi: form.namaInstitusi,
                    alamatInstitusi: form.alamatInstitusi,
                    noTelpInstitusi: form.noTelpInstitusi
                });
            }
            toast.success("Profil penyewa diperbarui", { position: "top-right" });
            setForm((prev) => ({ ...prev, dokumenFile: null }));
            await loadPenyewa();
        } catch (err) {
            const msg = err?.message || "Gagal menyimpan";
            toast.error(typeof msg === "string" ? msg : "Gagal menyimpan", { position: "top-right" });
        } finally {
            setSaving(false);
        }
    };

    return {
        penyewaData,
        form,
        setForm,
        jenisKelaminList,
        statusPernikahanList,
        pengenalList,
        profesiList,
        loading,
        saving,
        docLoading,
        docObjectUrl,
        docMime,
        reload: loadPenyewa,
        handleSave
    };
};
