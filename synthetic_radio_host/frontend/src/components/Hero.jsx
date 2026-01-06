import React, { useState, useEffect } from 'react';

const Hero = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [titleVisible, setTitleVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 300);

        const titleTimer = setTimeout(() => {
            setTitleVisible(true);
        }, 100);

        return () => {
            clearTimeout(timer);
            clearTimeout(titleTimer);
        };
    }, []);

    const text = "Transform boring Wikipedia articles into energetic, Gen-Z Hinglish podcasts instantly.";
    const words = text.split(' ');

    const titleText = "Synthetic Radio Host";
    const titleChars = titleText.split('');

    return (
        <div className="text-center mb-8 fade-in-up" style={{ animationDelay: '0.1s', marginBottom: 'var(--spacing-2xl)' }}>
            <h1 style={{
                marginBottom: 'var(--spacing-md)',
                fontWeight: 700,
                letterSpacing: '-0.03em',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.1em',
                flexWrap: 'wrap'
            }}>
                {titleChars.map((char, index) => (
                    <span
                        key={index}
                        className={`apple-title-char ${titleVisible ? 'apple-title-char-visible' : ''}`}
                        style={{
                            animationDelay: `${index * 0.06}s`,
                            display: 'inline-block',
                            willChange: 'transform, opacity, filter'
                        }}
                    >
                        {char === ' ' ? '\u00A0' : char}
                    </span>
                ))}
                <span
                    className={`apple-title-emoji ${titleVisible ? 'apple-title-emoji-visible' : ''}`}
                    style={{
                        animationDelay: `${titleChars.length * 0.06 + 0.2}s`,
                        willChange: 'transform, opacity'
                    }}
                >
                    📻
                </span>
            </h1>
            <p className="apple-description" style={{
                fontSize: 'clamp(1rem, 2vw, 1.25rem)',
                color: 'var(--text-secondary)',
                maxWidth: '700px',
                margin: '0 auto',
                lineHeight: 1.7,
                fontWeight: 400,
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: '0.4em'
            }}>
                {words.map((word, index) => (
                    <span
                        key={index}
                        className={`apple-word ${isVisible ? 'apple-word-visible' : ''}`}
                        style={{
                            animationDelay: `${index * 0.08}s`,
                        }}
                    >
                        {word}
                    </span>
                ))}
            </p>
        </div>
    );
};

export default Hero;
