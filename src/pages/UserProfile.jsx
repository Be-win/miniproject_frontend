import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import styles from './styles/UserProfile.module.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const UserProfile = ({ user }) => {
    const { userId } = useParams();
    const [profile, setProfile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        bio: '',
        fullName: '',
        phone: '',
        address: ''
    });
    const [gardensOwned, setGardensOwned] = useState(0);
    const [gardensParticipated, setGardensParticipated] = useState(0);
    const [totalLandWorked, setTotalLandWorked] = useState(0);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/users/profile/${userId}`);
                setProfile(response.data);
                setFormData({
                    bio: response.data.bio || '',
                    fullName: response.data.full_name || '',
                    phone: response.data.phone || '',
                    address: response.data.address || ''
                });
            } catch (error) {
                console.error('Error fetching profile:', error);
            }
        };
        fetchProfile();
    }, [userId]);

    useEffect(() => {
        const fetchGardenStats = async () => {
            try {
                // Fetch gardens owned
                const ownedResponse = await axios.get(
                    `${import.meta.env.VITE_API_BASE_URL}/garden?owner_id=${userId}`
                );
                setGardensOwned(ownedResponse.data.data.length);

                // Fetch land requests for participation data
                const participationResponse = await axios.get(
                    `${import.meta.env.VITE_API_BASE_URL}/users/allocations?user_id=${userId}`
                );

                const activeRequests = participationResponse.data.data.filter(
                    req => ['active', 'approved'].includes(req.status)
                );

                const uniqueGardens = new Set(activeRequests.map(req => req.garden_id));
                setGardensParticipated(uniqueGardens.size);

                const totalLand = activeRequests.reduce(
                    (sum, req) => sum + parseFloat(req.requested_land),
                    0
                );
                setTotalLandWorked(totalLand);
            } catch (error) {
                console.error('Error fetching garden stats:', error);
            }
        };

        if (userId) fetchGardenStats();
    }, [userId]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (user?.id !== profile.id) {
            console.error('Unauthorized edit attempt');
            return;
        }
        try {
            await axios.put(`${import.meta.env.VITE_API_BASE_URL}/users/profile`, formData, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setIsEditing(false);
            window.location.reload();
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        try {
            await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/users/upload-profile-pic`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            window.location.reload();
        } catch (error) {
            console.error('Error uploading image:', error);
        }
    };

    if (!profile) return <div>Loading...</div>;

    return (
        <div>
            <Navbar isLoggedIn={!!user} user={user}/>

            <div className={styles.profileContainer}>
                <div className={styles.profileHeader}>
                    <div className={styles.avatarSection}>
                        <img
                            src={profile.profile_pic_url || `https://avatar.iran.liara.run/username?username=${profile.name}`}
                            alt="Profile"
                            className={styles.profileImage}
                        />
                        {user?.id === profile.id && (
                            <label className={styles.uploadButton}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                                </svg>
                                <input
                                    type="file"
                                    hidden
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                />
                            </label>
                        )}
                    </div>

                    <div className={styles.profileInfo}>
                        <h1>{profile.full_name || profile.name}</h1>
                        <p className={styles.email}>{profile.email}</p>
                        {user?.id === profile.id && (
                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                className={styles.editButton}
                            >
                                {isEditing ? 'Cancel' : 'Edit Profile'}
                            </button>
                        )}
                    </div>
                </div>

                <div className={styles.activityStats}>
                    <h2>Gardening Activity</h2>
                    <div className={styles.statsGrid}>
                        <div className={styles.statCard}>
                            <div className={styles.statValue}>{gardensOwned}</div>
                            <div className={styles.statLabel}>Gardens Owned</div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statValue}>{gardensParticipated}</div>
                            <div className={styles.statLabel}>Gardens Worked In</div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statValue}>{totalLandWorked.toFixed(1)}</div>
                            <div className={styles.statLabel}>Total Land Worked (acres)</div>
                        </div>
                    </div>
                </div>

                {isEditing ? (
                    <form onSubmit={handleSubmit} className={styles.profileForm}>
                        <div className={styles.formGroup}>
                            <label>Full Name</label>
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Bio</label>
                            <textarea
                                name="bio"
                                value={formData.bio}
                                onChange={handleInputChange}
                                rows="4"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Phone</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Address</label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                rows="3"
                            />
                        </div>

                        <button type="submit" className={styles.saveButton}>
                            Save Changes
                        </button>
                    </form>
                ) : (
                    <div className={styles.profileDetails}>
                        <p className={styles.bio} style={{ whiteSpace: 'pre-line' }}>
                            {profile.bio || 'No bio yet'}
                        </p>
                        <div className={styles.detailsGrid}>
                            <div className={styles.detailItem}>
                                <span>Phone:</span>
                                <span>{profile.phone || 'Not provided'}</span>
                            </div>
                            <div className={styles.detailItem}>
                                <span>Address:</span>
                                <span>{profile.address || 'Not provided'}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
};

export default UserProfile;