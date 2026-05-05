/**
 * DOKUMENTASI: IMPLEMENTASI PERMISSION-BASED SIDEBAR
 * 
 * Sistem membatasi tampilan menu sidebar berdasarkan permissions 
 * dari response login (authService).
 * 
 * ============================================================================
 * STRUKTUR DATA PERMISSIONS (dari Response Login)
 * ============================================================================
 * 
 * {
 *   "name": "Dwi Prihantono",
 *   "role": "OPERATOR",
 *   "permissions": {
 *     "properti": true,
 *     "kamar": true,
 *     "penyewa": true,
 *     "pengeluaran": true,
 *     "laporan": {
 *       "arus_kas": false,
 *       "laba_rugi": false,
 *       "buku_besar": false,
 *       "piutang": false
 *     }
 *   },
 *   "access_token": "..."
 * }
 * 
 * ============================================================================
 * WORKFLOW ALUR DATA
 * ============================================================================
 * 
 * 1. LOGIN PAGE (src/pages/Login/Login.js)
 *    └─> loginUser(email, password) dari authService
 *        ├─> setToken(userData.access_token)
 *        ├─> setUser({ name, role })
 *        └─> setPermissions(userData.permissions)
 *
 * 2. AUTH CONTEXT (src/context/auth/AuthContext.js)
 *    └─> useAuth() hook return { token, user, permissions, ... }
 *
 * 3. SIDEBAR COMPONENT (src/components/Sidebar.js)
 *    ├─> const { permissions } = useAuth()
 *    ├─> menus filter berdasarkan permissions
 *    └─> conditional rendering hanya menu yang accessible
 *
 * ============================================================================
 * HELPER FUNCTIONS (src/helpers/permissionHelper.js)
 * ============================================================================
 * 
 * 1. canAccess(menuName, permissions)
 *    Cek apakah user bisa akses menu utama
 *    
 *    Contoh:
 *    - canAccess('properti', permissions) → true/false
 *    - canAccess('kamar', permissions) → true/false
 *    - canAccess('laporan', permissions) → true jika ada minimal 1 laporan accessible
 * 
 * 
 * 2. canAccessReport(subMenuName, permissions)
 *    Cek apakah user bisa akses submenu laporan
 *    
 *    Contoh:
 *    - canAccessReport('arus_kas', permissions) → true/false
 *    - canAccessReport('laba_rugi', permissions) → true/false
 * 
 * 
 * 3. canAccessAnyReport(permissions)
 *    Cek apakah user punya akses ke minimal satu laporan
 *    
 *    Contoh:
 *    - canAccessAnyReport(permissions) → true jika ada minimal 1 laporan === true
 * 
 * 
 * 4. filterMenusByPermissions(menus, permissions)
 *    Filter seluruh array menus berdasarkan permissions
 *    
 *    Contoh:
 *    - const filteredMenus = filterMenusByPermissions(allMenus, permissions)
 * 
 * 
 * 5. getAccessStatus(permissions)
 *    Get status akses untuk semua menu dalam satu object
 *    
 *    Contoh:
 *    - const status = getAccessStatus(permissions)
 *    - status.properti → true/false
 *    - status.laporan_detail.arus_kas → true/false
 * 
 * ============================================================================
 * CONTOH PENGGUNAAN DI KOMPONEN LAIN
 * ============================================================================
 * 
 * CONTOH 1: Simple Permission Check
 * ---------------------------------
 * import { useAuth } from '../context/auth/AuthContext';
 * import { canAccess } from '../helpers/permissionHelper';
 * 
 * function MyComponent() {
 *   const { permissions } = useAuth();
 *   
 *   if (canAccess('properti', permissions)) {
 *     return <div>User bisa akses Properti</div>;
 *   }
 *   
 *   return <div>User tidak punya akses</div>;
 * }
 * 
 * 
 * CONTOH 2: Conditional Render Button
 * -----------------------------------
 * function AdminPanel() {
 *   const { permissions } = useAuth();
 *   
 *   return (
 *     <div>
 *       {canAccess('properti', permissions) && (
 *         <button>Manage Properti</button>
 *       )}
 *       
 *       {canAccessReport('laporan_arus_kas', permissions) && (
 *         <button>View Arus Kas Report</button>
 *       )}
 *     </div>
 *   );
 * }
 * 
 * 
 * CONTOH 3: Protected Menu Navigation
 * -----------------------------------
 * function ProtectedLink({ to, children, menuName }) {
 *   const { permissions } = useAuth();
 *   
 *   if (!canAccess(menuName, permissions)) {
 *     return null; // Tidak render jika tidak punya akses
 *   }
 *   
 *   return <Link to={to}>{children}</Link>;
 * }
 * 
 * <ProtectedLink to="/properti" menuName="properti">
 *   Manage Properti
 * </ProtectedLink>
 * 
 * 
 * CONTOH 4: Permission Status Check
 * --------------------------------
 * import { getAccessStatus } from '../helpers/permissionHelper';
 * 
 * function AccessDashboard() {
 *   const { permissions } = useAuth();
 *   const access = getAccessStatus(permissions);
 *   
 *   return (
 *     <div>
 *       <p>Properti: {access.properti ? '✅ Accessible' : '❌ Blocked'}</p>
 *       <p>Kamar: {access.kamar ? '✅ Accessible' : '❌ Blocked'}</p>
 *       <p>Laporan Arus Kas: {access.laporan_detail.arus_kas ? '✅ Accessible' : '❌ Blocked'}</p>
 *     </div>
 *   );
 * }
 * 
 * ============================================================================
 * ATURAN TAMPILAN MENU
 * ============================================================================
 * 
 * 1. Menu Properti → Hanya tampil jika permissions.properti === true
 * 2. Menu Kamar → Hanya tampil jika permissions.kamar === true
 * 3. Menu Penyewa → Hanya tampil jika permissions.penyewa === true
 * 4. Menu Pengeluaran → Hanya tampil jika permissions.pengeluaran === true
 * 
 * 5. Menu Laporan Keuangan → Hanya tampil jika minimal 1 submenu laporan === true
 *    - Submenu Arus Kas → Hanya tampil jika permissions.laporan.arus_kas === true
 *    - Submenu Laba Rugi → Hanya tampil jika permissions.laporan.laba_rugi === true
 *    - Submenu Buku Besar → Hanya tampil jika permissions.laporan.buku_besar === true
 *    - Submenu Piutang → Hanya tampil jika permissions.laporan.piutang === true
 * 
 * ============================================================================
 * SAFETY FEATURES
 * ============================================================================
 * 
 * ✅ Null/undefined permissions handling
 *    - Jika permissions null/undefined → tidak tampil menu apapun (safe default)
 * 
 * ✅ No hardcoded roles
 *    - Semua permission check berdasarkan permissions object
 *    - Role hanya untuk informasi, bukan untuk authorization
 * 
 * ✅ Type checking
 *    - Validasi bahwa permissions adalah object
 *    - Validasi bahwa permissions.laporan adalah object
 * 
 * ✅ Error boundary
 *    - useAuth() throw error jika digunakan di luar AuthProvider
 *    - Memaksa proper context usage
 * 
 * ============================================================================
 * TESTING SCENARIOS
 * ============================================================================
 * 
 * Test Case 1: Operator Role
 * Permissions: { properti: true, kamar: true, penyewa: true, pengeluaran: true, laporan: {...} }
 * Result: Semua menu utama visible, laporan visible hanya jika minimal 1 true
 * 
 * Test Case 2: Limited Access
 * Permissions: { properti: true, kamar: false, penyewa: false, pengeluaran: false, laporan: {...} }
 * Result: Hanya menu Properti visible
 * 
 * Test Case 3: No Laporan Access
 * Permissions: { laporan: { arus_kas: false, laba_rugi: false, buku_besar: false, piutang: false } }
 * Result: Menu Laporan Keuangan tidak visible (semua submenu false)
 * 
 * Test Case 4: Partial Laporan Access
 * Permissions: { laporan: { arus_kas: true, laba_rugi: false, buku_besar: true, piutang: false } }
 * Result: Menu Laporan Keuangan visible dengan submenu Arus Kas dan Buku Besar saja
 * 
 * ============================================================================
 */
