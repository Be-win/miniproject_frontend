import { useEffect, useState } from "react";
import axios from "axios";
import styles from './styles/SustainabilityDashboard.module.css';
import ErrorBoundary from "../components/ErrorBoundary.jsx";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";

const TopicOfTheDay = ({ topic, isLoading }) => {
    return (
        <div className={styles.topicOfTheDay}>
            {isLoading ? <p>Loading Topic of the Day...</p> : <h2>Topic of the Day: {topic?.title || "N/A"}</h2>}
        </div>
    );
};

const ArticleForm = ({ onSubmit }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (event) => {
        event.preventDefault();
        const title = event.target.title.value.trim();
        const content = event.target.content.value.trim();

        if (!title || !content) {
            alert("Both title and content are required.");
            return;
        }

        if (title.length < 5 || content.length < 50) {
            alert("Title must be at least 5 characters, and content must be at least 50 characters.");
            return;
        }

        setIsSubmitting(true);
        onSubmit({ title, content })
            .finally(() => setIsSubmitting(false));
        event.target.reset();
    };

    return (
        <form onSubmit={handleSubmit} className={styles.articleForm}>
            <input
                type="text"
                name="title"
                placeholder="Enter article title"
                required
                aria-label="Article Title"
            />
            <textarea
                name="content"
                placeholder="Write your article here..."
                required
                aria-label="Article Content"
            />
            <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Article"}
            </button>
        </form>
    );
};

const ArticleList = ({ articles, onUpvote, showAll, toggleShowAll, isLoading }) => {
    if (isLoading) return <p>Loading Articles...</p>;

    const upvotedArticles = JSON.parse(sessionStorage.getItem("upvotedArticles")) || [];

    const validArticles = Array.isArray(articles) ? articles : [];
    if (validArticles.length === 0) return <p>No articles found.</p>;

    return (
        <div className={styles.topArticles}>
            <h2>Top Articles</h2>
            {validArticles.slice(0, showAll ? validArticles.length : 10).map((article) => (
                <div key={article.id} className={styles.article}>
                    <h3>{article.title}</h3>
                    <div style={{ whiteSpace: 'pre-wrap' }}>
                        <p>{article.content}</p>
                    </div>
                    <button
                        onClick={() => onUpvote(article.id)}
                        disabled={upvotedArticles.includes(article.id)}
                        style={{ backgroundColor: upvotedArticles.includes(article.id) ? "#ccc" : "" }}
                    >
                        {upvotedArticles.includes(article.id) ? "Upvoted" : `Upvote (${article.upvotes || 0})`}
                    </button>
                </div>
            ))}
            {validArticles.length > 10 && (
                <button onClick={toggleShowAll} className={styles.showMoreBtn}>
                    {showAll ? "Show Less" : "Show More"}
                </button>
            )}
        </div>
    );
};


const SustainabilityDashboard = ({ user }) => {
    const [topicOfTheDay, setTopicOfTheDay] = useState(null);
    const [articles, setArticles] = useState([]);
    const [showAll, setShowAll] = useState(false);
    const [isLoadingTopic, setIsLoadingTopic] = useState(true);
    const [isLoadingArticles, setIsLoadingArticles] = useState(true);
    const [successMessage, setSuccessMessage] = useState("");
    const [error, setError] = useState(null);

    useEffect(() => {
        axios
            .get(`${import.meta.env.VITE_API_BASE_URL}/sustainability/topic-of-the-day`)
            .then((response) => setTopicOfTheDay(response.data?.topic))
            .catch(() => setError("Failed to fetch Topic of the Day."))
            .finally(() => setIsLoadingTopic(false));
    }, []);

    useEffect(() => {
        axios
            .get(`${import.meta.env.VITE_API_BASE_URL}/sustainability/top-articles`)
            .then((response) => {
                if (Array.isArray(response.data.articles)) {
                    setArticles(response.data.articles);
                } else {
                    console.error("Expected an array of articles, but got:", response.data);
                    setArticles([]);
                }
            })
            .catch(() => setError("Failed to fetch articles."))
            .finally(() => setIsLoadingArticles(false));
    }, []);

    const handleSubmitArticle = ({ title, content }) => {
        console.log("Submitting article:", { title, content }); // Debugging
        return axios
            .post(`${import.meta.env.VITE_API_BASE_URL}/sustainability/submit-article`, {
                userId: user?.id,
                topicId: topicOfTheDay?.id,
                title,
                content,
            })
            .then((response) => {
                console.log("Article submitted successfully:", response.data); // Debugging
                setArticles([response.data.article, ...articles]);
                setSuccessMessage("Your article has been submitted!");
                setTimeout(() => setSuccessMessage(""), 3000);
            })
            .catch((error) => {
                setError(error.response?.data?.error || error.message || "An unknown error occurred");
            });
    };

    const handleUpvote = (articleId) => {
        // Get the list of upvoted articles from sessionStorage
        const upvotedArticles = JSON.parse(sessionStorage.getItem("upvotedArticles")) || [];

        // Check if the user has already upvoted this article
        if (upvotedArticles.includes(articleId)) {
            setError("You can only upvote an article once per session.");
            return;
        }

        axios
            .post(`${import.meta.env.VITE_API_BASE_URL}/sustainability/upvote-article/${articleId}`)
            .then((response) => {
                const updatedArticle = response.data.article;
                const updatedArticles = articles.map((article) =>
                    article.id === articleId ? updatedArticle : article
                );
                setArticles(updatedArticles);

                // Store the upvoted article ID in sessionStorage
                sessionStorage.setItem("upvotedArticles", JSON.stringify([...upvotedArticles, articleId]));
            })
            .catch(() => setError("Failed to upvote the article."));
    };


    return (
        <ErrorBoundary>
            <Navbar isLoggedIn={!!user} user={user}/>
            <div className={styles.sustainabilityDashboard}>
                <h1>Sustainability Dashboard</h1>
                {error && <div className={styles.errorMessage}>{error}</div>}
                {successMessage && <div className={styles.successMessage}>{successMessage}</div>}
                <TopicOfTheDay topic={topicOfTheDay} isLoading={isLoadingTopic} />
                <ArticleForm onSubmit={handleSubmitArticle} />
                <ArticleList
                    articles={articles}
                    onUpvote={handleUpvote}
                    showAll={showAll}
                    toggleShowAll={() => setShowAll(!showAll)}
                    isLoading={isLoadingArticles}
                />
            </div>
            <Footer />
        </ErrorBoundary>
    );
};

export default SustainabilityDashboard;