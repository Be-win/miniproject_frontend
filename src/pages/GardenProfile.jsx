import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import GardenMap from "../components/GardenMap";
import GardenGallery from "../components/GardenGallery";
import LandAllocation from "../components/LandAllocation";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import styles from "./styles/GardenProfile.module.css"; // Import the CSS module

const GardenProfilePage = ({ user }) => {
    const { id } = useParams(); // Get the garden ID from the URL
    const [garden, setGarden] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchGardenDetails = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/garden/${id}`);
                if (!response.ok) {
                    throw new Error("Failed to fetch garden details.");
                }
                const data = await response.json();
                setGarden(data);
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

    // Calculate remaining land based on total and allocated values.
    const allocated = garden.allocated_land;
    const total = garden.total_land;

    return (
        <div>
            <Navbar isLoggedIn={!!user} user={user} />
            <div className={styles.gardenProfile}>
                <h1>{garden.name}</h1>
                <p>{garden.description}</p>
                <p>
                    <strong>Address:</strong> {garden.address}
                </p>

                {/* Ensure longitude and latitude are available before rendering the map */}
                {garden.longitude && garden.latitude ? (
                    <GardenMap longitude={garden.longitude} latitude={garden.latitude} />
                ) : (
                    <p>Location data not available</p>
                )}

                {/* Display the gallery of images */}
                <GardenGallery images={garden.images} />

                {/* Display land allocation */}
                <LandAllocation allocated={allocated} totalLand={total} />
            </div>
            <Footer />
        </div>
    );
};

export default GardenProfilePage;
