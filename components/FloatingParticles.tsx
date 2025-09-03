import React, { useEffect, useRef } from 'react';

const PARTICLE_COUNT = 25;

export const FloatingParticles: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Clear any existing particles on re-render
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }

        const fragment = document.createDocumentFragment();
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.setProperty('--duration', `${8 + Math.random() * 10}s`);
            particle.style.setProperty('--delay', `${Math.random() * 10}s`);
            fragment.appendChild(particle);
        }
        container.appendChild(fragment);

    }, []);

    return <div ref={containerRef} className="floating-particles" aria-hidden="true"></div>;
};
