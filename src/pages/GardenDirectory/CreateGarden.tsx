// @ts-ignore
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { LeafletMouseEvent } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
// @ts-ignore
import styles from './styles/CreateGarden.module.css';

type GardenFormData = {
    name: string;
    description: string;
    address: string;
    latitude: number;
    longitude: number;
    total_land: number;
    type: 'community' | 'rent' | 'charity';
    images: string[];
};

const CreateGardenPage: React.FC<{ user: any }> = ({ user }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<GardenFormData>({
        name: '',
        description: '',
        address: '',
        latitude: 0,
        longitude: 0,
        total_land: 0,
        type: 'community',
        images: [],
    });
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const MapClickHandler = () => {
        useMapEvents({
            click: (e: LeafletMouseEvent) => {
                setFormData({
                    ...formData,
                    latitude: e.latlng.lat,
                    longitude: e.latlng.lng,
                });
            },
        });
        return null;
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setSelectedFiles([...e.target.files]);
        }
    };

    // @ts-ignore
    const uploadImages = async (): Promise<string[]> => {
        const uploadedUrls: string[] = [];
        for (const file of selectedFiles) {
            const data = new FormData();
            data.append('image', file);

            try {
                const response = await axios.post(
                    // @ts-ignore
                    `${import.meta.env.VITE_API_BASE_URL}/garden/upload-image`,
                    data,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            Authorization: `Bearer ${localStorage.getItem('token')}`,
                        },
                    }
                );
                uploadedUrls.push(response.data.imageUrl);
            } catch (err) {
                console.error('Image upload failed:', err);
                throw new Error('Failed to upload images');
            }
        }
        return uploadedUrls;
    };

    // @ts-ignore
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setUploading(true);

        try {
            const imageUrls = await uploadImages();
            const response = await axios.post(
                // @ts-ignore
                `${import.meta.env.VITE_API_BASE_URL}/garden/create-garden`,
                {
                    ...formData,
                    images: imageUrls,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            );
            navigate(`/gardenprofile/${response.data.data.id}`);
        } catch (err) {
            console.error('Submission error:', err);
            setError('Failed to create garden. Please check your inputs and try again.');
        } finally {
            setUploading(false);
        }
    };

    if (!user) {
        return <div className={styles.error}>Please login to create a garden</div>;
    }


    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Create New Garden</h1>

            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                    <label className={styles.label}>Garden Name</label>
                    <input
                        type="text"
                        required
                        className={styles.input}
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Description</label>
                    <textarea
                        className={`${styles.input} ${styles.textarea}`}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Address</label>
                    <input
                        type="text"
                        required
                        className={styles.input}
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Total Land Area (m²)</label>
                    <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        className={styles.input}
                        value={formData.total_land || 0}
                        onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            if (isNaN(value) || value < 0) {
                                setError('Please enter a valid land area (must be a positive number).');
                            } else {
                                setError('');
                                setFormData({
                                    ...formData,
                                    total_land: value,
                                });
                            }
                        }}
                    />
                    {error && <div className={styles.error}>{error}</div>}
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Garden Type</label>
                    <select
                        className={styles.typeSelect}
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    >
                        <option value="community">Community</option>
                        <option value="rent">Rent</option>
                        <option value="charity">Charity</option>
                    </select>
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Select Location</label>
                    <div className={styles.mapContainer}>
                        <MapContainer
                            center={[51.505, -0.09]}
                            zoom={13}
                            className={styles.leafletContainer}
                        >
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                // @ts-ignore
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            />
                            <MapClickHandler />
                            {formData.latitude && formData.longitude && (
                                <Marker position={[formData.latitude, formData.longitude]} />
                            )}
                        </MapContainer>
                    </div>
                    {formData.latitude && formData.longitude && (
                        <p className={styles.coordinates}>
                            Selected coordinates: {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}
                        </p>
                    )}
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Upload Images</label>
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileSelect}
                        className={styles.fileInput}
                    />
                    <div className={styles.imageGrid}>
                        {selectedFiles.map((file, index) => (
                            <img
                                key={index}
                                src={URL.createObjectURL(file)}
                                alt={`Preview ${index}`}
                                className={styles.previewImage}
                            />
                        ))}
                    </div>
                </div>

                {error && <div className={styles.error}>{error}</div>}

                <button
                    type="submit"
                    disabled={uploading}
                    className={styles.submitButton}
                >
                    {uploading ? 'Creating Garden...' : 'Create Garden'}
                </button>
            </form>
        </div>
    );
};

export default CreateGardenPage;