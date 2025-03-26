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
        const content = event.target.content.value; // Get raw content

        // Validate trimmed content
        const trimmedContent = content.trim();

        if (!title || !trimmedContent) {
            alert("Both title and content are required.");
            return;
        }

        if (title.length < 5 || trimmedContent.length < 50) {
            alert("Title must be at least 5 characters, and content must be at least 50 characters.");
            return;
        }

        setIsSubmitting(true);
        onSubmit({ title, content: trimmedContent }) // Submit trimmed content
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
                style={{ whiteSpace: 'pre-wrap' }}
            />
            <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Article"}
            </button>
        </form>
    );
};

const ArticleList = ({ articles, onUpvote, onDownvote, showAll, toggleShowAll, isLoading }) => {
    const [expandedArticles, setExpandedArticles] = useState({});

    if (isLoading) return <p className={styles.loadingText}>Loading Articles...</p>;

    const validArticles = Array.isArray(articles) ? articles : [];
    if (validArticles.length === 0) return <p className={styles.noContent}>No articles found.</p>;

    const toggleExpand = (articleId) => {
        setExpandedArticles(prev => ({
            ...prev,
            [articleId]: !prev[articleId]
        }));
    };

    const truncateContent = (content, maxLength = 150) => {
        if (content.length <= maxLength) return content;
        return content.substring(0, maxLength) + '...';
    };

    return (
        <div className={styles.topArticles}>
            <h2>Top Articles</h2>
            {validArticles.slice(0, showAll ? validArticles.length : 10).map((article) => (
                <div key={article.id} className={styles.article}>
                    <h3>{article.title}</h3>
                    <div
                        className={`${styles.articleContent} ${expandedArticles[article.id] ? styles.expanded : ''}`}
                        onClick={() => toggleExpand(article.id)}
                    >
                        <p>
                            {expandedArticles[article.id]
                                ? article.content
                                : truncateContent(article.content)}
                        </p>
                        <span className={styles.readMoreToggle}>
                            {expandedArticles[article.id] ? "Show Less" : "Read More"}
                        </span>
                    </div>
                    <div className={styles.articleFooter}>
                        <div className={styles.voteButtons}>
                            <button
                                className={`${styles.upvoteButton} ${article.has_upvoted ? styles.active : ''}`}
                                onClick={() => onUpvote(article.id)}
                            >
                                👍 {article.upvotes}
                            </button>
                            <button
                                className={`${styles.downvoteButton} ${article.has_downvoted ? styles.active : ''}`}
                                onClick={() => onDownvote(article.id)}
                            >
                                👎 {article.downvotes}
                            </button>
                        </div>
                    </div>
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
        const getDailyTopic = async () => {
            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_API_BASE_URL}/sustainability/topic-of-the-day`
                );
                setTopicOfTheDay(response.data?.topic);
            } catch (error) {
                setError("Failed to fetch Topic of the Day.");
            } finally {
                setIsLoadingTopic(false);
            }
        };
        getDailyTopic();
    }, []);

    // useEffect(() => {
    //     axios
    //         .get(`${import.meta.env.VITE_API_BASE_URL}/sustainability/topic-of-the-day`)
    //         .then((response) => setTopicOfTheDay(response.data?.topic))
    //         .catch(() => setError("Failed to fetch Topic of the Day."))
    //         .finally(() => setIsLoadingTopic(false));
    // }, []);

    useEffect(() => {
        const fetchArticles = async () => {
            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_API_BASE_URL}/sustainability/top-articles`,
                    { withCredentials: true }
                );
                setArticles(response.data?.articles || []);
            } catch (err) {
                setError("Failed to fetch articles.");
            } finally {
                setIsLoadingArticles(false);
            }
        };
        fetchArticles();
    }, []);

    const handleSubmitArticle = ({ title, content }) => {
        return axios
            .post(`${import.meta.env.VITE_API_BASE_URL}/sustainability/submit-article`, {
                userId: user?.id,
                topicId: topicOfTheDay?.id,
                title,
                content,
            }, { withCredentials: true })
            .then((response) => {
                setArticles([response.data.article, ...articles]);
                setSuccessMessage("Your article has been submitted!");
                setTimeout(() => setSuccessMessage(""), 3000);
            })
            .catch((error) => {
                setError(error.response?.data?.error || error.message || "Submission failed");
            });
    };

    const handleUpvote = async (articleId) => {
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/sustainability/upvote-article/${articleId}`,
                {}, // Empty request body
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    },
                    withCredentials: true
                }
            );
            setArticles(prev => prev.map(article =>
                article.id === articleId ? response.data.article : article
            ));
        } catch (error) {
            setError(error.response?.data?.error || "Failed to update vote.");
        }
    };

    const handleDownvote = async (articleId) => {
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/sustainability/downvote-article/${articleId}`,
                {}, // Empty request body
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    },
                    withCredentials: true
                }
            );
            setArticles(prev => prev.map(article =>
                article.id === articleId ? response.data.article : article
            ));
        } catch (error) {
            setError(error.response?.data?.error || "Failed to update vote.");
        }
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
                    onDownvote={handleDownvote}
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