import axiosJWT from "./axiosJWT";

export const getLaporanPiutangApi = async (filters = {}) => {
    try {
        return axiosJWT.get(`/api/v1/laporan/piutang`, { params: filters });
    } catch (error) {
        console.error("Gagal mengambil data laporan piutang:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    }
}

export const exportPdfPiutangApi = async (filters = {}) => {
    try {
        const response = await axiosJWT.get(`/api/v1/laporan/piutang/export/pdf`, { 
            params: filters,
            responseType: 'blob'
        });
        console.log('PDF API Response:', {
            status: response.status,
            contentType: response.headers['content-type'],
            contentLength: response.headers['content-length'],
            dataSize: response.data.size
        })
        return response;
    } catch (error) {
        console.error("API Error exporting PDF:", error.message);
        if (error.response) {
            console.error("Error response status:", error.response.status);
            console.error("Error response data:", error.response.data);
        }
        throw error;
    }
}