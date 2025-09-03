import { NewsArticle } from '../types';
import { GoogleGenAI } from "@google/genai";

if (!process.env.API_KEY) {
    console.warn("API_KEY for news service not set. Using mock data.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

// Fallback data in case the API fails
const fallbackNews: NewsArticle[] = [
    { id: 1, source: "Cannis Revista", headline: "El cannabis y la tercera edad: todo lo que tenés que saber.", link: "https://cannis.org/el-cannabis-y-la-tercera-edad-todo-lo-que-tenes-que-saber/" },
    { id: 2, source: "DW", headline: "Alemania legaliza la posesión y el cultivo personal de cannabis.", link: "https://www.dw.com/es/alemania-legaliza-el-cannabis-con-fines-recreativos/a-68641121" },
    { id: 3, source: "Cannis.org", headline: "Visita nuestra página para aprender más sobre cultivo y cannabis medicinal.", link: "https://cannis.org/" },
];
const fallbackMagazineNews: NewsArticle[] = [
     { id: 4, source: "Cannis Revista", headline: "ONG vs. Industria: ¿una falsa dicotomía?", link: "https://cannis.org/post/ong-vs-industria" },
     { id: 5, source: "Cannis Revista", headline: "El cannabis como motor de desarrollo económico en Argentina", link: "https://cannis.org/post/el-cannabis-como-motor-de-desarrollo-economico-en-argentina" },
     { id: 6, source: "Cannis Revista", headline: "Cannapps, del dealer al algoritmo: la distopía llegó hace rato", link: "https://cannis.org/post/cannapps-del-dealer-al-algoritmo-la-distopia-llego-hace-rato" },
];

export const getNews = async (): Promise<NewsArticle[]> => {
    if (!process.env.API_KEY) {
        return Promise.resolve(fallbackNews);
    }

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: "Busca en Google 4 noticias recientes e importantes sobre cannabis de medios internacionales conocidos (como Reuters, Associated Press, BBC, etc.).",
            config: {
                tools: [{ googleSearch: {} }],
            },
        });
        
        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;

        if (groundingChunks && groundingChunks.length > 0) {
            const articles: NewsArticle[] = groundingChunks.map((chunk: any) => {
                const source = new URL(chunk.web.uri).hostname.replace('www.', '');
                return {
                    source: source.charAt(0).toUpperCase() + source.slice(1),
                    headline: chunk.web.title,
                    link: chunk.web.uri,
                };
            }).slice(0, 4); // Limit to 4 news
             return articles.length > 0 ? articles : fallbackNews;
        }

        return fallbackNews;
    } catch (error) {
        console.error("Error fetching real-time news, returning fallback:", error);
        return fallbackNews;
    }
};


export const getCannisMagazineNews = async (): Promise<NewsArticle[]> => {
    if (!process.env.API_KEY) {
        return Promise.resolve(fallbackMagazineNews);
    }
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: "Busca en Google los 3 artículos más recientes publicados en el sitio web cannis.org/revista.",
            config: {
                tools: [{ googleSearch: {} }],
            },
        });
        
        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;

        if (groundingChunks && groundingChunks.length > 0) {
            const articles: NewsArticle[] = groundingChunks.map((chunk: any) => ({
                source: "Cannis Revista",
                headline: chunk.web.title,
                link: chunk.web.uri,
            })).slice(0, 3); // Limit to 3 news
            return articles.length > 0 ? articles : fallbackMagazineNews;
        }

        return fallbackMagazineNews;
    } catch (error) {
        console.error("Error fetching Cannis Magazine news, returning fallback:", error);
        return fallbackMagazineNews;
    }
};