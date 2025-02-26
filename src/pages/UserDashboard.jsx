import React, {useState, useEffect} from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import axios from 'axios';
import styles from './styles/UserDashboard.module.css';

const UserDashboard = ({user}) => {
    const [selectedTab, setSelectedTab] = useState('gardens');
    const [selectedGarden, setSelectedGarden] = useState(null);
    const [gardens, setGardens] = useState([]);
    const [landRequests, setLandRequests] = useState([]);
    const [resources, setResources] = useState([]);
    const [resourceRequests, setResourceRequests] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [gardensRes, requestsRes, resourcesRes, resourceReqRes] = await Promise.all([
                    axios.get(`${import.meta.env.VITE_API_BASE_URL}/garden?owner_id=${user.id}`),
                    axios.get(`${import.meta.env.VITE_API_BASE_URL}/users/allocations`, {
                        headers: {Authorization: `Bearer ${localStorage.getItem("token")}`}
                    }),
                    axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/resources?filter=myPosts`, {
                        headers: {Authorization: `Bearer ${localStorage.getItem("token")}`}
                    }),
                    axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/resources/requests`, {
                        headers: {Authorization: `Bearer ${localStorage.getItem("token")}`}
                    }),
                ]);
                setGardens(gardensRes.data.data);
                setLandRequests(requestsRes.data.data);
                setResources(resourcesRes.data);
                setResourceRequests(resourceReqRes.data);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            }
        };

        if (user) fetchData();
    }, [user]);

    const renderContent = () => {
        switch (selectedTab) {
            case 'land-requests':
                return <LandRequestsList requests={landRequests}/>;
            case 'resources':
                return <ResourcesList resources={resources} resourceRequests={resourceRequests}/>;
            case 'gardens':
            default:
                return selectedGarden ? (
                    <GardenDetails
                        garden={selectedGarden}
                        onBack={() => setSelectedGarden(null)}
                    />
                ) : (
                    <GardensList
                        gardens={gardens}
                        onSelect={setSelectedGarden}
                    />
                );
        }
    };

    return (
        <div className={styles.container}>
            <Navbar isLoggedIn={!!user} user={user}/>
            <div className={styles.content}>
                <div className={styles.sidebar}>
                    <button
                        onClick={() => setSelectedTab('gardens')}
                        className={`${styles.sidebarButton} ${
                            selectedTab === 'gardens' ? styles.sidebarButtonActive : ''
                        }`}
                    >
                        My Gardens
                    </button>
                    <button
                        onClick={() => setSelectedTab('land-requests')}
                        className={`${styles.sidebarButton} ${
                            selectedTab === 'land-requests' ? styles.sidebarButtonActive : ''
                        }`}
                    >
                        My Land Requests
                    </button>
                    <button
                        onClick={() => setSelectedTab('resources')}
                        className={`${styles.sidebarButton} ${
                            selectedTab === 'resources' ? styles.sidebarButtonActive : ''
                        }`}
                    >
                        Resources
                    </button>
                </div>
                <div className={styles.main}>
                    {renderContent()}
                </div>
            </div>
            <Footer/>
        </div>
    );
};

const GardensList = ({ gardens, onSelect }) => (
    <div className={styles.gardensList}>
        <h2>Your Gardens</h2>
        {gardens.length === 0 ? (
            <div className={styles.card}>
                <p className={styles.mutedText}>No gardens found. Create your first garden to get started!</p>
            </div>
        ) : (
            <div className={styles.gardenList}>
                {gardens.map(garden => (
                    <div
                        key={garden.id}
                        className={styles.gardenBarCard}
                        onClick={() => onSelect(garden)}
                    >
                        <div className={styles.gardenBarImage}>
                            <img
                                src={garden.image_url}
                                alt={garden.name}
                                onError={(e) => {
                                    e.target.src = '/placeholder-garden.jpg';
                                }}
                            />
                        </div>
                        <div className={styles.gardenBarDetails}>
                            <div className={styles.gardenBarHeader}>
                                <h3 className={styles.gardenBarTitle}>{garden.name}</h3>
                                <span className={`${styles.gardenTypeBadge} ${
                                    garden.type === 'community' ? styles.gardenTypeCommunity : styles.gardenTypeRent
                                }`}>
                                    {garden.type}
                                </span>
                            </div>
                            <div className={styles.gardenBarMeta}>
                                <p className={styles.gardenAddress}>
                                    <span>📍</span>
                                    {garden.address}
                                </p>
                                <div className={styles.gardenLandStats}>
                                    <div className={styles.gardenLandStat}>
                                        <span className={styles.landStatLabel}>Total</span>
                                        <span className={styles.landStatValue}>{garden.total_land} units</span>
                                    </div>
                                    <div className={styles.gardenLandStat}>
                                        <span className={styles.landStatLabel}>Allocated</span>
                                        <span className={styles.landStatValue}>{garden.allocated_land} units</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
);

const GardenDetails = ({ garden, onBack }) => {
    const [requests, setRequests] = useState([]);

    const fetchGardenDetails = async () => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL}/garden/${garden.id}/land_requests`
            );
            setRequests(response.data);
        } catch (error) {
            console.error('Error fetching garden details:', error);
        }
    };

    useEffect(() => { fetchGardenDetails(); }, [garden.id]);

    const volunteers = requests.filter(request => ['approved', 'active'].includes(request.status));
    const activeRequests = requests.filter(request => ['pending', 'pending_extension'].includes(request.status));
    const expiredRequests = requests.filter(request => request.status === 'expired');

    const handleUpdateRequest = async (request, newStatus) => {
        const endpoint = request.status === 'pending_extension'
            ? `${import.meta.env.VITE_API_BASE_URL}/garden/requests/${request.id}/extend`
            : `${import.meta.env.VITE_API_BASE_URL}/garden/requests/${request.id}`;

        try {
            await axios.patch(endpoint, { status: newStatus }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            fetchGardenDetails();
        } catch (error) {
            console.error('Error updating request:', error);
        }
    };

    return (
        <div className={styles.gardenDetails}>
            <button onClick={onBack} className={styles.gardenBackButton}>
                ← Back to Gardens
            </button>
            <h2>{garden.name}</h2>

            <div className={styles.detailsSection}>
                <h3>⏳ Active Requests</h3>
                {activeRequests.length === 0 ? (
                    <div className={styles.card}>
                        <p className={styles.mutedText}>No active requests for this garden</p>
                    </div>
                ) : (
                    activeRequests.map(request => (
                        <div key={request.id} className={styles.requestCard}>
                            <div className={styles.userHeader}>
                                <span className={styles.userAvatar}>👤</span>
                                <h4>{request.user.name}</h4>
                            </div>
                            <div className={styles.detailGrid}>
                                <div className={styles.detailRow}>
                                    <span className={styles.detailLabel}>Requested Land:</span>
                                    <span>{request.requested_land} units</span>
                                </div>
                                <div className={styles.detailRow}>
                                    <span className={styles.detailLabel}>Duration:</span>
                                    <span>
                                        {new Date(request.start_date).toLocaleDateString()} –
                                        {new Date(request.end_date).toLocaleDateString()}
                                    </span>
                                </div>
                                {/* Add these new rows */}
                                <div className={styles.detailRow}>
                                    <span className={styles.detailLabel}>Contact Info:</span>
                                    <span>{request.contact_info}</span>
                                </div>
                                <div className={styles.detailRow}>
                                    <span className={styles.detailLabel}>Message:</span>
                                    <span>{request.message}</span>
                                </div>
                                <div className={styles.detailRow}>
                                    <span className={styles.detailLabel}>Status:</span>
                                    <span className={`${styles.statusBadge} ${
                                        request.status === 'pending' ? styles.statusPending :
                                            request.status === 'pending_extension' ? styles.statusPending :
                                                styles.statusApproved
                                    }`}>
                                        {request.status}
                                    </span>
                                </div>
                            </div>
                            <div className={styles.actionButtonGroup}>
                                <button
                                    className={styles.buttonApprove}
                                    onClick={() => handleUpdateRequest(request, 'approved')}
                                >
                                    Approve
                                </button>
                                <button
                                    className={styles.buttonReject}
                                    onClick={() => handleUpdateRequest(request, 'rejected')}
                                >
                                    Reject
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className={styles.detailsSection}>
                <h3>👩🌾 Current Gardeners</h3>
                {volunteers.length === 0 ? (
                    <div className={styles.card}>
                        <p className={styles.mutedText}>No active volunteers for this garden</p>
                    </div>
                ) : (
                    volunteers.map(request => (
                        <div key={request.id} className={styles.requestCard}>
                            <div className={styles.userHeader}>
                                <span className={styles.userAvatar}>👤</span>
                                <div>
                                    <h4>{request.user.name}</h4>
                                    <p className={styles.smallText}>
                                        Joined {new Date(request.start_date).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <div className={styles.detailGrid}>
                                <div className={styles.detailRow}>
                                    <span className={styles.detailLabel}>Allocated Land:</span>
                                    <span>{request.requested_land} units</span>
                                </div>
                                <div className={styles.detailRow}>
                                    <span className={styles.detailLabel}>Status:</span>
                                    <span className={`${styles.statusBadge} ${styles.statusApproved}`}>
                                        {request.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className={styles.detailsSection}>
                <h3>📅 Previous Allocations</h3>
                {expiredRequests.length === 0 ? (
                    <div className={styles.card}>
                        <p className={styles.mutedText}>No expired allocations to show</p>
                    </div>
                ) : (
                    expiredRequests.map(request => (
                        <div key={request.id} className={styles.requestCard}>
                            <div className={styles.userHeader}>
                                <span className={styles.userAvatar}>👤</span>
                                <div>
                                    <h4>{request.user.name}</h4>
                                    <p className={styles.smallText}>
                                        {new Date(request.start_date).toLocaleDateString()} –
                                        {new Date(request.end_date).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <div className={styles.detailGrid}>
                                <div className={styles.detailRow}>
                                    <span className={styles.detailLabel}>Allocated Land:</span>
                                    <span>{request.requested_land} units</span>
                                </div>
                                <div className={styles.detailRow}>
                                    <span className={styles.detailLabel}>Status:</span>
                                    <span className={`${styles.statusBadge} ${styles.statusExpired}`}>
                                        expired
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

const LandRequestsList = ({requests}) => (
    <div className={styles.gardensList}>
        <h2>Land Requests</h2>
        {requests.length === 0 ? (
            <div className={styles.card}>
                <p>No land requests found</p>
            </div>
        ) : (
            requests.map(request => (
                <div key={request.id} className={styles.requestCard}>
                    <h3>{request.garden_name}</h3>
                    <p>
                        Status: <span className={`${styles.statusBadge} ${
                        request.status === 'pending' ? styles.statusPending :
                            request.status === 'approved' ? styles.statusApproved :
                                styles.statusRejected
                    }`}>
                            {request.status}
                        </span>
                    </p>
                    <p>Requested Land: {request.requested_land} units</p>
                    <p>Period: {new Date(request.start_date).toLocaleDateString()} -{' '}
                        {new Date(request.end_date).toLocaleDateString()}</p>
                </div>
            ))
        )}
    </div>
);

const ResourcesList = ({resources, resourceRequests}) => (
    <div className={styles.gardensList}>
        <h2>Your Resources</h2>
        {resources.length === 0 ? (
            <div className={styles.resourceCard}>
                <p>No resources found</p>
            </div>
        ) : (
            resources.map(resource => (
                <div key={resource.id} className={styles.resourceCard}>
                    <h3>
                        {resource.title}
                        <span className={`${styles.resourceTypeBadge} ${
                            resource.type.toLowerCase() === 'tool' ? styles.resourceTypeTool :
                                resource.type.toLowerCase() === 'seed' ? styles.resourceTypeSeed :
                                    styles.resourceTypeEquipment
                        }`}>
                            {resource.type}
                        </span>
                    </h3>
                    <p>Quantity: {resource.quantity}</p>
                    {resource.price && (
                        <div className={styles.resourcePrice}>
                            ${Number(resource.price).toFixed(2)}
                        </div>
                    )}
                    <p>Available: {new Date(resource.available_from).toLocaleDateString()} -{' '}
                        {new Date(resource.available_to).toLocaleDateString()}</p>
                </div>
            ))
        )}

        <h2>Resource Requests</h2>
        {resourceRequests?.length === 0 ? (
            <div className={styles.resourceCard}>
                <p>No requests currently</p>
            </div>
        ) : (
            resourceRequests?.map(request => (
                <div key={request.id} className={styles.resourceCard}>
                    <h3>Request for {request.resource_title}</h3>
                    <div className={styles.requestDetails}>
                        <div className={styles.detailItem}>
                            <span>👤</span>
                            <span>{request.requester_name}</span>
                        </div>
                        <div className={styles.detailItem}>
                            <span>📩</span>
                            <span>{request.message}</span>
                        </div>
                        <div className={styles.detailItem}>
                            <span>📞</span>
                            <span>{request.requester_contact}</span>
                        </div>
                        <div className={styles.detailItem}>
                            <span>📅</span>
                            <span>
                                {new Date(request.created_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                })}
                            </span>
                        </div>
                        <div className={styles.statusContainer}>
                            <span className={`${styles.statusBadge} ${
                                request.status === 'pending' ? styles.statusPending :
                                    request.status === 'approved' ? styles.statusApproved :
                                        styles.statusRejected
                            }`}>
                                {request.status}
                            </span>
                        </div>
                    </div>
                </div>
            ))
        )}
    </div>
);

export default UserDashboard;