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

export const fetchPrivateFileBlob = async(pathFromApi) => {
    try {
        const response = await fetchPrivateFileBlobApi(pathFromApi);
        return response.data;
    } catch (error) {
        console.error("Gagal mengambil file privat:", error);
        throw error.response?.data || { message: "Gagal mengambil file" };
    }
}