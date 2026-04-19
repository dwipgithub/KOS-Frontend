import { useKamar } from "./hook/useKamar";
import KamarModal from "./components/KamarModal/KamarModal";
import KamarCard from "./components/KamarCard/KamarCard";

import PageLoading from "../../components/PageLoading/PageLoading";
import styles from "./Kamar.module.css";

const Kamar = () => {
    const props = useKamar();

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.title}>Kamar</h2>
                <button
                    className={styles.addButton}
                    onClick={() => props.setShowModal(true)}
                >
                    ➕
                </button>
            </div>
            {props.loading ? (
                <PageLoading message="Memuat data kamar…" />
            ) : (
                <>
                    <div className="mb-3">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Cari nama kamar..."
                            value={props.search}
                            onChange={(e) => props.setSearch(e.target.value)}
                        />
                    </div>
                    {props.filteredKamar.length === 0 && (
                        <div className="text-center text-muted mt-4">
                            Data tidak ditemukan
                        </div>
                    )}
                    <div className="row">
                        {props.filteredKamar.map((card, idx) => (
                            <KamarCard key={card.id || idx} card={card} idx={idx} />
                        ))}
                    </div>
                </>
            )}

            <KamarModal
                show={props.showModal}
                onClose={() => props.setShowModal(false)}
                form={props.form}
                setForm={props.setForm}
                propertiList={props.propertiList}
                statusKamarList={props.statusKamarList}
                onSave={props.handleSave}
            />  
        </div>
    );
};

export default Kamar;