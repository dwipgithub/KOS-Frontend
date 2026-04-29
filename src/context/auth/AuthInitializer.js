import { useEffect, useState } from "react";
import { tokenUser } from "../../services/authService"
import { AuthContext } from "./AuthContext"

const AuthInitializer = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(null);

    useEffect(() => {
        const init = async () => {
            try {
                const res = await tokenUser();
                const newToken = res.data.data.access_token;

                setToken(newToken);
            } catch {
                setToken(null);
            } finally {
                setLoading(false);
            }
        };

        init();
    }, []);

    return (
        <AuthContext.Provider value={{ token, setToken, loading }}>
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