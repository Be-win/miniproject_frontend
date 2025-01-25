import "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";

const App = ({ user, setUser }) => {
    // Determine login status
    const isLoggedIn = !!user;

    return (
        <div>
            <Navbar isLoggedIn={!!user} user={user} />
            <Home />
            {/* Main Content */}
            {/*<div className="p-4">*/}
            {/*    <h1 className="text-2xl font-bold">*/}
            {/*        Welcome to the Community Garden Collaboration Platform*/}
            {/*    </h1>*/}
            {/*    <p>Collaborate, share knowledge, and grow together!</p>*/}
            {/*    <div className="mt-4">*/}
            {/*        {isLoggedIn ? (*/}
            {/*            <p>Welcome back, {user.name}!</p>*/}
            {/*        ) : (*/}
            {/*            <>*/}
            {/*                <Link to="/login" className="text-green-600 hover:underline">*/}
            {/*                    Login*/}
            {/*                </Link>{" "}*/}
            {/*                |{" "}*/}
            {/*                <Link to="/signup" className="text-green-600 hover:underline">*/}
            {/*                    Signup*/}
            {/*                </Link>*/}
            {/*            </>*/}
            {/*        )}*/}
            {/*    </div>*/}
            {/*</div>*/}
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
