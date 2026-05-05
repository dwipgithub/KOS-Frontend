import { Navigate } from "react-router-dom";
import { useAuth } from "../context/auth/AuthContext";
import { canAccess, canAccessReport } from "../helpers/permissionHelper";

const resolvePermission = (permission, permissions) => {
    if (!permission || !permissions) {
        return false;
    }

    if (permission.startsWith("laporan_")) {
        return canAccessReport(permission.replace(/^laporan_/, ""), permissions);
    }

    return canAccess(permission, permissions);
};

const PermissionRoute = ({ permission, fallbackPath = "/beranda", children }) => {
    const { permissions, loading } = useAuth();

    if (loading) return null;

    if (!resolvePermission(permission, permissions)) {
        return <Navigate to={fallbackPath} replace />;
    }

    return children;
};

export default PermissionRoute;
