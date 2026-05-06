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
import LaporanPiutang from "../pages/LaporanPiutang/LaporanPiutang";
import ChangePassword from "../pages/Pengguna/ChangePassword";
import TambahPengguna from "../pages/Pengguna/Pengguna";
import PermissionRoute from "../routes/PermissionRoute";

const Content = () => {
    return (
        <div className="container p-4 ">
            <Routes>
                <Route path="/beranda" element={<Beranda />} />
                <Route path="/properti" element={<PermissionRoute permission="properti"><Properti/></PermissionRoute>} />
                <Route path="/properti-pengelolaan/:id" element={<PermissionRoute permission="properti"><PengelolaanProperti/></PermissionRoute>} />
                <Route path="/kamar" element={<PermissionRoute permission="kamar"><Kamar/></PermissionRoute>} />
                <Route path="/kamar-pengelolaan/:id" element={<PermissionRoute permission="kamar"><PengelolaanKamar/></PermissionRoute>} />
                <Route path="/penyewa" element={<PermissionRoute permission="penyewa"><Penyewa/></PermissionRoute>} />
                <Route path="/penyewa-pengelolaan/:id" element={<PermissionRoute permission="penyewa"><PengelolaanPenyewa/></PermissionRoute>} />
                <Route path="/pengeluaran" element={<PermissionRoute permission="pengeluaran"><Pengeluaran/></PermissionRoute>} />
                <Route path="/laporan-arus-kas" element={<PermissionRoute permission="laporan_arus_kas"><LaporanArusKas/></PermissionRoute>} />
                <Route path="/laporan-laba-rugi" element={<PermissionRoute permission="laporan_laba_rugi"><LaporanLabaRugi/></PermissionRoute>} />
                <Route path="/laporan-buku-besar" element={<PermissionRoute permission="laporan_buku_besar"><LaporanBukuBesar/></PermissionRoute>} />
                <Route path="/laporan-piutang" element={<PermissionRoute permission="laporan_piutang"><LaporanPiutang/></PermissionRoute>} />
                <Route path="/change-password" element={<ChangePassword />} />
                <Route path="/tambah-pengguna" element={<PermissionRoute permission="tambah_pengguna"><TambahPengguna/></PermissionRoute>} />
            </Routes>
        </div>
    )
}

export default Content;