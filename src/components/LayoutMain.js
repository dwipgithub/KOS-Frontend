import React from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Content from "./Content";

const LayoutMain = () => {
    return (
        <div className="d-flex">
            {/* Sidebar kiri */}
            <Sidebar />
            <div className="flex-grow-1">
                <Navbar />
                <Content />
            </div>
        </div>
    );
};

export default LayoutMain;