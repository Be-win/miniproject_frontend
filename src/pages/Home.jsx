import 'react';
import { Carousel, Container, Row, Col, Card } from 'react-bootstrap';
import './styles/Home.css'; // Import your CSS file for styling
import ExampleImage from '../assets/ExampleCarouselImage.jpg';
import ExampleImage2 from '../assets/ExampleCarouselImage2.jpg';
import ExampleImage3 from '../assets/ExampleCarouselImage3.jpg';

const Home = () => {
    // Dummy data for gardens near you (replace with real data later)
    const gardensNearYou = [
        { id: 1, name: "Green Valley Garden", image: ExampleImage },
        { id: 2, name: "Sunny Meadows Garden", image: ExampleImage2 },
        { id: 3, name: "Urban Oasis Garden", image: ExampleImage3 },
        { id: 4, name: "Harmony Park Garden", image: ExampleImage },
    ];

    return (
        <div>
            {/* Image Carousel */}
            <Carousel>
                <Carousel.Item>
                    <img
                        className="d-block w-100"
                        src={ExampleImage}
                        alt="First slide"
                    />
                    <Carousel.Caption>
                        <h3>Welcome to Community Garden</h3>
                        <p>Join hands to grow a greener future.</p>
                    </Carousel.Caption>
                </Carousel.Item>
                <Carousel.Item>
                    <img
                        className="d-block w-100"
                        src={ExampleImage2}
                        alt="Second slide"
                    />
                    <Carousel.Caption>
                        <h3>Discover Gardens Near You</h3>
                        <p>Find and join local community gardens.</p>
                    </Carousel.Caption>
                </Carousel.Item>
                <Carousel.Item>
                    <img
                        className="d-block w-100"
                        src={ExampleImage3}
                        alt="Third slide"
                    />
                    <Carousel.Caption>
                        <h3>Volunteer and Learn</h3>
                        <p>Sign up for gardening tasks and workshops.</p>
                    </Carousel.Caption>
                </Carousel.Item>
            </Carousel>

            {/* Gardens Near You Section */}
            <Container className="my-5">
                <h2 className="text-center mb-4">Gardens Near You</h2>
                <Row>
                    {gardensNearYou.map((garden) => (
                        <Col key={garden.id} md={3} sm={6} className="mb-4">
                            <Card>
                                <Card.Img variant="top" src={garden.image} />
                                <Card.Body>
                                    <Card.Title>{garden.name}</Card.Title>
                                    <Card.Text>
                                        Join this garden and contribute to the community.
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Container>

            {/* Additional Sections (e.g., Forums, Events, etc.) */}
            <Container className="my-5">
                <h2 className="text-center mb-4">Explore More</h2>
                <Row>
                    <Col md={4} className="mb-4">
                        <Card>
                            <Card.Body>
                                <Card.Title>Forums</Card.Title>
                                <Card.Text>
                                    Discuss gardening tips, share experiences, and ask questions.
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={4} className="mb-4">
                        <Card>
                            <Card.Body>
                                <Card.Title>Events</Card.Title>
                                <Card.Text>
                                    Join workshops, volunteer days, and harvest festivals.
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={4} className="mb-4">
                        <Card>
                            <Card.Body>
                                <Card.Title>Sustainability Tips</Card.Title>
                                <Card.Text>
                                    Learn how to garden sustainably and reduce your carbon footprint.
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