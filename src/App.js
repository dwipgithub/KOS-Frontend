import { BrowserRouter, Route, Routes } from "react-router-dom"
import 'bootstrap/dist/css/bootstrap.min.css'
import LayoutAuth from "./components/LayoutAuth"
import LayoutMain from "./components/LayoutMain"
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProtectedRoute from "./routes/ProtectedRoute";
import AuthInitializer from "./context/auth/AuthInitializer"

function App() {
    return (
        <BrowserRouter basename="">
            <AuthInitializer>
                <Routes>
                    <Route path="/" element={<LayoutAuth/>} />
                    <Route path="/*" element={
                        <ProtectedRoute>
                            <LayoutMain/>
                        </ProtectedRoute>
                        }/>
                </Routes>
            </AuthInitializer>
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
            />
        </BrowserRouter>
    )
}

export default App;