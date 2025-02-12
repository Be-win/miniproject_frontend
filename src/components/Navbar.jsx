import React from "react";
import { Navbar, Nav, Container, NavDropdown, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import styles from "./styles/CustomNavbar.module.css"; // Import the scoped CSS module

// eslint-disable-next-line react/prop-types
const CustomNavbar = ({ isLoggedIn, user, setUser, onLogout }) => {
    const navigate = useNavigate();

    // Logout handler
    const handleLogout = () => {
        // Clear user session and authentication token
        //localStorage.removeItem("token"); // Remove auth token
        //localStorage.removeItem("user"); // Remove user data (if you store it in localStorage)
        localStorage.clear();
        sessionStorage.clear();

        // Call any additional logout functionality passed as props
        if (onLogout) onLogout();
        navigate("/");
        window.location.reload(); // Force reload to reset all state
    };

    return (
        <Navbar expand="lg" bg="light" fixed="top" className={styles.customNavbar}>
            <Container>
                {/* Logo Section */}
                <Navbar.Brand href="/home">🌱 Community Garden</Navbar.Brand>

                {/* Mobile Menu Toggle */}
                <Navbar.Toggle aria-controls="basic-navbar-nav" />

                {/* Links Section */}
                <Navbar.Collapse id="basic-navbar-nav" className={styles.navbarCollapse}>
                    <Nav className="ms-auto me-5 mb-2">
                        <Nav.Link href="/home" className={styles.navLink}>Home</Nav.Link>
                        <Nav.Link href="/directory" className={styles.navLink}>Directory</Nav.Link>
                        <Nav.Link href="/forums" className={styles.navLink}>Forums</Nav.Link>
                        <Nav.Link href="/sustainabilitydashboard" className={styles.navLink}>Sustainable Tips</Nav.Link>
                    </Nav>

                    {/* User Section */}
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
                                <NavDropdown.Item href="/settings">Settings</NavDropdown.Item>
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
            </Container>
        </Navbar>
    );
};

export default CustomNavbar;
