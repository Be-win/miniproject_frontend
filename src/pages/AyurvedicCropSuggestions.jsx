import { useEffect, useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GiPlantRoots } from "react-icons/gi";
import styles from "./styles/GardenProfile.module.css";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const AyurvedicCropSuggestions = ({ garden }) => {
    const [suggestions, setSuggestions] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchSuggestions = async () => {
            try {
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

                const prompt = `Act as an agricultural expert specializing in Ayurvedic medicine. 
          Suggest 5-7 Ayurvedic medicinal crops suitable for a garden with these features:
          - Soil type: ${garden.soil_type}
          - Irrigation: ${garden.irrigation ? "Available" : "Not available"}
          - Electricity: ${garden.electricity ? "Available" : "Not available"}
          - Previous crops: ${garden.previous_crops || "None specified"}
          - Location: Latitude ${garden.latitude}, Longitude ${garden.longitude}
          - Current season: ${getIndianSeason()}
          
          Provide response in this JSON format:
          {
            "season": "current season",
            "soil_type": "garden soil type",
            "suitable_crops": [
              {
                "name": "crop name",
                "ayurvedic_use": "primary medicinal use",
                "cultivation_tips": "specific growing tips"
              }
            ],
            "organic_methods": ["list of 3 organic cultivation methods"],
            "additional_tips": "general Ayurvedic farming advice"
          }`;

                const result = await model.generateContent(prompt);
                console.log(prompt);
                const response = await result.response;
                const text = response.text();

                // Clean the response (Gemini sometimes adds markdown-style code blocks)
                const cleanedText = text.replace(/```json/g, '').replace(/```/g, '');
                const data = JSON.parse(cleanedText);
                console.log(data);

                setSuggestions(data);
            } catch (err) {
                setError("Failed to generate suggestions. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        if (garden) fetchSuggestions();
    }, [garden]);

    const getIndianSeason = () => {
        const month = new Date().getMonth() + 1;
        if (month >= 3 && month <= 5) return 'Summer (Grishma)';
        if (month >= 6 && month <= 9) return 'Monsoon (Varsha)';
        if (month >= 10 && month <= 11) return 'Autumn (Sharad)';
        return 'Winter (Hemanta)';
    };

    if (loading) return <div className={styles.loading}>Generating Ayurvedic suggestions...</div>;
    if (error) return <div className={styles.error}>{error}</div>;

    return (
        <div className={styles.aiSection}>
            <h3><GiPlantRoots /> AI-Powered Ayurvedic Suggestions</h3>

            <div className={styles.suggestionGroup}>
                <div className={styles.suggestionBox}>
                    <h4>Seasonal Recommendation ({suggestions.season})</h4>
                    <div className={styles.cropGrid}>
                        {suggestions.suitable_crops.map((crop, index) => (
                            <div key={index} className={styles.cropCard}>
                                <h5>{crop.name}</h5>
                                <p><strong>Medicinal Use:</strong> {crop.ayurvedic_use}</p>
                                <p><strong>Cultivation Tips:</strong> {crop.cultivation_tips}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.suggestionBox}>
                    <h4>Organic Cultivation Methods</h4>
                    <ul>
                        {suggestions.organic_methods.map((method, index) => (
                            <li key={index}>{method}</li>
                        ))}
                    </ul>
                </div>

                <div className={styles.suggestionBox}>
                    <h4>Expert Advice</h4>
                    <p>{suggestions.additional_tips}</p>
                    <div className={styles.environmentDetails}>
                        <p><strong>Soil Type Analyzed:</strong> {suggestions.soil_type}</p>
                        <p><strong>Location Considered:</strong>
                            {garden.latitude.toFixed(4)}, {garden.longitude.toFixed(4)}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AyurvedicCropSuggestions;