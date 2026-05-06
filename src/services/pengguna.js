import { createPenggunaApi, changePasswordApi } from "../api/pengguna"

export const createPengguna = async (data) => {
    try {
        const response = await createPenggunaApi(data);
        return response.data;
    } catch (error) {
        console.error("Gagal membuat pengguna:", error);
        throw error.response?.data || { message: "Terjadi   kesalahan koneksi" };
    } 
}

export const changePassword = async (data) => {
    try {
        const response = await changePasswordApi(data);
        return response.data;
    } catch (error) {
        console.error("Gagal mengubah password:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    }
}