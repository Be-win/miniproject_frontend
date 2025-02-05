import React from "react";

const LandAllocation = ({ allocated, remaining }) => {
    // Ensure values are within 0 to 100 for display purposes
    const allocatedPercentage = Math.min(Math.max(allocated, 0), 100);
    const remainingPercentage = Math.min(Math.max(remaining, 0), 100);

    return (
        <div className={styles.landAllocation}>
            <h2>Land Allocation</h2>
            <p>Allocated: {allocatedPercentage}%</p>
            <p>Remaining: {remainingPercentage}%</p>
            <div className={styles.progressBar}>
                <div className={styles.progressAllocated} style={{ width: `${allocatedPercentage}%` }}></div>
                <div className={styles.progressRemaining} style={{ width: `${remainingPercentage}%` }}></div>
            </div>
        </div>
    );
};

export default LandAllocation;
