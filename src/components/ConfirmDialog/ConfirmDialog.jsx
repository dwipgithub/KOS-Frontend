import styles from "./ConfirmDialog.module.css";
import { AlertCircle, X } from "lucide-react";

const ConfirmDialog = ({
    show,
    onClose,
    title,
    message,
    confirmText,
    cancelText,
    onConfirm,
    isLoading,
    isDanger = false
}) => {
    if (!show) return null;

    const handleConfirm = async () => {
        if (onConfirm) {
            await onConfirm();
        }
        onClose();
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.dialog}>
                <div className={styles.header}>
                    <div className={`${styles.iconContainer} ${isDanger ? styles.danger : styles.info}`}>
                        <AlertCircle size={20} />
                    </div>
                    <h2 className={styles.title}>{title}</h2>
                    <button
                        className={styles.closeBtn}
                        onClick={onClose}
                        disabled={isLoading}
                        aria-label="Close"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className={styles.content}>
                    <p className={styles.message}>{message}</p>
                </div>

                <div className={styles.actions}>
                    <button
                        className={styles.btnCancel}
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        {cancelText || "Batal"}
                    </button>
                    <button
                        className={`${styles.btnConfirm} ${isDanger ? styles.danger : ""}`}
                        onClick={handleConfirm}
                        disabled={isLoading}
                    >
                        {isLoading ? "Proses..." : confirmText || "Konfirmasi"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
