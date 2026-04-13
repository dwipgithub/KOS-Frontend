import { usePenyewa } from "./hook/usePenyewa";
import PenyewaModal from "../../components/PenyewaModal/PenyewaModal";
import PenyewaCard from "../../components/PenyewaCard/PenyewaCard";
import PageLoading from "../../components/PageLoading/PageLoading";
import styles from "./Penyewa.module.css";

const Penyewa = () => {
    const props = usePenyewa();

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.title}>Penyewa</h2>
                <button
                    className={styles.addButton}
                    onClick={() => props.setShowModal(true)}
                >
                    ➕
                </button>
            </div>
            {props.loading ? (
                <PageLoading message="Memuat data penyewa…" />
            ) : (
                <>
                    <div className="mb-3">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Cari nama penyewa..."
                            value={props.search}
                            onChange={(e) => props.setSearch(e.target.value)}
                        />
                    </div>
                    {props.filteredPenyewa.length === 0 && (
                        <div className="text-center text-muted mt-4">
                            Data tidak ditemukan
                        </div>
                    )}
                    <div className="row">
                        {props.filteredPenyewa.map((penyewa, idx) => (
                            <PenyewaCard key={penyewa.id || idx} card={penyewa} index={idx} />
                        ))}
                    </div>
                </>
            )}

            <PenyewaModal
                show={props.showModal}
                onClose={props.closeModal}
                form={props.form}
                setForm={props.setForm}
                jenisKelaminList={props.jenisKelaminList}
                statusPernikahanList={props.statusPernikahanList}
                pengenalList={props.pengenalList}
                onSave={props.handleSave}
            />  
        </div>
    );
};

export default Penyewa;