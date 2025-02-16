import React, { useState, useEffect } from 'react';
import { Carousel, Container, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import './styles/Home.css';
import CarouselImage1 from '../assets/carousel-image-1.jpg'
import CarouselImage2 from '../assets/carousel-image-2.jpeg'

const Home = () => {
    const [gardens, setGardens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchGardens = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/garden?limit=4`);

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to fetch gardens');
                }

                const { data } = await response.json();
                setGardens(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchGardens();
    }, []);

    const handleGardenClick = (gardenId) => {
        navigate(`/gardenprofile/${gardenId}`);
    };

    return (
        <div className="home-page">
            {/* Hero Carousel */}
            <Carousel fade>
                <Carousel.Item>
                    <img
                        className="d-block w-100 carousel-image"
                        src={CarouselImage1}
                        alt="Community Gardening"
                    />
                    <Carousel.Caption>
                        <h1>Welcome to Willow & Thrive Community</h1>
                        <p>Connect, Grow, and Share with Local Gardeners</p>
                    </Carousel.Caption>
                </Carousel.Item>
                <Carousel.Item>
                    <img
                        className="d-block w-100 carousel-image"
                        src={CarouselImage2}
                        alt="Vegetable Garden"
                    />
                    <Carousel.Caption>
                        <h2 className="carousel-heading2">Fresh Produce for Everyone</h2>
                        <p>Join our community gardening movement</p>
                    </Carousel.Caption>
                </Carousel.Item>
            </Carousel>

            {/* Featured Gardens Section */}
            <Container className="my-5 featured-gardens">
                <h2 className="text-center mb-4">Featured Gardens</h2>

                {loading ? (
                    <div className="text-center my-5">
                        <Spinner animation="border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </Spinner>
                        <p className="mt-2">Loading gardens...</p>
                    </div>
                ) : error ? (
                    <Alert variant="danger" className="text-center">
                        {error}
                    </Alert>
                ) : (
                    <Row>
                        {gardens.map((garden) => (
                            <Col
                                key={garden.id}
                                xs={12}
                                md={6}
                                lg={3}
                                className="mb-4"
                            >
                                <Card
                                    className="h-100 garden-card"
                                    onClick={() => handleGardenClick(garden.id)}
                                >
                                    <Card.Img
                                        variant="top"
                                        src={garden.image_url || 'https://placehold.co/600x400?text=No+Image'}
                                        alt={garden.name}
                                        className="garden-image"
                                    />
                                    <Card.Body className="d-flex flex-column">
                                        <Card.Title>{garden.name}</Card.Title>
                                        <Card.Text className="flex-grow-1">
                                            {garden.description?.substring(0, 100) || 'A community garden space'}
                                            {garden.description?.length > 100 && '...'}
                                        </Card.Text>
                                        <small className="text-muted mt-auto">
                                            <i className="bi bi-geo-alt"></i> {garden.address}
                                        </small>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                )}
            </Container>

            {/* Call to Action Sections */}
            <Container className="my-5">
                <Row className="g-4">
                    <Col md={4}>
                        <Card className="h-100 info-card">
                            <Card.Body>
                                <Card.Title>
                                    <i className="bi bi-people"></i> Join Our Community
                                </Card.Title>
                                <Card.Text>
                                    Connect with local gardeners, share tips, and collaborate on projects.
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col md={4}>
                        <Card className="h-100 info-card">
                            <Card.Body>
                                <Card.Title>
                                    <i className="bi bi-calendar-event"></i> Upcoming Events
                                </Card.Title>
                                <Card.Text>
                                    Participate in workshops, plant swaps, and community harvest days.
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col md={4}>
                        <Card className="h-100 info-card">
                            <Card.Body>
                                <Card.Title>
                                    <i className="bi bi-book"></i> Learning Resources
                                </Card.Title>
                                <Card.Text>
                                    Access guides on organic gardening, pest control, and sustainable practices.
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Home;