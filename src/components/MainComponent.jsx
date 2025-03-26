import {useState, useEffect} from "react";
import {BrowserRouter, Routes, Route, Navigate} from "react-router-dom";
import App from "../App.jsx";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import SustainabilityDashboard from "../pages/SustainabilityDashboard";
import GardenDirectory from "../pages/GardenDirectory/GardenDirectory";
import GardenProfile from "../pages/GardenProfile";
import Navbar from "./Navbar.jsx";
import CreateGarden from "../pages/GardenDirectory/CreateGarden";
import ResourceShare from "../pages/ResourceSharing/ResourceSharingPage";
import UserDashboard from "../pages/UserDashboard";
import UserProfile from "../pages/UserProfile";
import AdminDashboard from '../pages/AdminDashboard';
import Test from "../pages/test.jsx"

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
                <Route path="/test" element={<Test/>}/>
                <Route path="/" element={<App user={user} setUser={setUser}/>}/>
                <Route path="/home" element={<App user={user} setUser={setUser}/>}/>
                <Route path="/navbar" element={<Navbar user={user} setUser={setUser}/>}/>
                <Route path="/login" element={<Login setUser={setUser}/>}/>
                <Route path="/signup" element={<Signup setUser={setUser}/>}/>
                <Route path="/sustainabilitydashboard" element={<SustainabilityDashboard user={user}/>}/>
                <Route path="/directory" element={<GardenDirectory user={user}/>}/>
                <Route path="/gardenProfile/:id" element={<GardenProfile user={user}/>}/>
                <Route path="directory/gardenProfile/:id" element={<GardenProfile user={user}/>}/>
                <Route path="directory/createGarden" element={<CreateGarden user={user}/>}/>
                <Route path="/resourcesharing" element={<ResourceShare user={user}/>}/>
                <Route path="/dashboard" element={<UserDashboard user={user}/>}/>
                <Route path="/profile/:userId" element={<UserProfile user={user}/>}/>
                <Route
                    path="/profile"
                    element={<Navigate to={`/profile/${user?.id}`} replace/>}
                />
                <Route path="/admin-dashboard" element={ <AdminDashboard user={user}/> } />
            </Routes>
        </BrowserRouter>
    );
};

export default MainComponent;
