import styles from "./PageLoading.module.css";

const PageLoading = ({ message = "Memuat data…" }) => (
    <div className={styles.wrap} role="status" aria-live="polite" aria-busy="true">
        <div className={styles.spinner} aria-hidden />
        <p className={styles.text}>{message}</p>
    </div>
);

export default PageLoading;
