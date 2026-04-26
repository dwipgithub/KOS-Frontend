import { useKamar } from "./hook/useKamar";
import KamarModal from "./components/KamarModal/KamarModal";
import KamarCard from "./components/KamarCard/KamarCard";

import PageLoading from "../../components/PageLoading/PageLoading";
import styles from "./Kamar.module.css";

const Kamar = () => {
    const props = useKamar();

    const formatAlamat = (card) => {
        return [
            card.alamat,
            card.kelurahan?.nama,
            card.kecamatan?.nama,
            card.kabKota?.nama,
            card.provinsi?.nama
        ]
        .filter(Boolean)
        .join(", ");
    };

    const isPropertiStep = !props.selectedProperti;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.title}>
                    {isPropertiStep
                        ? "Pilih Properti"
                        : `Kamar - ${props.selectedProperti.nama}`}
                </h2>
                {!isPropertiStep && (
                    <div className="d-flex gap-2">
                        <button
                            className={`btn btn-outline-secondary ${styles.backButton}`}
                            onClick={props.handleBackToProperti}
                        >
                            ← Kembali
                        </button>
                        <button
                            className={styles.addButton}
                            onClick={() => {
                                props.setForm((prev) => ({
                                    ...prev,
                                    idProperti: props.selectedProperti?.id || "",
                                }));
                                props.setShowModal(true);
                            }}
                        >
                            ➕ Tambah
                        </button>
                    </div>
                )}
            </div>
            {props.loading ? (
                <PageLoading
                    message={isPropertiStep ? "Memuat data properti…" : "Memuat data kamar…"}
                />
            ) : (
                <>
                    {props.error && (
                        <div className="alert alert-danger" role="alert">
                            {props.error}
                        </div>
                    )}

                    {isPropertiStep ? (
                        <>
                            {props.propertiList.length === 0 ? (
                                <div className="text-center text-muted mt-4">
                                    Data properti tidak ditemukan
                                </div>
                            ) : (
                                <div className="row">
                                    {props.propertiList.map((properti, idx) => (
                                        <div key={properti.id || idx} className="col-md-4 mb-4">
                                            <div
                                                className={styles.propertiCard}
                                                style={{ animationDelay: `${idx * 100}ms` }}
                                                onClick={() => props.handleSelectProperti(properti)}
                                            >
                                                <div className={styles.propertiHeader}>
                                                    <div className={styles.propertiIcon}>🏠</div>
                                                    <h3 className={styles.propertiTitle}>{properti.nama}</h3>
                                                </div>
                                                
                                                <div className={styles.propertiInfo}>
                                                    <div className={styles.infoItem}>
                                                        <span>{formatAlamat(properti)}</span>
                                                    </div>

                                                    <div className={styles.propertiInfoItem}>
                                                        <span>{properti.noTelp}</span>
                                                    </div>

                                                    <div className={styles.propertiInfoItem}>
                                                        <span className={styles.kamar}>
                                                            {properti.kamar?.length || 0} Kamar
                                                        </span>
                                                    </div>
                                                </div>


                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
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
                                    Data kamar tidak ditemukan
                                </div>
                            )}
                            <div className="row">
                                {props.filteredKamar.map((card, idx) => (
                                    <KamarCard key={card.id || idx} card={card} idx={idx} />
                                ))}
                            </div>
                        </>
                    )}
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