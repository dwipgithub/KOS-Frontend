/**
 * EXAMPLE COMPONENTS - Permission-Based Conditional Rendering
 * 
 * File ini berisi contoh-contoh komponen yang menggunakan permission system
 * Gunakan sebagai reference untuk implementasi di komponen lainnya
 */

import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/auth/AuthContext";
import { canAccess, canAccessReport, getAccessStatus } from "../helpers/permissionHelper";

/**
 * EXAMPLE 1: Protected Menu Button Component
 * Render button hanya jika user punya permission
 */
export function ProtectedMenuButton({ to, icon, label, menuName, permissions }) {
    if (!canAccess(menuName, permissions)) {
        return null; // Tidak render jika tidak punya akses
    }

    return (
        <Link to={to} className="btn btn-primary">
            {icon} {label}
        </Link>
    );
}

// Penggunaan:
// <ProtectedMenuButton 
//   to="/properti" 
//   icon="🏠" 
//   label="Manage Properti"
//   menuName="properti"
//   permissions={permissions}
// />


/**
 * EXAMPLE 2: Permission Status Dashboard
 * Tampilkan status akses untuk semua menu
 */
export function PermissionStatusDashboard() {
    const { permissions, user } = useAuth();

    if (!permissions) {
        return <div className="alert alert-warning">Permissions not loaded</div>;
    }

    const accessStatus = getAccessStatus(permissions);

    return (
        <div className="card p-3">
            <h5>User: {user?.name} ({user?.role})</h5>
            
            <div className="mt-3">
                <h6>Menu Access Status:</h6>
                <ul>
                    <li>Properti: {accessStatus.properti ? "✅" : "❌"}</li>
                    <li>Kamar: {accessStatus.kamar ? "✅" : "❌"}</li>
                    <li>Penyewa: {accessStatus.penyewa ? "✅" : "❌"}</li>
                    <li>Pengeluaran: {accessStatus.pengeluaran ? "✅" : "❌"}</li>
                    <li>Laporan: {accessStatus.laporan ? "✅" : "❌"}</li>
                </ul>
            </div>

            <div className="mt-3">
                <h6>Report Access:</h6>
                <ul>
                    <li>Arus Kas: {accessStatus.laporan_detail.arus_kas ? "✅" : "❌"}</li>
                    <li>Laba Rugi: {accessStatus.laporan_detail.laba_rugi ? "✅" : "❌"}</li>
                    <li>Buku Besar: {accessStatus.laporan_detail.buku_besar ? "✅" : "❌"}</li>
                    <li>Piutang: {accessStatus.laporan_detail.piutang ? "✅" : "❌"}</li>
                </ul>
            </div>
        </div>
    );
}


/**
 * EXAMPLE 3: Conditional Menu Section
 * Render entire section based on permission
 */
export function PropertiSection() {
    const { permissions } = useAuth();

    // Jika tidak punya akses, return null
    if (!canAccess("properti", permissions)) {
        return null;
    }

    return (
        <section className="properti-section">
            <h3>🏠 Manajemen Properti</h3>
            <div className="properti-content">
                {/* Konten hanya render jika user punya akses */}
                <p>Daftar Properti Anda:</p>
                {/* ... list properti */}
            </div>
        </section>
    );
}


/**
 * EXAMPLE 4: Report Menu with Sub-Permission Check
 * Render report options hanya untuk yang accessible
 */
export function ReportMenuItems() {
    const { permissions } = useAuth();

    const reportItems = [
        { name: "Arus Kas", path: "/laporan-arus-kas", key: "arus_kas" },
        { name: "Laba Rugi", path: "/laporan-laba-rugi", key: "laba_rugi" },
        { name: "Buku Besar", path: "/laporan-buku-besar", key: "buku_besar" },
        { name: "Piutang", path: "/laporan-piutang", key: "piutang" },
    ];

    // Filter hanya report yang accessible
    const accessibleReports = reportItems.filter(report =>
        canAccessReport(report.key, permissions)
    );

    // Jika tidak ada laporan accessible, jangan render menu
    if (accessibleReports.length === 0) {
        return null;
    }

    return (
        <div className="report-menu">
            <h5>📊 Laporan Keuangan</h5>
            <ul>
                {accessibleReports.map(report => (
                    <li key={report.key}>
                        <Link to={report.path}>{report.name}</Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}


/**
 * EXAMPLE 5: Action Buttons based on Permission
 * Tampilkan berbagai buttons sesuai permission yang dimiliki
 */
export function ActionButtonsBar() {
    const { permissions } = useAuth();

    return (
        <div className="btn-group" role="group">
            {canAccess("properti", permissions) && (
                <button className="btn btn-outline-primary">
                    ➕ Tambah Properti
                </button>
            )}

            {canAccess("kamar", permissions) && (
                <button className="btn btn-outline-primary">
                    ➕ Tambah Kamar
                </button>
            )}

            {canAccess("penyewa", permissions) && (
                <button className="btn btn-outline-primary">
                    ➕ Tambah Penyewa
                </button>
            )}

            {canAccess("pengeluaran", permissions) && (
                <button className="btn btn-outline-primary">
                    ➕ Catat Pengeluaran
                </button>
            )}

            {canAccessReport("arus_kas", permissions) && (
                <button className="btn btn-outline-secondary">
                    📥 Export Arus Kas
                </button>
            )}
        </div>
    );
}


/**
 * EXAMPLE 6: Navigation Tabs based on Permissions
 * Render tabs hanya untuk menu yang accessible
 */
export function NavigationTabs() {
    const { permissions } = useAuth();

    const allTabs = [
        { label: "Properti", icon: "🏠", menuName: "properti", path: "/properti" },
        { label: "Kamar", icon: "🛏️", menuName: "kamar", path: "/kamar" },
        { label: "Penyewa", icon: "🧑‍💼", menuName: "penyewa", path: "/penyewa" },
        { label: "Pengeluaran", icon: "🧾", menuName: "pengeluaran", path: "/pengeluaran" },
    ];

    // Filter tabs berdasarkan permission
    const accessibleTabs = allTabs.filter(tab =>
        canAccess(tab.menuName, permissions)
    );

    return (
        <ul className="nav nav-tabs">
            {accessibleTabs.map(tab => (
                <li key={tab.menuName} className="nav-item">
                    <Link to={tab.path} className="nav-link">
                        {tab.icon} {tab.label}
                    </Link>
                </li>
            ))}
        </ul>
    );
}


/**
 * EXAMPLE 7: Feature Flag Component
 * Kombinasi permission untuk fitur-fitur tertentu
 */
export function FeatureFlagComponent() {
    const { permissions } = useAuth();

    // Feature: Hanya tampil jika user bisa akses properti DAN kamar
    const canManagePropertyKamar = 
        canAccess("properti", permissions) && 
        canAccess("kamar", permissions);

    // Feature: Hanya tampil jika user bisa akses MINIMAL 2 laporan
    const accessibleReportCount = [
        canAccessReport("arus_kas", permissions),
        canAccessReport("laba_rugi", permissions),
        canAccessReport("buku_besar", permissions),
        canAccessReport("piutang", permissions),
    ].filter(Boolean).length;

    const canAccessAdvancedReporting = accessibleReportCount >= 2;

    return (
        <div>
            {canManagePropertyKamar && (
                <div className="alert alert-info">
                    ✅ Fitur: Manajemen Properti & Kamar Aktif
                </div>
            )}

            {canAccessAdvancedReporting && (
                <div className="alert alert-info">
                    ✅ Fitur: Advanced Reporting Aktif ({accessibleReportCount} reports)
                </div>
            )}
        </div>
    );
}


/**
 * EXAMPLE 8: Unauthorized Access Message
 * Tampilkan pesan jika user tidak punya akses ke menu tertentu
 */
export function MenuAccessGuard({ menuName, children }) {
    const { permissions } = useAuth();

    if (!canAccess(menuName, permissions)) {
        return (
            <div className="alert alert-danger">
                <h5>🚫 Akses Ditolak</h5>
                <p>Anda tidak memiliki izin untuk mengakses menu ini.</p>
                <small>Hubungi administrator jika merasa ini adalah kesalahan.</small>
            </div>
        );
    }

    return <>{children}</>;
}

// Penggunaan:
// <MenuAccessGuard menuName="properti">
//   <PropertiPage />
// </MenuAccessGuard>


export default {
    ProtectedMenuButton,
    PermissionStatusDashboard,
    PropertiSection,
    ReportMenuItems,
    ActionButtonsBar,
    NavigationTabs,
    FeatureFlagComponent,
    MenuAccessGuard,
};
