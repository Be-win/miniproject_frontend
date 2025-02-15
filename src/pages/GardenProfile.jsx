import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import styles from "./styles/GardenProfile.module.css";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";

const GardenProfilePage = ({ user }) => {
    const { id } = useParams();
    const [garden, setGarden] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Dummy reviews data
    const dummyReviews = [
        {
            id: 1,
            user: "John Doe",
            rating: 4.5,
            comment: "This garden is amazing! So peaceful and well-maintained.",
            date: "2025-02-15",
        },
        {
            id: 2,
            user: "Jane Smith",
            rating: 5,
            comment: "Love the variety of plants and the friendly community.",
            date: "2025-02-16",
        },
        {
            id: 3,
            user: "Alice Johnson",
            rating: 4,
            comment: "Great place to relax and connect with nature.",
            date: "2025-02-17",
        },
    ];

    useEffect(() => {
        const fetchGardenDetails = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/garden/${id}`);
                if (!response.ok) {
                    throw new Error("Failed to fetch garden details.");
                }
                const data = await response.json();
                setGarden(data.data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchGardenDetails();
    }, [id]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    const allocated = parseFloat(garden.allocated_land);
    const total = parseFloat(garden.total_land);

    return (
        <div>
            <Navbar isLoggedIn={!!user} user={user}/>
            <div className={styles.gardenProfile}>
            {/* Map Section */}
            <div className={styles.mapContainer}>
                <MapContainer
                    center={[garden.latitude, garden.longitude]}
                    zoom={13}
                    className={styles.map}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <Marker position={[garden.latitude, garden.longitude]}>
                        <Popup>Garden Location</Popup>
                    </Marker>
                </MapContainer>
            </div>

            {/* Garden Details Section */}
            <div className={styles.gardenDetails}>
                <h1>{garden.name}</h1>
                <p>
                    <strong>Address:</strong> {garden.address}
                </p>
                <p>{garden.description}</p>
            </div>

            {/* Land Allocation Section */}
            <div className={styles.landAllocation}>
                <h2>Land Allocation</h2>
                <p>Allocated: {((allocated / total) * 100).toFixed(2)}%</p>
                <p>Remaining: {(((total - allocated) / total) * 100).toFixed(2)}%</p>
                <div className={styles.progressBar}>
                    <div
                        className={styles.progressAllocated}
                        style={{ width: `${(allocated / total) * 100}%` }}
                    ></div>
                    <div
                        className={styles.progressRemaining}
                        style={{ width: `${((total - allocated) / total) * 100}%` }}
                    ></div>
                </div>
                <button className={styles.requestLandButton}>Request Land</button>
            </div>

            {/* Garden Gallery Section */}
            <div className={styles.gardenGallery}>
                <h2>Gallery</h2>
                <div className={styles.imageGrid}>
                    {garden.images && garden.images.length > 0 ? (
                        garden.images.map((image) => (
                            <div key={image.id} className={styles.imageItem}>
                                <img src={image.image_url} alt={`Garden Image ${image.id}`} loading="lazy" />
                                <p>Uploaded on: {new Date(image.uploaded_at).toLocaleDateString()}</p>
                            </div>
                        ))
                    ) : (
                        <p>No images available.</p>
                    )}
                </div>
            </div>

            {/* Reviews Section */}
            <div className={styles.reviewsSection}>
                <h2>User Reviews</h2>
                {dummyReviews.length > 0 ? (
                    dummyReviews.map((review) => (
                        <div key={review.id} className={styles.reviewCard}>
                            <div className={styles.reviewHeader}>
                                <span className={styles.reviewUser}>{review.user}</span>
                                <span className={styles.reviewRating}>⭐ {review.rating}</span>
                            </div>
                            <p className={styles.reviewComment}>{review.comment}</p>
                            <p className={styles.reviewDate}>
                                Reviewed on: {new Date(review.date).toLocaleDateString()}
                            </p>
                        </div>
                    ))
                ) : (
                    <p>No reviews yet.</p>
                )}
            </div>
            </div>
            <Footer />
        </div>
    );
};

export default GardenProfilePage;