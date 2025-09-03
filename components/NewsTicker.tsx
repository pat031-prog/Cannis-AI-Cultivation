import React, { useState, useEffect } from 'react';
import { getNews } from '../services/newsService';
import { NewsArticle } from '../types';
import { NewspaperIcon } from './icons';

export const NewsTicker: React.FC = () => {
    const [news, setNews] = useState<NewsArticle[]>([]);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const articles = await getNews();
                setNews(articles);
            } catch (error) {
                console.error("Failed to fetch news for ticker:", error);
                setNews([]); // Clear news on error or use fallback from service
            }
        };
        fetchNews();
    }, []);

    if (news.length === 0) {
        return null;
    }

    return (
        <div className="bg-black/20 backdrop-blur-sm border-y border-green-500/20 w-full overflow-hidden whitespace-nowrap mb-6 relative h-10 flex items-center">
            <div className="absolute left-0 top-0 bottom-0 z-10 bg-gradient-to-r from-[#0d1b0d] via-[#0d1b0d] to-transparent w-24 flex items-center justify-center">
                 <div className="flex items-center gap-2 text-green-400 font-bold text-sm">
                    <NewspaperIcon className="w-5 h-5"/>
                    <span>NOTICIAS</span>
                 </div>
            </div>
            <div className="animate-ticker-scroll inline-block">
                {news.map((article, index) => (
                    <a 
                      key={article.id || index}
                      href={article.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mx-8 text-sm text-gray-300 hover:text-white transition-colors duration-200"
                    >
                        <span className="font-semibold text-green-400/80">{article.source}:</span> {article.headline}
                    </a>
                ))}
                 {/* Duplicate for seamless scroll */}
                 {news.map((article, index) => (
                    <a 
                      key={`dup-${article.id || index}`}
                      href={article.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mx-8 text-sm text-gray-300 hover:text-white transition-colors duration-200"
                    >
                        <span className="font-semibold text-green-400/80">{article.source}:</span> {article.headline}
                    </a>
                ))}
            </div>
             <div className="absolute right-0 top-0 bottom-0 z-10 bg-gradient-to-l from-[#0d1b0d] to-transparent w-16"></div>
        </div>
    );
};