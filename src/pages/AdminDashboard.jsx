import { useEffect, useState } from 'react';
import { BarChart, LineChart, PieChart, Bar, Line, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import styles from './styles/AdminDashboard.module.css';
import Navbar from "../components/Navbar";
import { useNavigate } from 'react-router-dom';

const AdminDashboard = ({ user }) => {
    const [stats, setStats] = useState(null);
    const [reports, setReports] = useState([]);
    const [landRequests, setLandRequests] = useState([]);
    const [resourceRequests, setResourceRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (user?.id !== 1) {
            navigate('/');
            return;
        }

        const fetchData = async () => {
            try {
                const [dashboardRes, reportsRes, landRes, resourceRes] = await Promise.all([
                    axios.get(`${import.meta.env.VITE_API_BASE_URL}/admin/dashboard`, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                    }),
                    axios.get(`${import.meta.env.VITE_API_BASE_URL}/admin/reports`, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                    }),
                    axios.get(`${import.meta.env.VITE_API_BASE_URL}/admin/land-requests`, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                    }),
                    axios.get(`${import.meta.env.VITE_API_BASE_URL}/admin/resource-requests`, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                    })
                ]);

                setStats(dashboardRes.data.stats);
                setReports(reportsRes.data);
                setLandRequests(landRes.data);
                setResourceRequests(resourceRes.data);
            } catch (error) {
                console.error('Admin dashboard error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user, navigate]);

    if (loading) return <div className={styles.loading}>Loading Admin Dashboard...</div>;

    return (
        <div>
            <Navbar isLoggedIn={!!user} user={user} />

            <div className={styles.adminContainer}>
                <h1 className={styles.title}>Admin Dashboard</h1>

                {/* Stats Grid */}
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <h3>Total Users</h3>
                        <p>{stats.totalUsers}</p>
                    </div>
                    <div className={styles.statCard}>
                        <h3>Total Gardens</h3>
                        <p>{stats.totalGardens}</p>
                    </div>
                    <div className={styles.statCard}>
                        <h3>Pending Reports</h3>
                        <p>{stats.pendingReports}</p>
                    </div>
                    <div className={styles.statCard}>
                        <h3>Active Allocations</h3>
                        <p>{stats.activeAllocations}</p>
                    </div>
                </div>

                {/* Charts Section */}
                <div className={styles.chartsSection}>
                    <div className={styles.chartCard}>
                        <h3>Land Requests Status</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={landRequests}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="status" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="requested_land" fill="#8884d8" name="Land Requested (cents)" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className={styles.chartCard}>
                        <h3>Resource Requests Distribution</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={resourceRequests}
                                    dataKey="count"
                                    nameKey="status"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    fill="#82ca9d"
                                    label
                                />
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Data Tables */}
                <div className={styles.dataSection}>
                    <div className={styles.tableCard}>
                        <h3>Recent Reports</h3>
                        <table className={styles.dataTable}>
                            <thead>
                            <tr>
                                <th>Report ID</th>
                                <th>Subject</th>
                                <th>Garden</th>
                                <th>Reporter</th>
                                <th>Status</th>
                            </tr>
                            </thead>
                            <tbody>
                            {reports.slice(0, 5).map(report => (
                                <tr key={report.id}>
                                    <td>{report.id}</td>
                                    <td>{report.subject}</td>
                                    <td>{report.garden_name}</td>
                                    <td>{report.reporter_name}</td>
                                    <td>
                      <span className={`${styles.status} ${styles[report.status]}`}>
                        {report.status}
                      </span>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    <div className={styles.tableCard}>
                        <h3>Recent Land Requests</h3>
                        <table className={styles.dataTable}>
                            <thead>
                            <tr>
                                <th>Request ID</th>
                                <th>User</th>
                                <th>Garden</th>
                                <th>Land (cents)</th>
                                <th>Status</th>
                            </tr>
                            </thead>
                            <tbody>
                            {landRequests.slice(0, 5).map(request => (
                                <tr key={request.id}>
                                    <td>{request.id}</td>
                                    <td>{request.user_name}</td>
                                    <td>{request.garden_name}</td>
                                    <td>{request.requested_land}</td>
                                    <td>
                      <span className={`${styles.status} ${styles[request.status]}`}>
                        {request.status}
                      </span>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;