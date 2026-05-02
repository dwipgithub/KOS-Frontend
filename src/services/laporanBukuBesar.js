import { getLaporanBukuBesarApi, exportPdfBukuBesarApi } from "../api/laporan-buku-besar"

export const getLaporanBukuBesar = async (filters) => {
    try {
        const response = await getLaporanBukuBesarApi(filters);
        return response.data;
    } catch (error) {
        console.error("Gagal mengambil data laporan buku besar", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    }
}

export const exportPdfBukuBesar = async (filters) => {
    try {
        const response = await exportPdfBukuBesarApi(filters);
        
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
            const text = await response.data.text()
            console.error('Response text:', text)
            throw new Error(`Invalid PDF format: ${response.data.type}`)
        }

        const blob = response.data;
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `Laporan-Buku-Besar-${new Date().getTime()}.pdf`)
        document.body.appendChild(link)
        link.click()
        link.parentNode.removeChild(link)
        window.URL.revokeObjectURL(url)

        console.log('✅ PDF berhasil diunduh')
    } catch (error) {
        console.error("Gagal mengexport laporan buku besar ke PDF:", error)
        throw error.response?.data || { message: error.message || "Terjadi kesalahan koneksi" }
    }
}