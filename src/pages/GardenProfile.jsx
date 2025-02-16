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
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [landAmount, setLandAmount] = useState("");
    const [requestError, setRequestError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [contactInfo, setContactInfo] = useState("");
    const [message, setMessage] = useState("");

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

    const handleLandRequest = async (e) => {
        e.preventDefault();
        setRequestError("");
        const remainingLand = parseFloat(garden.total_land) - parseFloat(garden.allocated_land);

        if (!landAmount || landAmount <= 0 || landAmount > remainingLand) {
            setRequestError(`Please enter a valid amount between 0.01 and ${remainingLand}`);
            return;
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/garden/${garden.id}/requests`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({
                    requested_land: landAmount,
                    contact_info: contactInfo,
                    message: message,
                }),
            });

            if (!response.ok) throw new Error("Failed to submit land request");

            setSuccessMessage("Land request submitted successfully!");
            setTimeout(() => {
                setShowRequestModal(false);
                setSuccessMessage("");
            }, 3000);
        } catch (err) {
            setRequestError(err.message);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    const allocated = parseFloat(garden.allocated_land);
    const total = parseFloat(garden.total_land);
    const remainingLand = total - allocated;

    return (
        <div>
            <Navbar isLoggedIn={!!user} user={user} />

            {showRequestModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.requestModal}>
                        <h3>Request Land Allocation</h3>
                        <form onSubmit={handleLandRequest}>
                            <div className={styles.formGroup}>
                                <label htmlFor="landAmount">
                                    Amount Needed (Max: {remainingLand.toFixed(2)} units)
                                </label>
                                <input
                                    type="number"
                                    id="landAmount"
                                    step="0.01"
                                    min="0.01"
                                    max={remainingLand}
                                    value={landAmount}
                                    onChange={(e) => setLandAmount(e.target.value)}
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="contactInfo">
                                    Contact Information
                                </label>
                                <input
                                    type="text"
                                    id="contactInfo"
                                    value={contactInfo}
                                    onChange={(e) => setContactInfo(e.target.value)}
                                    placeholder="Email or phone number"
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="message">
                                    Message to Owner
                                </label>
                                <textarea
                                    id="message"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Explain your land use intentions"
                                    rows="4"
                                    required
                                />
                            </div>

                            {requestError && <p className={styles.error}>{requestError}</p>}
                            {successMessage && <p className={styles.success}>{successMessage}</p>}

                            <div className={styles.modalButtons}>
                                <button
                                    type="button"
                                    onClick={() => setShowRequestModal(false)}
                                    className={styles.cancelButton}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className={styles.submitButton}>
                                    Send Request
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className={styles.gardenProfile}>
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

                <div className={styles.gardenDetails}>
                    <h1>{garden.name}</h1>
                    <p>
                        <strong>Address:</strong> {garden.address}
                    </p>
                    <p>{garden.description}</p>
                </div>

                <div className={styles.landAllocation}>
                    <h2>Land Allocation</h2>
                    <p>Allocated: {((allocated / total) * 100).toFixed(2)}%</p>
                    <p>Remaining: {((remainingLand / total) * 100).toFixed(2)}%</p>
                    <div className={styles.progressBar}>
                        <div
                            className={styles.progressAllocated}
                            style={{ width: `${(allocated / total) * 100}%` }}
                        ></div>
                        <div
                            className={styles.progressRemaining}
                            style={{ width: `${(remainingLand / total) * 100}%` }}
                        ></div>
                    </div>
                    <button
                        className={styles.requestLandButton}
                        onClick={() => setShowRequestModal(true)}
                    >
                        Request Land
                    </button>
                </div>

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