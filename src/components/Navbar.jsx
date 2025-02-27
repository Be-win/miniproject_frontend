import React, { useEffect, useState } from "react";
import {
    Navbar, Nav, Container, NavDropdown, Button, Badge,
    Modal, ListGroup, Stack
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import styles from "./styles/CustomNavbar.module.css";

// eslint-disable-next-line react/prop-types
const CustomNavbar = ({ isLoggedIn, user, setUser, onLogout }) => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);

    useEffect(() => {
        if (!isLoggedIn) {
            setNotifications([]);
            return;
        }

        const fetchNotifications = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/notifications/land-notifications`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.status === 403) {
                    if (onLogout) onLogout();
                    navigate('/login', { state: { error: "Your session has expired. Please log in again." } });
                    return;
                }

                if (!response.ok) throw new Error("Failed to fetch notifications");

                const { data } = await response.json();
                setNotifications(data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
            } catch (error) {
                console.error("Error fetching notifications:", error);
            }
        };

        fetchNotifications();
    }, [isLoggedIn, onLogout, navigate]);

    const handleNotificationClick = async (notification) => {
        try {
            // Mark notification as read
            await fetch(`${import.meta.env.VITE_API_BASE_URL}/notifications/${notification.id}`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            });

            setNotifications(prev => prev.map(n =>
                n.id === notification.id ? { ...n, is_read: true } : n
            ));

            // Close notifications modal
            setShowNotifications(false);

            // Navigate to dashboard
            navigate('/dashboard');
        } catch (error) {
            console.error("Error handling notification:", error);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        sessionStorage.clear();
        if (onLogout) onLogout();
        navigate("/");
        window.location.reload();
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <Navbar expand="lg" bg="light" fixed="top" className={styles.customNavbar}>
            <Container>
                <Navbar.Brand href="/home">🌱 Community Garden</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav" className={styles.navbarCollapse}>
                    <Nav className="ms-auto me-5 mb-2">
                        <Nav.Link href="/home" className={styles.navLink}>Home</Nav.Link>
                        <Nav.Link href="/directory" className={styles.navLink}>Directory</Nav.Link>
                        <Nav.Link href="/resourcesharing" className={styles.navLink}>Resources</Nav.Link>
                        <Nav.Link href="/sustainabilitydashboard" className={styles.navLink}>Sustainable Tips</Nav.Link>
                    </Nav>

                    <Nav>
                        {isLoggedIn ? (
                            <NavDropdown
                                title={
                                    <>
                                        <img src={user.profilePic} alt="" className={styles.profilePic} /> {user.name}
                                    </>
                                }
                                id="user-dropdown"
                                className="mb-1"
                            >
                                <NavDropdown.Item href="/profile">Profile</NavDropdown.Item>
                                <NavDropdown.Item href="/dashboard">Dashboard</NavDropdown.Item>
                                <NavDropdown.Item
                                    onClick={() => setShowNotifications(true)}
                                    className={styles.notificationDropdownItem}
                                >
                                    Notifications
                                    {notifications.length > 0 && (
                                        <Badge bg="danger" pill className="ms-2">
                                            {notifications.length}
                                        </Badge>
                                    )}
                                </NavDropdown.Item>
                                <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
                            </NavDropdown>
                        ) : (
                            <Nav.Link href="/login">
                                <Button variant="outline-success" size="sm" className={styles.loginButton}>
                                    Login
                                </Button>
                            </Nav.Link>
                        )}
                    </Nav>
                </Navbar.Collapse>

                <Modal
                    show={showNotifications}
                    onHide={() => setShowNotifications(false)}
                    centered
                    className={styles.notificationModal}
                >
                    <Modal.Header closeButton className={styles.modalHeader}>
                        <Modal.Title>Your Notifications</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className={styles.modalBody}>
                        {notifications.length === 0 ? (
                            <div className="text-muted text-center">No new notifications</div>
                        ) : (
                            <ListGroup variant="flush">
                                {notifications.map(notification => (
                                    <ListGroup.Item
                                        key={notification.id}
                                        className={styles.notificationItem}
                                        onClick={() => handleNotificationClick(notification)}
                                    >
                                        <Stack direction="horizontal" gap={3}>
                                            <div className={styles.notificationContent}>
                                                <div className={styles.notificationType}>
                                                    <Badge bg={
                                                        notification.type === 'request' ? 'primary' :
                                                            notification.type === 'extension_request' ? 'warning' : 'info'
                                                    }>
                                                        {notification.type.replace('_', ' ').toUpperCase()}
                                                    </Badge>
                                                </div>

                                                <div className={styles.notificationMessage}>
                                                    {notification.message}
                                                </div>
                                                <div className={styles.notificationTime}>
                                                    {formatDate(notification.created_at)}
                                                </div>
                                            </div>
                                            {!notification.is_read && (
                                                <Badge bg="danger" pill className="ms-auto">
                                                    New
                                                </Badge>
                                            )}
                                        </Stack>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        )}
                    </Modal.Body>
                </Modal>
            </Container>
        </Navbar>
    );
};

export default CustomNavbar;