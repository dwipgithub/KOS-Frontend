import React from "react";
import { Routes, Route } from "react-router-dom";
import Beranda from '../pages/Beranda/Beranda'
import Properti from "../pages/Properti/Properti";
import PengelolaanProperti from "../pages/PropertiPengelolaan/PengelolaanProperti";
import Kamar from "../pages/Kamar/Kamar";
import PengelolaanKamar from "../pages/KamarPengelolaan/PengelolaanKamar";
import Penyewa from "../pages/Penyewa/Penyewa";
import PengelolaanPenyewa from "../pages/PenyewaPengelola/PengelolaanPenyewa";
import LaporanArusKas from "../pages/LaporanArusKas/LaporanArusKas";
import Pengeluaran from "../pages/Pengeluaran/Pengeluaran";
import LaporanLabaRugi from "../pages/LaporanLabaRugi/LaporanLabaRugi";
import LaporanBukuBesar from "../pages/LaporanBukuBesar/LaporanBukuBesar";

const Content = () => {
    return (
        <div className="container p-4 ">
            <Routes>
                <Route path="/beranda" element={<Beranda />} />
                <Route path="/properti" element={<Properti/>}/>
                <Route path="/properti-pengelolaan/:id" element={<PengelolaanProperti/>}/>
                <Route path="/kamar" element={<Kamar/>}/>
                <Route path="/kamar-pengelolaan/:id" element={<PengelolaanKamar/>}/>
                <Route path="/penyewa" element={<Penyewa/>}/>
                <Route path="/penyewa-pengelolaan/:id" element={<PengelolaanPenyewa/>}/>
                <Route path="/pengeluaran" element={<Pengeluaran/>}/>
                <Route path="/laporan-arus-kas" element={<LaporanArusKas/>}/>
                <Route path="/laporan-laba-rugi" element={<LaporanLabaRugi/>}/>
                <Route path="/laporan-buku-besar" element={<LaporanBukuBesar/>}/>
            </Routes>
        </div>
    )
}

export default Content;