import "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import Home from "./pages/Home.jsx";

const App = ({ user, setUser }) => {
    // Determine login status
    const isLoggedIn = !!user;

    return (
        <div>
            <Navbar isLoggedIn={!!user} user={user} setUser={setUser} />
            <Home />
            <Footer />
        </div>
    );
};

App.propTypes = {
    user: PropTypes.shape({
        name: PropTypes.string, // Ensure user.name is a string
    }),
    setUser: PropTypes.func.isRequired, // Ensure setUser is a function
};

export default App;
