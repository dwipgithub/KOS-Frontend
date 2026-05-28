import React, { useState, useEffect, useMemo, useCallback } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Link, useLocation } from "react-router-dom";
import { FaHome } from "react-icons/fa";
import { useAuth } from "../context/auth/AuthContext";
import { canAccess, canAccessReport } from "../helpers/permissionHelper";

const Sidebar = () => {
    const [openMenus, setOpenMenus] = useState({});
    const [openSubMenus, setOpenSubMenus] = useState({});

    const location = useLocation();

    const pathname = location.pathname;

    const { permissions } = useAuth();

    const allMenus = useMemo(() => [
        {
            name: "Properti",
            path: "/properti",
            icon: "🏠",
            key: "properti",
        },
        {
            name: "Kamar",
            path: "/kamar",
            icon: "🛏️",
            key: "kamar",
        },
        {
            name: "Penyewa",
            path: "/penyewa",
            icon: "🧑‍💼",
            key: "penyewa",
        },
        {
            name: "Pengeluaran",
            path: "/pengeluaran",
            icon: "🧾",
            key: "pengeluaran",
        },
        {
            name: "Kas Operasional",
            path: "/kas-operasional",
            icon: "💵",
            key: "kas_operasional",
        },
        {
            name: "Laporan Keuangan",
            icon: "📊",
            key: "laporan",
            subMenus: [
                {
                    name: "Arus Kas",
                    path: "/laporan-arus-kas",
                    key: "arus_kas",
                },
                {
                    name: "Laba Rugi",
                    path: "/laporan-laba-rugi",
                    key: "laba_rugi",
                },
                {
                    name: "Buku Besar",
                    path: "/laporan-buku-besar",
                    key: "buku_besar",
                },
                {
                    name: "Piutang",
                    path: "/laporan-piutang",
                    key: "piutang",
                },
                {
                    name: "Mutasi Kas Operasional",
                    path: "/laporan-mutasi-kas-operasional",
                    key: "mutasi_kas_operasional",
                },
            ],
        },
    ], []);

    // =========================
    // FILTER MENU BERDASARKAN PERMISSION
    // =========================
    const menus = useMemo(() => {
        if (!permissions) return [];

        return allMenus
            .map((menu) => {

                // Menu dengan submenu
                if (menu.subMenus) {

                    const filteredSubMenus = menu.subMenus.filter((sub) =>
                        canAccessReport(sub.key, permissions)
                    );

                    return filteredSubMenus.length > 0
                        ? { ...menu, subMenus: filteredSubMenus }
                        : null;
                }

                // Menu biasa
                return canAccess(menu.key, permissions)
                    ? menu
                    : null;
            })
            .filter(Boolean);

    }, [permissions, allMenus]);

    // =========================
    // TOGGLE MENU
    // =========================
    const toggleMenu = (i) => {
        setOpenMenus((prev) => ({
            ...prev,
            [i]: !prev[i],
        }));
    };

    const toggleNested = (pi, si) => {
        setOpenSubMenus((prev) => ({
            ...prev,
            [pi]: {
                ...(prev[pi] || {}),
                [si]: !prev[pi]?.[si],
            },
        }));
    };

    // =========================
    // ACTIVE PATH
    // =========================
    const isPathActive = useCallback(
        (path) => pathname === path || pathname.startsWith(path),
        [pathname]
    );

    const isMenuActive = useCallback((menu) => {

        if (menu.path && isPathActive(menu.path)) {
            return true;
        }

        if (menu.subMenus) {
            return menu.subMenus.some((sub) => {

                if (sub.path && isPathActive(sub.path)) {
                    return true;
                }

                if (sub.subMenus) {
                    return sub.subMenus.some((ss) =>
                        isPathActive(ss.path)
                    );
                }

                return false;
            });
        }

        return false;

    }, [isPathActive]);

    // =========================
    // AUTO OPEN ACTIVE MENU
    // =========================
    useEffect(() => {

        const open = {};

        const subOpen = {};

        menus.forEach((menu, i) => {

            if (isMenuActive(menu)) {
                open[i] = true;
            }

            menu.subMenus?.forEach((sub, si) => {

                if (sub.subMenus) {

                    sub.subMenus.forEach((ss) => {

                        if (isPathActive(ss.path)) {

                            open[i] = true;

                            subOpen[i] = {
                                ...(subOpen[i] || {}),
                                [si]: true,
                            };
                        }
                    });
                }
            });
        });

        setOpenMenus(open);

        setOpenSubMenus(subOpen);

    }, [pathname, menus, isMenuActive, isPathActive]);

    return (
        <div
            className="d-flex flex-column p-3 bg-light border-end"
            style={{
                width: "260px",
                minWidth: "260px",
                flexShrink: 0,
                height: "100vh",
                position: "sticky",
                top: 0,
                overflowY: "auto",
            }}
        >

            {/* ========================= */}
            {/* CUSTOM STYLE */}
            {/* ========================= */}
            <style>{`

                .sidebar-menu{
                    transition: transform .15s ease, filter .15s ease;
                }

                .sidebar-menu:hover{
                    filter: brightness(1.06);
                    transform: translateX(6px);
                }

                .sidebar-submenu{
                    transition: transform .15s ease, background-color .15s ease;
                    font-size: 0.84rem;
                }

                .sidebar-submenu:hover{
                    background: rgba(255,122,24,0.12);
                    transform: translateX(6px);
                }

                .submenu{
                    display: none;
                }

                .submenu.show{
                    display: block;
                }

            `}</style>

            {/* ========================= */}
            {/* LOGO */}
            {/* ========================= */}
            <div className="mb-3 px-2">
                <h4
                    style={{
                        fontWeight: "800",
                        letterSpacing: "1px",
                        margin: 0,
                        color: "#000",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                    }}
                >
                    <FaHome style={{ fontSize: "1.2rem" }} />
                    KOS
                </h4>
            </div>

            {/* ========================= */}
            {/* MENU */}
            {/* ========================= */}
            <ul className="nav flex-column">

                {menus.map((menu, i) => (

                    <li key={i} className="nav-item mb-1">

                        {menu.subMenus ? (
                            <>
                                {/* ========================= */}
                                {/* MAIN MENU */}
                                {/* ========================= */}
                                <button
                                    className="btn w-100 text-start sidebar-menu"
                                    onClick={() => toggleMenu(i)}
                                    style={{
                                        background: "linear-gradient(90deg,#ff7a18,#ffb347)",
                                        color: "#fff",
                                        borderRadius: "8px",
                                        fontWeight: 600,
                                    }}
                                >
                                    {menu.icon} {menu.name}
                                </button>

                                {/* ========================= */}
                                {/* SUB MENU */}
                                {/* ========================= */}
                                <div className={`submenu ${openMenus[i] ? "show" : ""}`}>

                                    <ul
                                        className="nav flex-column ms-3 mt-2"
                                        style={{
                                            borderLeft: "2px dotted #ff7a18",
                                            paddingLeft: "10px",
                                        }}
                                    >

                                        {menu.subMenus.map((sub, si) => (

                                            <li key={si}>

                                                {sub.subMenus ? (
                                                    <>
                                                        <button
                                                            className="btn w-100 text-start sidebar-submenu"
                                                            onClick={() => toggleNested(i, si)}
                                                        >
                                                            {sub.icon} {sub.name}
                                                        </button>

                                                        <div className={`submenu ${openSubMenus[i]?.[si] ? "show" : ""}`}>

                                                            <ul
                                                                className="nav flex-column ms-3"
                                                                style={{
                                                                    borderLeft: "2px dotted #ff7a18",
                                                                }}
                                                            >

                                                                {sub.subMenus.map((ss, ssi) => (

                                                                    <li key={ssi}>

                                                                        <Link
                                                                            to={ss.path}
                                                                            className="nav-link sidebar-submenu"
                                                                            style={{
                                                                                ...(isPathActive(ss.path) && {
                                                                                    background: "rgba(255,122,24,0.12)",
                                                                                    fontWeight: "bold",
                                                                                }),
                                                                            }}
                                                                        >
                                                                            {ss.icon} {ss.name}
                                                                        </Link>

                                                                    </li>

                                                                ))}

                                                            </ul>

                                                        </div>
                                                    </>
                                                ) : (

                                                    <Link
                                                        to={sub.path}
                                                        className="nav-link sidebar-submenu"
                                                        style={{
                                                            ...(isPathActive(sub.path) && {
                                                                background: "rgba(255,122,24,0.12)",
                                                                fontWeight: "bold",
                                                            }),
                                                        }}
                                                    >
                                                        {sub.icon} {sub.name}
                                                    </Link>

                                                )}

                                            </li>

                                        ))}

                                    </ul>

                                </div>
                            </>
                        ) : (
                            <Link
                                to={menu.path}
                                className="nav-link sidebar-menu"
                                style={{
                                    background: "linear-gradient(90deg,#ff7a18,#ffb347)",
                                    color: "#fff",
                                    borderRadius: "8px",
                                    fontWeight: 600,
                                }}
                            >
                                {menu.icon} {menu.name}
                            </Link>
                        )}

                    </li>

                ))}

            </ul>

        </div>
    );
};

export default Sidebar;