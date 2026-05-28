import { usePenyewa } from "./hook/usePenyewa";
import PenyewaModal from "./components/PenyewaModal/PenyewaModal";
import PenyewaCard from "./components/PenyewaCard/PenyewaCard";
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
                    ➕ Tambah
                </button>
            </div>
            {props.loading ? (
                <PageLoading message="Memuat data penyewa…" />
            ) : (
                <>
                    <div className="mb-3 d-flex justify-content-start gap-2">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Cari nama penyewa..."
                            value={props.search}
                            onChange={(e) => props.setSearch(e.target.value)}
                            style={{ width: "300px" }}
                        />

                        <button
                            className="btn btn-primary"
                            onClick={props.handleSearch}
                        >
                            🔍 Cari
                        </button>
                    </div>
                    {!props.hasSearched && (
                        <div className={styles.card}>
                            <div className="h-100 d-flex align-items-center justify-content-center text-center text-muted">
                                Silahkan ketik nama penyewa lalu klik tombol Cari
                            </div>
                        </div>
                    )}

                    {props.hasSearched && props.filteredPenyewa.length === 0 && (
                        <div className={styles.card}>
                            <div className="h-100 d-flex align-items-center justify-content-center text-center text-muted">
                                Data penyewa tidak ditemukan
                            </div>
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
                profesiList={props.profesiList}
                onSave={props.handleSave}
            />  
        </div>
    );
};

export default Penyewa;