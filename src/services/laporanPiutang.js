import { getLaporanPiutangApi, exportPdfPiutangApi } from "../api/laporan-piutang"

export const getLaporanPiutangKas = async (filters) => {
    try {
        const response = await getLaporanPiutangApi(filters);
        return response.data;
    } catch (error) {
        console.error("Gagal mengambil data laporan piutang:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    }
}

export const exportPdfPiutang = async (filters) => {
    try {
        const response = await exportPdfPiutangApi(filters);
        
        console.log('Response status:', response.status)
        console.log('Response headers:', response.headers)
        console.log('Response data type:', typeof response.data)
        console.log('Response data size:', response.data.size)
        console.log('Response data type:', response.data.type)

        // Validate PDF
        if (!response.data || response.data.size === 0) {
            throw new Error('PDF kosong atau tidak valid')
        }

        if (response.data.type !== 'application/pdf' && !response.data.type.includes('octet-stream')) {
            console.error('Invalid content type:', response.data.type)
            // Try to read error message
            const text = await response.data.text()
            console.error('Response text:', text)
            throw new Error(`Invalid PDF format: ${response.data.type}`)
        }

        // Create blob and download
        const blob = response.data;

        console.log(response.data instanceof Blob); // harus true
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `Laporan-Piutang-${new Date().getTime()}.pdf`)
        document.body.appendChild(link)
        link.click()
        link.parentNode.removeChild(link)
        window.URL.revokeObjectURL(url)

        console.log('✅ PDF berhasil diunduh')
    } catch (error) {
        console.error("Gagal mengexport laporan piutang ke PDF:", error)
        throw error.response?.data || { message: error.message || "Terjadi kesalahan koneksi" }
    }
}