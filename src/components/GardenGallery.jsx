// import React from "react";
// import styles from "./styles/GardenGallery.module.css";
//
// const GardenGallery = ({ images }) => {
//     return (
//         <div className={styles.gardenGallery}>
//             <h2>Gallery</h2>
//             <div className={styles.imageGrid}>
//                 {images && images.length > 0 ? (
//                     images.map((image) => (
//                         <div key={image.id} className={styles.imageItem}>
//                             <img src={image.image_url} alt={`Garden Image ${image.id}`} loading="lazy" />
//                             <p>Uploaded on: {new Date(image.uploaded_at).toLocaleDateString()}</p>
//                         </div>
//                     ))
//                 ) : (
//                     <p>No images available.</p>
//                 )}
//             </div>
//         </div>
//     );
// };
//
// export default GardenGallery;
