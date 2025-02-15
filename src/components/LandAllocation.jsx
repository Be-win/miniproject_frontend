// import React from "react";
// import styles from "./styles/LandAllocation.module.css";
//
// const LandAllocation = ({ allocated, totalLand }) => {
//     const remaining = totalLand  - allocated;
//     const allocatedPercentage = totalLand > 0 ? (allocated / totalLand) * 100 : 0;
//     const remainingPercentage = 100 - allocatedPercentage;
//
//
//     return (
//         <div className={styles.landAllocation}>
//             <h2>Land Allocation</h2>
//             <p>Allocated: {allocatedPercentage}%</p>
//             <p>Remaining: {remainingPercentage}%</p>
//             <div className={styles.progressBar}>
//                 <div className={styles.progressAllocated} style={{ width: `${allocatedPercentage}%` }}></div>
//                 <div className={styles.progressRemaining} style={{ width: `${remainingPercentage}%` }}></div>
//             </div>
//         </div>
//     );
// };
//
// export default LandAllocation;
