import  { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "../App.jsx";
import Login from "../pages/Login";
import Signup from "../pages/Signup";

const MainComponent = () => {
    // State to manage user information
    const [user, setUser] = useState(() => {
        // Retrieve user information from localStorage, if available
        const savedUser = localStorage.getItem("user");
        return savedUser ? JSON.parse(savedUser) : null;
    });

    useEffect(() => {
        // Update localStorage whenever the user state changes
        if (user) {
            localStorage.setItem("user", JSON.stringify(user));
        } else {
            localStorage.removeItem("user");
        }
    }, [user]);

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<App user={user} setUser={setUser} />} />
                <Route path="/home" element={<App user={user} setUser={setUser} />} />
                <Route path="/login" element={<Login setUser={setUser} />} />
                <Route path="/signup" element={<Signup />} />
            </Routes>
        </BrowserRouter>
    );
};

export default MainComponent;
