import { createKeluarApi } from "../api/keluar";

export const createKeluar = async (data) => {
    try {
        const response = await createKeluarApi(data);
        return response.data;
    } catch (error) {
        console.error("Gagal membuat keluar:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    }
};
