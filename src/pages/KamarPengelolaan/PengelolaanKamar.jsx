import { useParams, useNavigate } from "react-router-dom";
import { usePengelolaanKamar } from "./hooks/usePengelolaanKamar";
import styles from "./PengelolaanKamar.module.css";
import TabProfilKamar from "./components/TabProfilKamar";
import TabSewa from "./components/TabSewa";
import TabTagihan from "./components/TabTagihan";
import TabKeluar from "./components/TabKeluar";

const PengelolaanKamar = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const props = usePengelolaanKamar(id);

    console.log("📋 PengelolaanKamar Page Loaded - ID:", id);
    console.log("📋 Kamar Data:", props.kamarData);
    console.log("📋 Loading Status:", { loadingKamar: props.loadingKamar });

    const handleBack = () => {
        navigate("/kamar");
    };

    return (
        <div className={styles.pageContainer}>
            {/* HEADER */}
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <button className={styles.backBtn} onClick={handleBack}>
                        ← Kembali
                    </button>
                    <div className={styles.headerInfo}>
                        <h2 className={styles.title}>Pengelolaan Kamar</h2>
                        <p className={styles.subtitle}>
                            {props.kamarData?.nama} • {props.kamarData?.properti?.nama}
                        </p>
                    </div>
                </div>
            </div>

            <div className={styles.container}>
                {/* TABS MENU */}
                <div className={styles.tabsMenu}>
                    <button
                        className={`${styles.tabBtn} ${
                            props.activeTab === "profil" ? styles.active : ""
                        }`}
                        onClick={() => props.setActiveTab("profil")}
                    >
                        <span className={styles.tabIcon}>👤</span>
                        Profil Kamar
                    </button>
                    <button
                        className={`${styles.tabBtn} ${
                            props.activeTab === "sewa" ? styles.active : ""
                        }`}
                        onClick={() => props.setActiveTab("sewa")}
                    >
                        <span className={styles.tabIcon}>📋</span>
                        Sewa
                    </button>
                    <button
                        className={`${styles.tabBtn} ${
                            props.activeTab === "tagihan" ? styles.active : ""
                        }`}
                        onClick={() => props.setActiveTab("tagihan")}
                    >
                        <span className={styles.tabIcon}>💰</span>
                        Tagihan
                    </button>
                    <button
                        className={`${styles.tabBtn} ${
                            props.activeTab === "keluar" ? styles.active : ""
                        }`}
                        onClick={() => props.setActiveTab("keluar")}
                    >
                        <span className={styles.tabIcon}>🚪</span>
                        Keluar
                    </button>
                </div>

                {/* TAB CONTENT */}
                <div className={styles.tabContent}>
                    {props.activeTab === "profil" && (
                        <TabProfilKamar
                            kamarData={props.kamarData}
                            formProfil={props.formProfil}
                            setFormProfil={props.setFormProfil}
                            onSave={props.handleSaveProfil}
                            loading={props.loadingKamar}
                        />
                    )}

                    {props.activeTab === "sewa" && (
                        <TabSewa
                            kamarData={props.kamarData}
                            sewaData={props.sewaData}
                            penyewaData={props.penyewaData}
                            formSewa={props.formSewa}
                            setFormSewa={props.setFormSewa}
                            penyewaList={props.penyewaList}
                            onSave={props.handleSaveSewa}
                            onDurasiChange={props.handleDurasiSewaChange}
                            onJumlahDurasiChange={props.handleJumlahDurasiChange}
                            loadingSewa={props.loadingSewa}
                            loadingPenyewa={props.loadingPenyewa}
                        />
                    )}

                    {props.activeTab === "tagihan" && (
                        <TabTagihan
                            tagihanList={props.tagihanList}
                            formPembayaran={props.formPembayaran}
                            setFormPembayaran={props.setFormPembayaran}
                            onSavePembayaran={props.handleSavePembayaran}
                            loading={props.loadingTagihan}
                        />
                    )}

                    {props.activeTab === "keluar" && (
                        <TabKeluar
                            kamarData={props.kamarData}
                            sewaData={props.sewaData}
                            penyewaData={props.penyewaData}
                            formKeluar={props.formKeluar}
                            setFormKeluar={props.setFormKeluar}
                            onSubmit={props.handleKeluar}
                            loadingSewa={props.loadingSewa}
                            savingKeluar={props.savingKeluar}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default PengelolaanKamar;
