import { getPenyewaApi, showPenyewaApi, createPenyewaApi, updatePenyewaApi, fetchPrivateFileBlobApi } from "../api/penyewa";

export const getPenyewa = async (filters = {}) => {
    try {
        const response = await getPenyewaApi(filters);
        return response.data;
    } catch (error) {
        console.error("Gagal mengambil data properti:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    } 
}

export const showPenyewa = async (id) => {
    try {
        const response = await showPenyewaApi(id);
        return response.data;
    } catch (error) {
        console.error("Gagal mengambil data properti:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    } 
}

export const createPenyewa = async (data) => {
    try {
        const response = await createPenyewaApi(data);
        return response.data;
    } catch (error) {
        console.error("Gagal membuat properti:", error);
        throw error.response?.data || { message: "Terjadi   kesalahan koneksi" };
    } 
}

export const updatePenyewa = async (id, data) => {
    try {
        const response = await updatePenyewaApi(id, data);
        return response.data;
    } catch (error) {
        console.error("Gagal memperbarui properti:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    } 
}

export const fetchPrivateFileBlob = async (pathFromApi) => {
    try {
        const response = await fetchPrivateFileBlobApi(pathFromApi);
        const blob = response.data;

        if (!blob || blob.size === 0) {
            throw new Error("File kosong atau tidak ditemukan");
        }

        if (blob.type === "application/json") {
            const text = await blob.text();
            let message = "Gagal mengambil file";
            try {
                const parsed = JSON.parse(text);
                message = parsed?.message || message;
            } catch {
                // keep default message
            }
            throw new Error(message);
        }

        return blob;
    } catch (error) {
        console.error("Gagal mengambil file privat:", error);
        throw error?.message
            ? error
            : error.response?.data || { message: "Gagal mengambil file" };
    }
}