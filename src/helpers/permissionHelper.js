/**
 * Helper functions untuk mengecek permissions
 * Digunakan untuk conditional rendering di UI
 */

/**
 * Cek apakah user memiliki akses ke menu utama
 * @param {string} menuName - Nama menu: 'properti', 'kamar', 'penyewa', 'pengeluaran', 'laporan'
 * @param {object} permissions - Object permissions dari response login
 * @returns {boolean}
 */
export const canAccess = (menuName, permissions) => {
    if (!permissions || typeof permissions !== 'object') {
        return false;
    }

    // Untuk menu utama yang bukan laporan
    if (menuName === 'properti' || menuName === 'kamar' || menuName === 'penyewa' || menuName === 'pengeluaran') {
        return permissions[menuName] === true;
    }

    // Untuk menu laporan, cek jika ada minimal satu submenu yang true
    if (menuName === 'laporan') {
        return canAccessAnyReport(permissions);
    }

    return false;
};

/**
 * Cek apakah user memiliki akses ke submenu laporan
 * @param {string} subMenuName - Nama submenu: 'arus_kas', 'laba_rugi', 'buku_besar', 'piutang'
 * @param {object} permissions - Object permissions dari response login
 * @returns {boolean}
 */
export const canAccessReport = (subMenuName, permissions) => {
    if (!permissions?.laporan || typeof permissions.laporan !== 'object') {
        return false;
    }

    return permissions.laporan[subMenuName] === true;
};

/**
 * Cek apakah user memiliki akses ke minimal satu submenu laporan
 * @param {object} permissions - Object permissions dari response login
 * @returns {boolean}
 */
export const canAccessAnyReport = (permissions) => {
    if (!permissions?.laporan || typeof permissions.laporan !== 'object') {
        return false;
    }

    return Object.values(permissions.laporan).some(hasAccess => hasAccess === true);
};

/**
 * Filter menus berdasarkan permissions
 * @param {array} menus - Array of menu items
 * @param {object} permissions - Object permissions dari response login
 * @returns {array} - Filtered menus
 */
export const filterMenusByPermissions = (menus, permissions) => {
    if (!permissions || typeof permissions !== 'object') {
        return [];
    }

    return menus
        .map(menu => {
            // Jika menu punya subMenus (seperti Laporan Keuangan)
            if (menu.subMenus) {
                // Filter subMenus berdasarkan permissions
                const filteredSubMenus = menu.subMenus.filter(sub => {
                    const subMenuKey = sub.name
                        .toLowerCase()
                        .replace(/\s+/g, '_')
                        .replace('arus_kas', 'arus_kas')
                        .replace('laba_rugi', 'laba_rugi')
                        .replace('buku_besar', 'buku_besar');

                    return canAccessReport(subMenuKey, permissions);
                });

                // Return menu hanya jika ada subMenus yang accessible
                return filteredSubMenus.length > 0
                    ? { ...menu, subMenus: filteredSubMenus }
                    : null;
            }

            // Untuk menu utama (tidak ada subMenus)
            const menuKey = menu.name.toLowerCase();
            return canAccess(menuKey, permissions) ? menu : null;
        })
        .filter(Boolean); // Remove null values
};

/**
 * Get permission status untuk semua menu items
 * @param {object} permissions - Object permissions dari response login
 * @returns {object} - Object dengan status akses setiap menu
 */
export const getAccessStatus = (permissions) => {
    if (!permissions || typeof permissions !== 'object') {
        return {
            properti: false,
            kamar: false,
            penyewa: false,
            pengeluaran: false,
            laporan: false,
            laporan_detail: {
                arus_kas: false,
                laba_rugi: false,
                buku_besar: false,
                piutang: false
            }
        };
    }

    return {
        properti: permissions.properti === true,
        kamar: permissions.kamar === true,
        penyewa: permissions.penyewa === true,
        pengeluaran: permissions.pengeluaran === true,
        laporan: canAccessAnyReport(permissions),
        laporan_detail: {
            arus_kas: canAccessReport('arus_kas', permissions),
            laba_rugi: canAccessReport('laba_rugi', permissions),
            buku_besar: canAccessReport('buku_besar', permissions),
            piutang: canAccessReport('piutang', permissions)
        }
    };
};
