import { useEffect, useState } from 'react';
import { BarChart, PieChart, Bar, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
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

    // Color configuration
    const statusColors = {
        Pending: '#FFC107',
        Approved: '#4CAF50',
        Active: '#2196F3',
        Expired: '#9E9E9E',
        Rejected: '#F44336',
        Closed: '#607D8B'
    };

    const processChartData = () => {
        const statusOrder = ['pending', 'approved', 'active', 'expired', 'rejected'];
        const landByStatus = landRequests.reduce((acc, request) => {
            const landValue = parseFloat(request.requested_land) || 0;
            acc[request.status] = (acc[request.status] || 0) + landValue;
            return acc;
        }, {});

        const landChartData = statusOrder
            .filter(status => landByStatus[status])
            .map(status => ({
                status: status.charAt(0).toUpperCase() + status.slice(1),
                totalLand: parseFloat(landByStatus[status].toFixed(2)) // Ensure proper number format
            }));

        console.log(landChartData);

        const resourceStatusCounts = resourceRequests.reduce((acc, request) => {
            acc[request.status] = (acc[request.status] || 0) + 1;
            return acc;
        }, {});

        const resourceChartData = Object.entries(resourceStatusCounts)
            .map(([status, count]) => ({
                status: status.charAt(0).toUpperCase() + status.slice(1),
                count
            }));

        const sortedReports = [...reports].sort((a, b) =>
            new Date(b.created_at) - new Date(a.created_at)
        );

        const sortedLandRequests = [...landRequests].sort((a, b) =>
            new Date(b.created_at) - new Date(a.created_at)
        );

        return { landChartData, resourceChartData, sortedReports, sortedLandRequests };
    };

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

    const { landChartData, resourceChartData, sortedReports, sortedLandRequests } = processChartData();

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

                <div className={styles.chartsSection}>
                    <div className={styles.chartCard}>
                        <h3>Land Requests by Status</h3>
                        {landChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={landChartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="status"
                                        tick={{ fill: '#666' }}
                                        label={{ value: 'Status', position: 'bottomRight' }}
                                    />
                                    <YAxis
                                        label={{
                                            value: 'Total Land (cents)',
                                            angle: -90,
                                            position: 'insideLeft'
                                        }}
                                    />
                                    <Tooltip
                                        formatter={(value) => [`${value} cents`, 'Total Land']}
                                        contentStyle={{
                                            backgroundColor: '#fff',
                                            border: '1px solid #ccc',
                                            borderRadius: '4px'
                                        }}
                                    />
                                    <Legend />
                                    <Bar
                                        dataKey="totalLand"
                                        name="Total Land Requested"
                                    >
                                        {landChartData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={statusColors[entry.status]}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className={styles.noData}>No land request data available</div>
                        )}
                    </div>

                    <div className={styles.chartCard}>
                        <h3>Resource Request Distribution</h3>
                        {resourceChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={resourceChartData}
                                        dataKey="count"
                                        nameKey="status"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        labelLine={false}
                                        label={({ name, percent }) =>
                                            `${name}: ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {resourceChartData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={statusColors[entry.status]}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value, name) => [`${value} requests`, name]}
                                        contentStyle={{
                                            backgroundColor: '#fff',
                                            border: '1px solid #ccc',
                                            borderRadius: '4px'
                                        }}
                                    />
                                    <Legend
                                        layout="vertical"
                                        align="right"
                                        verticalAlign="middle"
                                        payload={resourceChartData.map((item) => ({
                                            id: item.status,
                                            value: item.status,
                                            color: statusColors[item.status]
                                        }))}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className={styles.noData}>No resource request data available</div>
                        )}
                    </div>
                </div>

                <div className={styles.dataSection}>
                    <div className={styles.tableCard}>
                        <h3>Recent Reports</h3>
                        {sortedReports.length > 0 ? (
                            <table className={styles.dataTable}>
                                <thead>
                                <tr>
                                    <th>Report ID</th>
                                    <th>Subject</th>
                                    <th>Garden</th>
                                    <th>Reporter</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                </tr>
                                </thead>
                                <tbody>
                                {sortedReports.slice(0, 5).map(report => (
                                    <tr key={report.id}>
                                        <td>{report.id}</td>
                                        <td className={styles.ellipsis}>{report.subject}</td>
                                        <td>{report.garden_name}</td>
                                        <td>{report.reporter_name}</td>
                                        <td>
                                                <span className={`${styles.status} ${styles[report.status]}`}>
                                                    {report.status}
                                                </span>
                                        </td>
                                        <td>{new Date(report.created_at).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className={styles.noData}>No reports available</div>
                        )}
                    </div>

                    <div className={styles.tableCard}>
                        <h3>Recent Land Requests</h3>
                        {sortedLandRequests.length > 0 ? (
                            <table className={styles.dataTable}>
                                <thead>
                                <tr>
                                    <th>Request ID</th>
                                    <th>User</th>
                                    <th>Garden</th>
                                    <th>Land (cents)</th>
                                    <th>Status</th>
                                    <th>Request Date</th>
                                </tr>
                                </thead>
                                <tbody>
                                {sortedLandRequests.slice(0, 5).map(request => (
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
                                        <td>{new Date(request.created_at).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className={styles.noData}>No land requests available</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;