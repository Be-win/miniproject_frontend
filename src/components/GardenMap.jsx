// import React from "react";
// import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
// import "leaflet/dist/leaflet.css";
// import styles from "./styles/GardenMap.module.css";
//
// const GardenMap = ({ longitude, latitude }) => {
//     // Safeguard: if coordinates are missing
//     if (longitude === undefined || latitude === undefined) {
//         return <p>Location data not available</p>;
//     }
//
//     return (
//         <MapContainer
//             center={[latitude, longitude]}
//             zoom={13}
//             className={styles.mapContainer}  // Apply the styled class here
//         >
//             <TileLayer
//                 url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//                 attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//             />
//             <Marker position={[latitude, longitude]}>
//                 <Popup>Garden Location</Popup>
//             </Marker>
//         </MapContainer>
//     );
// };
//
// export default GardenMap;
