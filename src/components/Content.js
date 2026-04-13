import React from "react";
import { Routes, Route } from "react-router-dom";
import Beranda from '../pages/Beranda/Beranda'
import Properti from "../pages/Properti/Properti";
import PengelolaanProperti from "../pages/Properti/PengelolaanProperti";
import Kamar from "../pages/Kamar/Kamar";
import PengelolaanKamar from "../pages/Kamar/PengelolaanKamar";
import Penyewa from "../pages/Penyewa/Penyewa";
import PengelolaanPenyewa from "../pages/Penyewa/PengelolaanPenyewa";

const Content = () => {
    return (
        <div className="container p-4 ">
            <Routes>
                <Route path="/beranda" element={<Beranda />} />
                <Route path="/properti" element={<Properti/>}/>
                <Route path="/properti/:id/pengelolaan" element={<PengelolaanProperti/>}/>
                <Route path="/kamar" element={<Kamar/>}/>
                <Route path="/kamar/:id/pengelolaan" element={<PengelolaanKamar/>}/>
                <Route path="/penyewa" element={<Penyewa/>}/>
                <Route path="/penyewa/:id/pengelolaan" element={<PengelolaanPenyewa/>}/>
            </Routes>
        </div>
    )
}

export default Content;