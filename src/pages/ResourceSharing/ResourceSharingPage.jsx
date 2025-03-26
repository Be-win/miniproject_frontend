import React, {useState, useEffect} from 'react';
import styles from './ResourceSharingPage.module.css';
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import {format, parseISO} from 'date-fns';

const ResourceSharingPage = ({user}) => {
    const [resources, setResources] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showRequestForm, setShowRequestForm] = useState(false);
    const [selectedResource, setSelectedResource] = useState(null);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [requestData, setRequestData] = useState({
        message: '',
        contact: ''
    });

    const [newResource, setNewResource] = useState({
        title: '',
        description: '',
        type: 'needed',
        quantity: 1,
        price: 0,
        available_from: '',
        available_to: '',
        contact: ''
    });

    useEffect(() => {
        fetchResources();
    }, [filter]);

    const fetchResources = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/resources?filter=${filter}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!res.ok) throw new Error('Failed to fetch resources');
            const data = await res.json();

            // New sorting logic
            const sortedData = data.sort((a, b) => {
                const now = new Date();
                const aDate = new Date(a.available_to);
                const bDate = new Date(b.available_to);
                const aExpired = aDate < now;
                const bExpired = bDate < now;

                // Show non-expired first
                if (aExpired && !bExpired) return 1;
                if (!aExpired && bExpired) return -1;

                // Sort non-expired by nearest expiration first
                if (!aExpired && !bExpired) return aDate - bDate;

                // Sort expired by most recent expiration first
                return bDate - aDate;
            });

            setResources(sortedData);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Basic validation
        if (!newResource.title || !newResource.description || !newResource.contact) {
            return setError('Please fill in all required fields');
        }
        if (newResource.type === 'forSale' && newResource.price <= 0) {
            return setError('Price must be greater than 0 for items for sale');
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/resources`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...newResource,
                    owner_id: user.id,
                    available_from: new Date(newResource.available_from).toISOString(),
                    available_to: new Date(newResource.available_to).toISOString()
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create resource');
            }

            setShowAddForm(false);
            setNewResource({
                title: '',
                description: '',
                type: 'needed',
                quantity: 1,
                price: 0,
                available_from: '',
                available_to: '',
                contact: ''
            });
            await fetchResources();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDelete = async (resourceId) => {
        if (!window.confirm('Are you sure you want to delete this resource?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/resources/${resourceId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to delete resource');
            await fetchResources();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleRequest = (resource) => {
        setSelectedResource(resource);
        setShowRequestForm(true);
    };

    const submitRequest = async (e) => {
        e.preventDefault();
        setError('');

        if (!requestData.message || !requestData.contact) {
            return setError('Please fill in all required fields');
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/resources/requests`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    resource_id: selectedResource.id,
                    requester_contact: requestData.contact,
                    message: requestData.message
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to submit request');
            }

            setShowRequestForm(false);
            setRequestData({message: '', contact: ''});
            alert('Request submitted successfully!');
        } catch (err) {
            setError(err.message);
        }
    };

    const formatDate = (dateString) => {
        return format(parseISO(dateString), 'MMM dd, yyyy');
    };

    return (
        <div>
            <Navbar isLoggedIn={!!user} user={user}/>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2>Resource Sharing</h2>
                    <button onClick={() => setShowAddForm(true)}>Add Resource</button>
                </div>

                <div className={styles.filters}>
                    {['all', 'needed', 'forSale', 'myPosts'].map((f) => (
                        <button
                            key={f}
                            className={`${styles.filterButton} ${filter === f ? styles.active : ''}`}
                            onClick={() => setFilter(f)}
                        >
                            {f.replace(/([A-Z])/g, ' $1').toUpperCase()}
                        </button>
                    ))}
                </div>

                {error && <div className={styles.errorAlert}>{error}</div>}

                {showAddForm && (
                    <div className={styles.formOverlay}>
                        <form className={styles.resourceForm} onSubmit={handleSubmit}>
                            <h3>Add New Resource</h3>
                            <div className={styles.formGroup}>
                                <label>Title *</label>
                                <input
                                    type="text"
                                    value={newResource.title}
                                    onChange={(e) => setNewResource({...newResource, title: e.target.value})}
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Description *</label>
                                <textarea
                                    value={newResource.description}
                                    onChange={(e) => setNewResource({...newResource, description: e.target.value})}
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Type *</label>
                                <select
                                    value={newResource.type}
                                    onChange={(e) => setNewResource({...newResource, type: e.target.value})}
                                >
                                    <option value="needed">Needed</option>
                                    <option value="forSale">For Sale</option>
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Quantity *</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={newResource.quantity}
                                    onChange={(e) => setNewResource({
                                        ...newResource,
                                        quantity: parseInt(e.target.value)
                                    })}
                                    required
                                />
                            </div>
                            {newResource.type === 'forSale' && (
                                <div className={styles.formGroup}>
                                    <label>Price *</label>
                                    <input
                                        type="number"
                                        min="0.01"
                                        step="0.01"
                                        value={newResource.price}
                                        onChange={(e) => setNewResource({
                                            ...newResource,
                                            price: parseFloat(e.target.value)
                                        })}
                                        required
                                    />
                                </div>
                            )}
                            <div className={styles.formGroup}>
                                <label>Available From *</label>
                                <input
                                    type="date"
                                    value={newResource.available_from}
                                    onChange={(e) => setNewResource({...newResource, available_from: e.target.value})}
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Available To *</label>
                                <input
                                    type="date"
                                    value={newResource.available_to}
                                    onChange={(e) => setNewResource({...newResource, available_to: e.target.value})}
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Contact Information *</label>
                                <input
                                    type="text"
                                    value={newResource.contact}
                                    onChange={(e) => setNewResource({...newResource, contact: e.target.value})}
                                    required
                                />
                            </div>
                            <div className={styles.formActions}>
                                <button type="button" onClick={() => setShowAddForm(false)}>Cancel</button>
                                <button type="submit">Submit</button>
                            </div>
                        </form>
                    </div>
                )}

                {showRequestForm && (
                    <div className={styles.formOverlay}>
                        <form className={styles.resourceForm} onSubmit={submitRequest}>
                            <h3>Request Resource: {selectedResource?.title}</h3>
                            <div className={styles.formGroup}>
                                <label>Your Contact Information *</label>
                                <input
                                    type="text"
                                    value={requestData.contact}
                                    onChange={(e) => setRequestData({...requestData, contact: e.target.value})}
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Message to Owner *</label>
                                <textarea
                                    value={requestData.message}
                                    onChange={(e) => setRequestData({...requestData, message: e.target.value})}
                                    required
                                />
                            </div>
                            <div className={styles.formActions}>
                                <button type="button" onClick={() => setShowRequestForm(false)}>Cancel</button>
                                <button type="submit">Submit Request</button>
                            </div>
                        </form>
                    </div>
                )}

                {loading ? (
                    <div className={styles.loading}>Loading resources...</div>
                ) : (
                    <div className={styles.resourceList}>
                        {resources.map(resource => {
                            const isExpired = new Date(resource.available_to) < new Date();
                            return (
                                <div
                                    key={resource.id}
                                    className={`${styles.resourceCard} ${isExpired ? styles.expired : ''}`}
                                >
                                    <h3>
                                        {resource.title}
                                        {isExpired && <span className={styles.expiredLabel}>EXPIRED</span>}
                                    </h3>
                                    <p>{resource.description}</p>
                                    <div className={styles.meta}>
                                        <div className={styles.metaItem}>
                                            <span className={styles.metaLabel}>Type:</span>
                                            <span className={styles.metaValue}>{resource.type}</span>
                                        </div>

                                        <div className={styles.metaItem}>
                                            <span className={styles.metaLabel}>Quantity:</span>
                                            <span className={styles.metaValue}>{resource.quantity}</span>
                                        </div>

                                        {resource.type === 'forSale' && (
                                            <div className={styles.metaItem}>
                                                <span className={styles.metaLabel}>Price:</span>
                                                <span className={styles.metaValue}>
                                                    ₹{(Number(resource.price) || 0).toFixed(2)}
                                                </span>
                                            </div>
                                        )}

                                        <div className={styles.metaItem}>
                                            <span className={styles.metaLabel}>Available:</span>
                                            <span className={styles.metaValue}>
                                                {formatDate(resource.available_from)} - {formatDate(resource.available_to)}
                                            </span>
                                        </div>

                                        <div className={styles.metaItem}>
                                            <span className={styles.metaLabel}>Contact:</span>
                                            <span className={styles.metaValue}>{resource.contact}</span>
                                        </div>

                                        <div className={styles.metaItem}>
                                            <span className={styles.metaLabel}>Posted by:</span>
                                            <span className={styles.metaValue}>{resource.owner_name}</span>
                                        </div>
                                    </div>
                                    <div className={styles.actions}>
                                        {resource.owner_id !== user?.id ? (
                                            <button
                                                className={styles.requestButton}
                                                onClick={() => handleRequest(resource)}
                                                disabled={isExpired}
                                            >
                                                {isExpired ? 'Expired' : 'Request'}
                                            </button>
                                        ) : (
                                            <button
                                                className={styles.deleteButton}
                                                onClick={() => handleDelete(resource.id)}
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            <Footer/>
        </div>
    );
};

export default ResourceSharingPage;