import React from "react";
import { Routes, Route } from "react-router-dom";
import Beranda from '../pages/Beranda/Beranda'
import Properti from "../pages/Properti/Properti";
import Kamar from "../pages/Kamar/Kamar";
import PengelolaanKamar from "../pages/Kamar/PengelolaanKamar";
import Penyewa from "../pages/Penyewa/Penyewa";

const Content = () => {
    return (
        <div className="container p-4 ">
            <Routes>
                <Route path="/beranda" element={<Beranda />} />
                <Route path="/properti" element={<Properti/>}/>
                <Route path="/kamar" element={<Kamar/>}/>
                <Route path="/kamar/:id/pengelolaan" element={<PengelolaanKamar/>}/>
                <Route path="/penyewa" element={<Penyewa/>}/>
            </Routes>
        </div>
    )
}

export default Content;