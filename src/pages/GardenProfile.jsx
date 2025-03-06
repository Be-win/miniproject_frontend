import React, {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {MapContainer, TileLayer, Marker, Popup} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import styles from "./styles/GardenProfile.module.css";
import AyurvedicCropSuggestions from "./AyurvedicCropSuggestions";
import GardenersStats from "./GardenerStats";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";

const GardenProfilePage = ({user}) => {
    const {id} = useParams();
    const [garden, setGarden] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [showExtensionModal, setShowExtensionModal] = useState(false);
    const [landAmount, setLandAmount] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [extensionEndDate, setExtensionEndDate] = useState("");
    const [requestError, setRequestError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [contactInfo, setContactInfo] = useState("");
    const [message, setMessage] = useState("");
    const [userAllocations, setUserAllocations] = useState([]);
    const [allocationsLoading, setAllocationsLoading] = useState(true);
    const [reviews, setReviews] = useState([]);
    const [newReview, setNewReview] = useState({ rating: 0, comment: '' });
    const [showAllReviews, setShowAllReviews] = useState(false);

    const userAllocation = userAllocations.find(a =>
        Number(a.garden_id) === Number(garden?.id)
    );
    const allocationStatus = userAllocation?.status || '';
    const hasAllocation = userAllocation &&
        ['approved', 'active', 'pending_extension'].includes(allocationStatus) &&
        userAllocation.end_date;

    // const dummyReviews = [
    //     {
    //         id: 1,
    //         user: "John Doe",
    //         rating: 4.5,
    //         comment: "This garden is amazing! So peaceful and well-maintained.",
    //         date: "2025-02-15",
    //     },
    //     {
    //         id: 2,
    //         user: "Jane Smith",
    //         rating: 5,
    //         comment: "Love the variety of plants and the friendly community.",
    //         date: "2025-02-16",
    //     },
    //     {
    //         id: 3,
    //         user: "Alice Johnson",
    //         rating: 4,
    //         comment: "Great place to relax and connect with nature.",
    //         date: "2025-02-17",
    //     },
    // ];

    // Fetch reviews
    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/reviews/garden/${id}`);
                const data = await response.json();
                setReviews(data);
            } catch (error) {
                console.error('Error fetching reviews:', error);
            }
        };
        fetchReviews();
    }, [id]);

    useEffect(() => {
        const fetchGardenDetails = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/garden/${id}`);
                if (!response.ok) throw new Error("Failed to fetch garden details.");
                const data = await response.json();
                setGarden(data.data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        const fetchUserAllocations = async () => {
            if (user) {
                try {
                    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/allocations`, {
                        headers: {Authorization: `Bearer ${localStorage.getItem("token")}`}
                    });
                    const data = await response.json();
                    setUserAllocations(data.data || []);
                } catch (error) {
                    console.error("Error fetching allocations:", error);
                } finally {
                    setAllocationsLoading(false);
                }
            }
        };

        fetchGardenDetails();
        fetchUserAllocations();
    }, [id, user]);

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({
                    garden_id: garden.id,
                    rating: newReview.rating,
                    comment: newReview.comment,
                }),
            });

            if (!response.ok) throw new Error('Failed to submit review');

            const data = await response.json();
            setReviews([data, ...reviews]);
            setNewReview({ rating: 0, comment: '' });
        } catch (error) {
            console.error('Review submission error:', error);
            alert(error.message);
        }
    };

    const handleLandRequest = async (e) => {
        e.preventDefault();
        setRequestError("");

        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/garden/${garden.id}/requests`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({
                    requested_land: parseFloat(landAmount),
                    contact_info: contactInfo,
                    message: message,
                    start_date: fromDate,
                    end_date: toDate
                })
            });

            const data = await response.json();

            if (!response.ok) {
                const errorMessage = data.error?.details?.join(', ') ||
                    data.error?.message ||
                    data.message ||
                    "Failed to submit land request";
                throw new Error(errorMessage);
            }

            setSuccessMessage("Land request submitted successfully!");
            setTimeout(() => {
                setShowRequestModal(false);
                window.location.reload();
            }, 3000);
        } catch (err) {
            setRequestError(err.message);
            console.error("Request error:", err);
        }
    };

    const handleExtensionRequest = async (e) => {
        e.preventDefault();
        setRequestError("");

        try {
            if (!userAllocation) throw new Error("No active allocation found");
            if (userAllocation.status === 'pending_extension') {
                throw new Error("Extension request already pending");
            }

            const newEndDate = new Date(extensionEndDate);
            const currentEndDate = new Date(userAllocation.end_date);
            if (newEndDate <= currentEndDate) {
                throw new Error("New end date must be after current end date");
            }

            const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/garden/requests/${userAllocation.id}/extend`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                    body: JSON.stringify({
                        end_date: extensionEndDate,
                        message: message
                    }),
                }
            );

            if (!response.ok) throw new Error("Failed to submit extension request");

            setSuccessMessage("Extension request submitted successfully!");
            setTimeout(() => {
                setShowExtensionModal(false);
                window.location.reload();
            }, 3000);
        } catch (err) {
            setRequestError(err.message);
        }
    };

    if (loading || allocationsLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!garden) return <div>Garden not found</div>;

    const allocated = parseFloat(garden.allocated_land);
    const total = parseFloat(garden.total_land);
    const remainingLand = total - allocated;
    const isOwner = user?.id === garden.owner_id;

    const hasReviewed = reviews.some(review => review.user_id === user?.id);

    return (
        <div>
            <Navbar isLoggedIn={!!user} user={user}/>

            {/* Request Land Modal */}
            {showRequestModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.requestModal}>
                        <h3>Request Land Allocation</h3>
                        <form onSubmit={handleLandRequest}>
                            <div className={styles.formGroup}>
                                <label>Amount Needed (Max: {remainingLand.toFixed(2)} units)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    max={remainingLand}
                                    value={landAmount}
                                    onChange={(e) => setLandAmount(e.target.value)}
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>From Date</label>
                                <input
                                    type="date"
                                    value={fromDate}
                                    onChange={(e) => setFromDate(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>To Date</label>
                                <input
                                    type="date"
                                    value={toDate}
                                    onChange={(e) => setToDate(e.target.value)}
                                    min={fromDate || new Date().toISOString().split('T')[0]}
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Contact Information</label>
                                <input
                                    type="text"
                                    value={contactInfo}
                                    onChange={(e) => setContactInfo(e.target.value)}
                                    placeholder="Email or phone number"
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Message to Owner</label>
                                <textarea
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

            {/* Extension Request Modal */}
            {showExtensionModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.requestModal}>
                        <h3>Request Allocation Extension</h3>
                        <form onSubmit={handleExtensionRequest}>
                            <div className={styles.formGroup}>
                                <label>New End Date</label>
                                <input
                                    type="date"
                                    value={extensionEndDate}
                                    min={new Date().toISOString().split('T')[0]}
                                    onChange={(e) => setExtensionEndDate(e.target.value)}
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Extension Reason</label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Explain why you need an extension"
                                    rows="4"
                                    required
                                />
                            </div>

                            {requestError && <p className={styles.error}>{requestError}</p>}
                            {successMessage && <p className={styles.success}>{successMessage}</p>}

                            <div className={styles.modalButtons}>
                                <button
                                    type="button"
                                    onClick={() => setShowExtensionModal(false)}
                                    className={styles.cancelButton}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className={styles.submitButton}>
                                    Request Extension
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className={styles.gardenProfileContainer}>
                {/* Map Section - Full width */}
                <div className={styles.mapSection}>
                    <MapContainer
                        center={[garden.latitude, garden.longitude]}
                        zoom={13}
                        className={styles.map}
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; OpenStreetMap contributors'
                        />
                        <Marker position={[garden.latitude, garden.longitude]}>
                            <Popup>Garden Location</Popup>
                        </Marker>
                    </MapContainer>
                </div>

                {/* Garden Info + Allocation Section */}
                <div className={styles.infoAllocationRow}>
                    {/* Garden Details */}
                    <div className={styles.gardenDetailsColumn}>
                        <h1>{garden.name}</h1>
                        <p className={styles.ownerName}>
                            Owned by: {garden.owner_name}
                        </p>
                        <p><strong>Address:</strong> {garden.address}</p>
                        <p>{garden.description}</p>

                        {/* Garden Features Section */}
                        <div className={styles.gardenFeatures}>
                            <h3>Garden Features</h3>
                            <div className={styles.featuresGrid}>
                                <div className={styles.featureItem}>
                                    <span className={styles.featureLabel}>Soil Type:</span>
                                    <span className={styles.featureValue}>{garden.soil_type}</span>
                                </div>
                                <div className={styles.featureItem}>
                                    <span className={styles.featureLabel}>Water Availability:</span>
                                    <span className={styles.featureValue}>
                                        {garden.irrigation ? "Available" : "Not Available"}
                                    </span>
                                </div>
                                <div className={styles.featureItem}>
                                    <span className={styles.featureLabel}>Electricity:</span>
                                    <span className={styles.featureValue}>
                                        {garden.electricity ? "Available" : "Not Available"}
                                    </span>
                                </div>
                                <div className={styles.featureItem}>
                                    <span className={styles.featureLabel}>Previous Crops:</span>
                                    <span className={styles.featureValue}>{garden.previous_crops}</span>
                                </div>
                                <div className={styles.featureItem}>
                                    <span className={styles.featureLabel}>Garden Type:</span>
                                    <span className={styles.featureValue}>{garden.type}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Land Allocation */}
                    <div className={styles.landAllocationColumn}>
                        <h2>Land Allocation</h2>
                        <p>Total: {total.toFixed(2)} units</p>
                        <p>Allocated: {allocated.toFixed(2)} units ({((allocated / total) * 100).toFixed(2)}%)</p>
                        <p>Remaining: {remainingLand.toFixed(2)} units</p>
                        <div className={styles.progressBar}>
                            <div
                                className={styles.progressAllocated}
                                style={{width: `${(allocated / total) * 100}%`}}
                            />
                        </div>

                        {!isOwner && (
                            <div className={styles.requestButtons}>
                                {remainingLand > 0 ? (
                                    <>
                                        <button
                                            className={styles.requestLandButton}
                                            onClick={() => setShowRequestModal(true)}
                                            disabled={hasAllocation && allocationStatus !== 'expired'}
                                        >
                                            {hasAllocation ? (
                                                allocationStatus === 'pending_extension' ? (
                                                    `Active until ${new Date(userAllocation.end_date).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}`
                                                ) : (
                                                    `Active until ${new Date(userAllocation.end_date).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}`
                                                )
                                            ) : "Request Land"}
                                        </button>

                                        {hasAllocation && allocationStatus === 'pending_extension' && (
                                            <p className={styles.pendingExtension}>
                                                Pending extension to: {new Date(
                                                userAllocation.proposed_end_date
                                            ).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                            </p>
                                        )}

                                        {hasAllocation && ['approved', 'active'].includes(allocationStatus) && (
                                            <button
                                                className={styles.extendButton}
                                                onClick={() => setShowExtensionModal(true)}
                                            >
                                                Request Extension
                                            </button>
                                        )}
                                    </>
                                ) : (
                                    <button className={styles.soldOutButton} disabled>
                                        Sold Out
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Gardeners Stats Section */}
                <div className={styles.gardenersStats}>
                    <GardenersStats gardenId={garden.id} />
                </div>

                {/* Gallery Section */}
                <div className={styles.gardenGallery}>
                    <h2>Gallery</h2>
                    <div className={styles.imageGrid}>
                        {garden.images && garden.images.length > 0 ? (
                            garden.images.map((image, index) => (
                                <div
                                    key={image.id}
                                    className={styles.imageItem}
                                    style={{ '--index': index }} // Add index for animation
                                >
                                    <img
                                        src={image.image_url}
                                        alt={`Garden Image ${image.id}`}
                                        loading="lazy"
                                    />
                                    <p>Uploaded on: {new Date(image.uploaded_at).toLocaleDateString()}</p>
                                </div>
                            ))
                        ) : (
                            <p>No images available.</p>
                        )}
                    </div>
                </div>

                {/* Ayurvedic Suggestions */}
                <div className={styles.ayurvedicSection}>
                    <AyurvedicCropSuggestions garden={garden}/>
                </div>

                {/* Reviews Section */}
                <div className={styles.reviewsSection}>
                    <h2>User Reviews</h2>

                    {/* Review Form */}
                    {user && userAllocation &&
                        ['approved', 'expired', 'active'].includes(allocationStatus) &&
                        !hasReviewed && (
                            <div className={styles.reviewForm}>
                                <h3>Write a Review</h3>
                                <form onSubmit={handleReviewSubmit}>
                                    <div className={styles.ratingInput}>
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                type="button"
                                                key={star}
                                                className={`${styles.star} ${newReview.rating >= star ? styles.filled : ''}`}
                                                onClick={() => setNewReview({ ...newReview, rating: star })}
                                            >
                                                ★
                                            </button>
                                        ))}
                                    </div>
                                    <textarea
                                        value={newReview.comment}
                                        onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                                        placeholder="Share your experience..."
                                        required
                                    />
                                    <button type="submit" className={styles.submitReviewButton}>
                                        Submit Review
                                    </button>
                                </form>
                            </div>
                        )}

                    {/* Reviews Grid */}
                    <div className={styles.reviewsGrid}>
                        {reviews.slice(0, 3).map((review) => (
                            <div key={review.id} className={styles.reviewCard}>
                                <div className={styles.reviewHeader}>
                                    <span className={styles.reviewUser}>{review.user_name}</span>
                                    <span className={styles.reviewRating}>⭐ {review.rating}</span>
                                </div>
                                <p className={styles.reviewComment}>{review.comment}</p>
                                <p className={styles.reviewDate}>
                                    Reviewed on: {new Date(review.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Show More Button */}
                    {reviews.length > 3 && (
                        <div className={styles.showMoreContainer}>
                            <button
                                className={styles.showMoreButton}
                                onClick={() => setShowAllReviews(true)}
                            >
                                Show All Reviews ({reviews.length})
                            </button>
                        </div>
                    )}

                    {/* All Reviews Modal */}
                    {showAllReviews && (
                        <div className={styles.reviewsModalOverlay} onClick={() => setShowAllReviews(false)}>
                            <div className={styles.reviewsModalContent} onClick={(e) => e.stopPropagation()}>
                                <div className={styles.reviewsModalHeader}>
                                    <h3>All Reviews</h3>
                                    <button
                                        className={styles.closeModalButton}
                                        onClick={() => setShowAllReviews(false)}
                                    >
                                        &times;
                                    </button>
                                </div>

                                <div className={styles.reviewsModalList}>
                                    {reviews.map((review) => (
                                        <div key={review.id} className={styles.reviewCard}>
                                            <div className={styles.reviewHeader}>
                                                <span className={styles.reviewUser}>{review.user_name}</span>
                                                <span className={styles.reviewRating}>⭐ {review.rating}</span>
                                            </div>
                                            <p className={styles.reviewComment}>{review.comment}</p>
                                            <p className={styles.reviewDate}>
                                                Reviewed on: {new Date(review.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

            </div>
            <Footer/>
        </div>
    );
};

export default GardenProfilePage;