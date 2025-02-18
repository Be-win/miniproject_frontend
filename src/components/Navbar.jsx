import React, {useEffect, useState} from "react";
import {
    Navbar, Nav, Container, NavDropdown, Button, Badge,
    Modal, ListGroup, Stack, Alert
} from "react-bootstrap";
import {useNavigate} from "react-router-dom";
import styles from "./styles/CustomNavbar.module.css";

// eslint-disable-next-line react/prop-types
const CustomNavbar = ({isLoggedIn, user, setUser, onLogout}) => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [selectedNotification, setSelectedNotification] = useState(null);
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
                    headers: {Authorization: `Bearer ${token}`}
                });

                if (response.status === 401) {
                    if (onLogout) onLogout();
                    return;
                }

                if (!response.ok) throw new Error("Failed to fetch notifications");

                const {data} = await response.json();
                setNotifications(data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
                setNotifications(data);
            } catch (error) {
                console.error("Error fetching notifications:", error);
            }
        };

        fetchNotifications();
    }, [isLoggedIn, onLogout]);

    const handleNotificationClick = async (notification) => {
        try {
            // Mark notification as read
            await fetch(`${import.meta.env.VITE_API_BASE_URL}/notifications/${notification.id}`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            });

            // Fetch request details if it's a land request
            if (notification.type === 'request') {
                const requestResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/garden/requests/${notification.request_id}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                });
                if (requestResponse.ok) {
                    const {data} = await requestResponse.json();
                    notification.status = data.status; // Add status to notification
                }
            }


            setNotifications(prev => prev.map(n =>
                n.id === notification.id ? {...n, is_read: true} : n
            ));

            // Fetch extension request details if needed
            if (notification.type === 'extension_request') {
                const requestResponse = await fetch(
                    `${import.meta.env.VITE_API_BASE_URL}/garden/requests/${notification.request_id}`,
                    {
                        headers: {Authorization: `Bearer ${localStorage.getItem("token")}`}
                    });
                if (requestResponse.ok) {
                    const {data} = await requestResponse.json();
                    notification.extensionDetails = data;
                }
            }

            setSelectedNotification(notification);
            console.log(notification);
        } catch (error) {
            console.error("Error handling notification:", error);
        }
    };

    const handleRequestAction = async (status) => {
        try {
            // Determine endpoint and HTTP method based on notification type
            const isExtensionRequest = selectedNotification.type === 'extension_request';
            const endpoint = isExtensionRequest
                ? `${import.meta.env.VITE_API_BASE_URL}/garden/requests/${selectedNotification.request_id}/extend`
                : `${import.meta.env.VITE_API_BASE_URL}/garden/requests/${selectedNotification.request_id}`;

            // Use PATCH method for both regular and extension requests
            const response = await fetch(endpoint, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({ status })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Refresh notifications
            const notificationsResponse = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/notifications/land-notifications`,
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
                }
            );
            const { data: freshNotifications } = await notificationsResponse.json();

            // Update notifications with latest status
            const updatedNotifications = await Promise.all(
                freshNotifications.map(async (notification) => {
                    // Update for both request and extension types
                    if (notification.request_id === selectedNotification.request_id) {
                        const requestResponse = await fetch(
                            `${import.meta.env.VITE_API_BASE_URL}/garden/requests/${notification.request_id}`,
                            {
                                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
                            }
                        );

                        if (requestResponse.ok) {
                            const { data: requestData } = await requestResponse.json();
                            return {
                                ...notification,
                                status: requestData.status,
                                // Update extension details if present
                                ...(requestData.proposed_end_date && {
                                    extensionDetails: {
                                        ...notification.extensionDetails,
                                        status: requestData.status,
                                        end_date: requestData.end_date,
                                        proposed_end_date: requestData.proposed_end_date
                                    }
                                })
                            };
                        }
                    }
                    return notification;
                })
            );

            setNotifications(updatedNotifications);
            setSelectedNotification(null);
        } catch (error) {
            console.error("Error processing request:", error);
            // Consider adding user-facing error feedback here
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
        const options = {year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'};
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <Navbar expand="lg" bg="light" fixed="top" className={styles.customNavbar}>
            <Container>
                <Navbar.Brand href="/home">🌱 Community Garden</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav"/>
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
                                        <img src={user.profilePic} alt="" className={styles.profilePic}/> {user.name}
                                    </>
                                }
                                id="user-dropdown"
                                className="mb-1"
                            >
                                <NavDropdown.Item href="/profile">Profile</NavDropdown.Item>
                                <NavDropdown.Item href="/settings">Settings</NavDropdown.Item>
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
                    onHide={() => {
                        setShowNotifications(false);
                        setSelectedNotification(null);
                    }}
                    centered
                    className={styles.notificationModal}
                >
                    {selectedNotification ? (
                        <>
                            <Modal.Header className={styles.modalHeader}>
                                <Button
                                    variant="link"
                                    onClick={() => setSelectedNotification(null)}
                                    className={styles.backButton}
                                >
                                    ← Back
                                </Button>
                                <Modal.Title>
                                    {selectedNotification.type === 'request' ? 'Land Request' : 'Notification'}
                                </Modal.Title>
                            </Modal.Header>
                            <Modal.Body className={styles.modalBody}>
                                <div className="mb-3">
                                    <p>{selectedNotification.message}</p>
                                    <small className="text-muted">
                                        {formatDate(selectedNotification.created_at)}
                                    </small>
                                </div>

                                {selectedNotification.type === 'extension_request' ? (
                                    <div className="mb-3">
                                        <p>{selectedNotification.message}</p>
                                        <p>Current End
                                            Date: {formatDate(selectedNotification.extensionDetails?.end_date)}</p>
                                        <p>Proposed End
                                            Date: {formatDate(selectedNotification.extensionDetails?.proposed_end_date)}</p>
                                        <small className="text-muted">
                                            {formatDate(selectedNotification.created_at)}
                                        </small>

                                        {selectedNotification.extensionDetails?.status === 'pending_extension' ? (
                                            <div className="d-flex gap-2 justify-content-end mt-3">
                                                <Button variant="danger"
                                                        onClick={() => handleRequestAction('rejected')}>
                                                    Decline Extension
                                                </Button>
                                                <Button variant="success"
                                                        onClick={() => handleRequestAction('approved')}>
                                                    Approve Extension
                                                </Button>
                                            </div>
                                        ) : (
                                            <Alert variant={
                                                selectedNotification.extensionDetails?.status === 'approved' || 'active' ? 'success' :
                                                    selectedNotification.extensionDetails?.status === 'rejected' ? 'danger' : 'info'
                                            }>
                                                Extension status: {selectedNotification.extensionDetails?.status?.toUpperCase()}
                                            </Alert>
                                        )}
                                    </div>
                                ) : selectedNotification.type === 'request' ? (
                                    selectedNotification.status === 'pending' ? (
                                        <div className="d-flex gap-2 justify-content-end">
                                            <Button
                                                variant="danger"
                                                onClick={() => handleRequestAction('declined')}
                                            >
                                                Decline
                                            </Button>
                                            <Button
                                                variant="success"
                                                onClick={() => handleRequestAction('approved')}
                                            >
                                                Accept
                                            </Button>
                                        </div>
                                    ) : (
                                        <Alert
                                            variant={selectedNotification.status === 'approved' ? 'success' : 'danger'}
                                            className="mb-0"
                                        >
                                            Request status: {selectedNotification.status?.toUpperCase()}
                                        </Alert>
                                    )
                                ) : (
                                    <Alert variant="info" className="mb-0">
                                        {selectedNotification.message}
                                    </Alert>
                                )
                                }
                            </Modal.Body>
                        </>
                    ) : (
                        <>
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
                                                        {/* Add notification type badge here */}
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
                        </>
                    )}
                </Modal>
            </Container>
        </Navbar>
    );
};

export default CustomNavbar;