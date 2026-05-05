import { useEffect, useState } from "react";
import { tokenUser } from "../../services/authService"
import { AuthContext } from "./AuthContext"

const AuthInitializer = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [permissions, setPermissions] = useState(null);
    const [token, setToken] = useState(null);

    useEffect(() => {
        const init = async () => {
            try {
                const res = await tokenUser();
                const userData = res.data.data;

                setToken(userData.access_token);
                setUser({
                    name: userData.name,
                    role: userData.role
                });
                setPermissions(userData.permissions || {});
            } catch (error) {
                console.error("Auth initialization error:", error);
                setToken(null);
                setUser(null);
                setPermissions(null);
            } finally {
                setLoading(false);
            }
        };

        init();
    }, []);

    const value = {
        token,
        setToken,
        user,
        setUser,
        permissions,
        setPermissions,
        loading,
        isAuthenticated: !!token && !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {loading ? (
                <div className="d-flex justify-content-center mt-5">
                    <div className="spinner-border text-warning" />
                </div>
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
};

export default AuthInitializer;