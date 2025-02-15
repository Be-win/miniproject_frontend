// @ts-ignore
import type React from "react";
import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import "./styles/GardenDirectory.css";
import {useNavigate} from "react-router-dom";

type Garden = {
    id: number;
    name: string;
    address: string;
    type: string;
    image_url: string;
};

type User = {
    id: number;
    name: string;
    email: string;
};

const GardenDirectoryPage: React.FC<{ user: User | null }> = ({ user }) => {
    const [gardens, setGardens] = useState<Garden[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedType, setSelectedType] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const navigate = useNavigate();

    const fetchGardens = async (
        pageNum: number,
        limit = 10,
        search: string,
        type: string
    ) => {
        try {
            setIsLoading(true);
            const params = new URLSearchParams({
                page: pageNum.toString(),
                limit: limit.toString(),
                ...(search && { search }),
                ...(type && { type }),
            });


            const response = await fetch(
                // @ts-ignore
                `${import.meta.env.VITE_API_BASE_URL}/garden?${params}`
            );

            if (!response.ok) throw new Error("Failed to fetch gardens");
            const data = await response.json();
            console.log(data);

            // Match the backend response structure
            return {
                gardens: data.data || [],
                hasMore: data.pagination?.hasMore || false,
            };
        } catch (err) {
            setError("Failed to fetch gardens. Please try again later.");
            return { gardens: [], hasMore: false };
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Reset to first page when filters change
        setPage(1);
        setGardens([]);
    }, [searchTerm, selectedType]);

    useEffect(() => {
        // Fetch gardens with current filters
        fetchGardens(page, 10, searchTerm, selectedType).then((response) => {
            setGardens((prev) =>
                page === 1 ? response.gardens : [...prev, ...response.gardens]
            );
            setHasMore(response.hasMore);
        });
    }, [page, searchTerm, selectedType]);

    useEffect(() => {
        const handleScroll = () => {
            const { scrollTop, clientHeight, scrollHeight } =
                document.documentElement;
            if (
                scrollHeight - (scrollTop + clientHeight) > 100 ||
                isLoading ||
                !hasMore
            )
                return;
            setPage((prev) => prev + 1);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [isLoading, hasMore]);

    return (
        <div className="garden-directory-container">
            <Navbar
                isLoggedIn={!!user}
                user={user}
                setUser={undefined}
                onLogout={undefined}
            />

            <div className="directory-content">
                {/* Search and Filter Section */}
                <div className="controls-section">
                    <input
                        type="text"
                        placeholder="Search gardens..."
                        className="search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <select
                        className="type-filter"
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                    >
                        <option value="">All Types</option>
                        <option value="community">Community</option>
                        <option value="rent">Rent</option>
                        <option value="charity">Charity</option>
                    </select>
                </div>

                {/* Gardens Grid */}
                <div className="gardens-grid">
                    {gardens.map((garden) => (
                        <div key={garden.id} className="garden-card" onClick={() => navigate(`gardenprofile/${garden.id}`)}>
                            <img
                                src={garden.image_url || "/default-garden.jpg"}
                                alt={garden.name}
                                className="garden-image"
                            />
                            <div className="card-content">
                                <h3 className="garden-name">{garden.name}</h3>
                                <p className="garden-address">{garden.address}</p>
                                <span className={`type-badge ${garden.type}`}>
                                    {garden.type}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Loading and Error States */}
                {isLoading && (
                    <div className="loading-indicator">Loading gardens...</div>
                )}
                {error && <div className="error-message">{error}</div>}


            </div>
            {/* Footer */}
            <Footer />
        </div>
    );
};

export default GardenDirectoryPage;