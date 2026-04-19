import { createPembayaranApi } from "../api/pembayaran";

export const createPembayaran = async (data) => {
    try {
        const response = await createPembayaranApi(data);
        return response.data;
    } catch (error) {
        console.error("Gagal membuat properti:", error);
        throw error.response?.data || { message: "Terjadi   kesalahan koneksi" };
    } 
}