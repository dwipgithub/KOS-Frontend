import { useProperti } from "./hook/useProperti";
import PropertiModal from "./components/PropertiModal/PropertiModal";
import PropertiCard from "./components/PropertiCard/PropertiCard";
import PageLoading from "../../components/PageLoading/PageLoading";
import styles from "./Properti.module.css";

const Properti = () => {
    const props = useProperti();

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.title}>Properti</h2>

                <button
                    onClick={() => props.setShowModal(true)}
                    className={styles.addButton}
                >
                    ➕
                </button>
            </div>

            {props.loading ? (
                <PageLoading message="Memuat data properti…" />
            ) : (
                <>
                    <div className={styles.search}>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Cari nama properti..."
                            value={props.search}
                            onChange={(e) => props.setSearch(e.target.value)}
                        />
                    </div>

                    {props.filteredProperti.length === 0 && (
                        <div className={styles.empty}>
                            Data tidak ditemukan
                        </div>
                    )}
                    <div className="row">
                        {props.filteredProperti.map((card, idx) => (
                            <PropertiCard key={card.id || idx} card={card} index={idx} />
                        ))}
                    </div>
                </>
            )}

            <PropertiModal
                show={props.showModal}
                onClose={() => props.setShowModal(false)}
                form={props.form}
                setForm={props.setForm}
                provinsiList={props.provinsiList}
                kabKotaList={props.kabKotaList}
                kecamatanList={props.kecamatanList}
                kelurahanList={props.kelurahanList}
                onSave={props.handleSave}
            />
        </div>
    );
};

export default Properti;
