import { useEffect, useState } from "react";
import styles from "./styles/GardenProfile.module.css";

const GardenersStats = ({ gardenId }) => {
    const [stats, setStats] = useState({ current: 0, total: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch(
                    `${import.meta.env.VITE_API_BASE_URL}/garden/${gardenId}/land_requests`
                );
                if (!response.ok) throw new Error("Failed to fetch gardener data");
                const requests = await response.json();

                const validStatuses = ['approved', 'active', 'pending_extension', 'expired'];
                const filteredRequests = requests.filter(request =>
                    ['approved', 'active', 'pending_extension', 'expired'].includes(request.status)
                );

                const currentGardeners = filteredRequests.filter(request =>
                    ['approved', 'active', 'pending_extension'].includes(request.status)
                ).length;

                const uniqueGardeners = new Set(
                    filteredRequests.map(request =>
                        request.user.name.toLowerCase().trim()
                    )
                ).size;

                setStats({
                    current: currentGardeners,
                    total: uniqueGardeners
                });
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [gardenId]);

    if (loading) return <div className={styles.loading}>Loading gardener stats...</div>;
    if (error) return <div className={styles.error}>{error}</div>;

    return (
        <div className={styles.gardenersStats}>
            <h3>Gardeners Information</h3>
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <span className={styles.statNumber}>{stats.current}</span>
                    <span className={styles.statLabel}>Current Gardeners</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statNumber}>{stats.total}</span>
                    <span className={styles.statLabel}>Total Gardeners</span>
                </div>
            </div>
            {/*<p className={styles.statNote}>
                Includes approved, active, and pending extension allocations (expired allocations count toward total)
            </p>*/}
        </div>
    );
};

export default GardenersStats;