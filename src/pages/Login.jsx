import { useState } from "react";
import styles from "./styles/Login.module.css";
import backgroundImage from "../assets/login-background-img.png";
import {useLocation, useNavigate} from "react-router-dom";

const Login = ({ setUser }) => {
    const [formData, setFormData] = useState({ email: "", password: "" });
    const location = useLocation();
    const [errorMessage, setErrorMessage] = useState(location.state?.error || "");
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (response.ok) {
                // Save JWT to localStorage
                localStorage.setItem("token", result.token);

                // Update user state
                setUser({
                    id: result.user.id,
                    name: result.user.name,
                    email: result.user.email,
                });

                // Navigate to the home page
                navigate("/");
            } else {
                setErrorMessage(result.error || "Invalid credentials");
            }
        } catch (error) {
            console.error("Error:", error);
            setErrorMessage("An error occurred while logging in.");
        }
    };

    return (
        <div className={styles['login-page']}>
            <div className={styles['form-container']}>
                <div className={styles['form-content']}>
                    <h1 className={styles['login-heading']}>Welcome back!</h1>
                    <h2 className={styles['login-description']}>
                        Enter your credentials to access your account
                    </h2>
                    <form onSubmit={handleSubmit}>
                        <div className={styles['form-group']}>
                            <label htmlFor="email">Email address</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className={styles['form-group']}>
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className={styles['form-group']}>
                            <label className={styles['checkbox-label']} htmlFor="terms">
                                <input type="checkbox" />
                                Remember for 30 days
                            </label>
                        </div>
                        <button type="submit" className={styles['signup-button']}>
                            Login
                        </button>
                    </form>
                    {errorMessage && (
                        <div className={styles['error-message']}>{errorMessage}</div>
                    )}
                    <div className={styles.separator}>Or</div>
                    <div className={styles['social-buttons']}>
                        <button className={styles['google-button']}>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                x="0px"
                                y="0px"
                                width="32"
                                height="32"
                                viewBox="0 0 48 48"
                            >
                                <path
                                    fill="#fbc02d"
                                    d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12	s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20	s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                                ></path>
                                <path
                                    fill="#e53935"
                                    d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039	l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                                ></path>
                                <path
                                    fill="#4caf50"
                                    d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36	c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                                ></path>
                                <path
                                    fill="#1565c0"
                                    d="M43.611,20.083L43.595,20L42,20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571	c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                                ></path>
                            </svg>
                            Sign in with Google
                        </button>
                        <button className={styles['apple-button']}>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                x="0px"
                                y="0px"
                                width="24"
                                height="24"
                                viewBox="0 0 50 50"
                            >
                                <path d="M 44.527344 34.75 C 43.449219 37.144531 42.929688 38.214844 41.542969 40.328125 C 39.601563 43.28125 36.863281 46.96875 33.480469 46.992188 C 30.46875 47.019531 29.691406 45.027344 25.601563 45.0625 C 21.515625 45.082031 20.664063 47.03125 17.648438 47 C 14.261719 46.96875 11.671875 43.648438 9.730469 40.699219 C 4.300781 32.429688 3.726563 22.734375 7.082031 17.578125 C 9.457031 13.921875 13.210938 11.773438 16.738281 11.773438 C 20.332031 11.773438 22.589844 13.746094 25.558594 13.746094 C 28.441406 13.746094 30.195313 11.769531 34.351563 11.769531 C 37.492188 11.769531 40.8125 13.480469 43.1875 16.433594 C 35.421875 20.691406 36.683594 31.78125 44.527344 34.75 Z M 31.195313 8.46875 C 32.707031 6.527344 33.855469 3.789063 33.4375 1 C 30.972656 1.167969 28.089844 2.742188 26.40625 4.78125 C 24.878906 6.640625 23.613281 9.398438 24.105469 12.066406 C 26.796875 12.152344 29.582031 10.546875 31.195313 8.46875 Z"></path>
                            </svg>
                            Sign in with Apple
                        </button>
                    </div>
                </div>
                <p className={styles['signin-link']}>
                    Don&#39;t have an account? <a href="/Signup">Sign Up</a>
                </p>
            </div>
            <div className={styles['image-container']}>
                <img src={backgroundImage} alt="Signup page decoration" />
            </div>
        </div>
    );
};

export default Login;
