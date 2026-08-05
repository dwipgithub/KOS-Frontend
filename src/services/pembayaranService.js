import { createPembayaranApi, downloadKwitansiApi } from "../api/pembayaran";

export const createPembayaran = async (data) => {
    try {
        const response = await createPembayaranApi(data);
        return response.data;
    } catch (error) {
        console.error("Gagal membuat properti:", error);
        throw error.response?.data || { message: "Terjadi   kesalahan koneksi" };
    } 
}

export const downloadKwitansi = async (id) => {
    try {
        const response = await downloadKwitansiApi(id);
        const blob = response.data;

        if (!blob || blob.size === 0) {
            throw new Error("File kwitansi kosong atau tidak ditemukan");
        }

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `Kwitansi-${id}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        return true;
    } catch (error) {
        console.error("Gagal mendownload kwitansi:", error);
        throw error.response?.data || { message: error.message || "Terjadi kesalahan koneksi" };
    }
}