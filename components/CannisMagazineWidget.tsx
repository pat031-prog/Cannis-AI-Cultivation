import React, { useState, useEffect } from 'react';
import { getCannisMagazineNews } from '../services/newsService';
import { NewsArticle } from '../types';
import { AlertTriangleIcon, LinkIcon } from './icons';
import { AiLoader } from './AiLoader';

export const CannisMagazineWidget: React.FC = () => {
    const [articles, setArticles] = useState<NewsArticle[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchArticles = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const fetchedArticles = await getCannisMagazineNews();
                setArticles(fetchedArticles);
            } catch (e) {
                console.error(e);
                setError("No se pudieron cargar los artículos de la revista.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchArticles();
    }, []);

    return (
        <div className="space-y-3">
            {isLoading && <AiLoader />}
            {error && (
                <div className="flex items-center gap-3 text-red-400 bg-red-900/50 p-3 rounded-lg">
                    <AlertTriangleIcon /> {error}
                </div>
            )}
            {!isLoading && !error && articles.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {articles.map((article, index) => (
                        <a
                            key={article.id || index}
                            href={article.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50 hover:border-green-500/50 hover:bg-gray-800 transition-all duration-200 group flex flex-col justify-between"
                        >
                            <h4 className="font-semibold text-green-400 text-base group-hover:text-green-300">{article.headline}</h4>
                            <div className="flex items-center justify-end text-xs text-gray-400 mt-2">
                                <LinkIcon className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </a>
                    ))}
                </div>
            )}
             {!isLoading && !error && articles.length === 0 && (
                 <p className="text-center text-gray-500 py-4">No se encontraron artículos recientes.</p>
             )}
        </div>
    );
};