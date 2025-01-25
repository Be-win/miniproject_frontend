import 'react';
import PropTypes from "prop-types";
import { Navbar, Nav, Container, NavDropdown, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const CustomNavbar = ({ isLoggedIn, user, onLogout }) => {
    const navigate = useNavigate();

    // Logout handler
    const handleLogout = () => {
        // Clear user session and authentication token
        localStorage.removeItem("authToken"); // Remove auth token
        localStorage.removeItem("user"); // Remove user data (if you store it in localStorage)

        // Call any additional logout functionality passed as props
        if (onLogout) onLogout();

        // Redirect to login page
        navigate("/login");
    };


    return (
        <Navbar expand="lg" bg="light" fixed="top">
            <Container>
                {/* Logo Section */}
                <Navbar.Brand href="/home">🌱 Community Garden</Navbar.Brand>

                {/* Mobile Menu Toggle */}
                <Navbar.Toggle aria-controls="basic-navbar-nav" />

                {/* Links Section */}
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="ms-auto me-5">
                        <Nav.Link href="/home">Home</Nav.Link>
                        <Nav.Link href="/directory">Directory</Nav.Link>
                        <Nav.Link href="/forums">Forums</Nav.Link>
                        <Nav.Link href="/sustainable-tips">Sustainable Tips</Nav.Link>
                    </Nav>

                    {/* User Section */}
                    <Nav>
                        {isLoggedIn ? (
                            <NavDropdown
                                title={
                                    <>
                                        {/* eslint-disable-next-line react/prop-types */}
                                        <img src={user.profilePic} alt="" className="profile-pic" /> {user.name}
                                    </>
                                }
                                id="user-dropdown"
                            >
                                <NavDropdown.Item href="/profile">Profile</NavDropdown.Item>
                                <NavDropdown.Item href="/settings">Settings</NavDropdown.Item>
                                <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
                            </NavDropdown>
                        ) : (
                            <Nav.Link href="/login">
                                <Button variant="outline-success">Login</Button>
                            </Nav.Link>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

Navbar.propTypes = {
    isLoggedIn: PropTypes.bool.isRequired,
    user: PropTypes.shape({
        name: PropTypes.string,
    }),
};

export default CustomNavbar;
