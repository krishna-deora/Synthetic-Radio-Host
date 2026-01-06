import React, { useEffect, useState, useRef } from 'react';

// Fun, engaging messages that cycle through while waiting
const LOADING_MESSAGES = [
    { text: "🔍 Diving into Wikipedia research...", emoji: "🔍" },
    { text: "📚 Reading through the archives...", emoji: "📚" },
    { text: "🧠 Feeding knowledge to the AI...", emoji: "🧠" },
    { text: "✨ Crafting Hinglish magic...", emoji: "✨" },
    { text: "🎭 Priya and Amit are rehearsing...", emoji: "🎭" },
    { text: "📝 Writing witty dialogues...", emoji: "📝" },
    { text: "🎤 Setting up the mic...", emoji: "🎤" },
    { text: "🎵 Tuning the audio levels...", emoji: "🎵" },
    { text: "☕ AI is sipping chai...", emoji: "☕" },
    { text: "🚀 Almost there, boss!", emoji: "🚀" },
    { text: "💫 Adding Gen-Z vibes...", emoji: "💫" },
    { text: "🎧 Mixing some beats...", emoji: "🎧" },
];

// Fun facts to display
const FUN_FACTS = [
    "Did you know? Our AI writes in authentic Hinglish!",
    "Fun fact: Each podcast has unique voice variations!",
    "Pro tip: Try topics like 'Black Holes' or 'Mumbai'!",
    "Behind the scenes: We use edge-tts for voices!",
    "Trivia: Priya talks 20% faster than Amit! 🏃‍♀️",
];

const ProgressTracker = ({ status, message, progress: backendProgress }) => {
    const [displayMessage, setDisplayMessage] = useState("🎬 Starting the show...");
    const [simulatedProgress, setSimulatedProgress] = useState(0);
    const [funFact, setFunFact] = useState(FUN_FACTS[0]);
    const [messageIndex, setMessageIndex] = useState(0);
    const lastBackendProgress = useRef(0);
    const messageIntervalRef = useRef(null);
    const progressIntervalRef = useRef(null);
    const funFactIntervalRef = useRef(null);

    // Calculate displayed progress - use backend progress if available, otherwise simulated
    const displayedProgress = backendProgress > lastBackendProgress.current
        ? backendProgress
        : Math.max(simulatedProgress, backendProgress || 0);

    // Update last known backend progress
    useEffect(() => {
        if (backendProgress !== undefined && backendProgress !== null && backendProgress > 0) {
            lastBackendProgress.current = backendProgress;
        }
    }, [backendProgress]);

    // Simulated progress animation - faster movement to match actual generation speed
    useEffect(() => {
        progressIntervalRef.current = setInterval(() => {
            setSimulatedProgress(prev => {
                // Don't exceed backend progress if it's ahead
                const target = backendProgress > 0 ? Math.min(backendProgress + 8, 95) : 95;
                if (prev >= target) return prev;

                // Faster increments - progress moves quicker
                const increment = prev < 30 ? 3 : prev < 60 ? 2.5 : prev < 80 ? 2 : 1.5;
                return Math.min(prev + increment, target);
            });
        }, 500);  // Faster interval (500ms instead of 800ms)

        return () => {
            if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        };
    }, [backendProgress]);

    // Cycle through loading messages
    useEffect(() => {
        messageIntervalRef.current = setInterval(() => {
            setMessageIndex(prev => (prev + 1) % LOADING_MESSAGES.length);
        }, 3000);

        return () => {
            if (messageIntervalRef.current) clearInterval(messageIntervalRef.current);
        };
    }, []);

    // Cycle through fun facts
    useEffect(() => {
        funFactIntervalRef.current = setInterval(() => {
            setFunFact(FUN_FACTS[Math.floor(Math.random() * FUN_FACTS.length)]);
        }, 5000);

        return () => {
            if (funFactIntervalRef.current) clearInterval(funFactIntervalRef.current);
        };
    }, []);

    // Update display message - prioritize backend messages when meaningful
    useEffect(() => {
        if (message && !message.includes("Starting generation") && !message.includes("Queued")) {
            // Remove any progress numbers like (2/16), (18/18), etc.
            const cleanMessage = message.replace(/\s*\(\d+\/\d+\)/g, '');
            setDisplayMessage(cleanMessage);
        } else {
            setDisplayMessage(LOADING_MESSAGES[messageIndex].text);
        }
    }, [message, messageIndex]);

    const roundedProgress = Math.round(displayedProgress);

    return (
        <div className="glass-card scale-in" style={{
            marginTop: 'var(--spacing-xl)',
            textAlign: 'center',
            animationDelay: '0.1s'
        }}>
            <h3 className="pulse-anim" style={{
                marginBottom: 'var(--spacing-lg)',
                fontSize: 'clamp(1.5rem, 3vw, 1.8rem)',
                fontWeight: 600
            }}>
                On Air soon... 🎙️
            </h3>

            <div className="progress-container" style={{ position: 'relative', overflow: 'hidden' }}>
                <div
                    className="progress-bar"
                    style={{
                        width: `${roundedProgress}%`,
                        transition: 'width 0.5s ease-out',
                        position: 'relative'
                    }}
                >
                    {/* Shimmer effect */}
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                        animation: 'shimmer 2s infinite',
                    }}></div>
                </div>
            </div>

            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 'var(--spacing-sm)'
            }}>
                <p className="status-text" style={{
                    transition: 'opacity 0.3s ease, transform 0.3s ease',
                    minHeight: '1.7em',
                    margin: 0,
                    flex: 1,
                    animation: 'fadeInUp 0.5s ease'
                }}>
                    {displayMessage}
                </p>
                <span style={{
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    color: 'var(--primary)',
                    marginLeft: 'var(--spacing-md)',
                    minWidth: '50px',
                    textAlign: 'right',
                    fontVariantNumeric: 'tabular-nums'
                }}>
                    {roundedProgress}%
                </span>
            </div>

            {/* Fun fact section */}
            <div style={{
                marginTop: 'var(--spacing-md)',
                padding: 'var(--spacing-sm) var(--spacing-md)',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: 'var(--radius-sm)',
                transition: 'opacity 0.5s ease'
            }}>
                <p style={{
                    fontStyle: 'italic',
                    opacity: 0.8,
                    fontSize: '0.9rem',
                    color: 'var(--text-secondary)',
                    margin: 0
                }}>
                    💡 {funFact}
                </p>
            </div>

            <div style={{
                marginTop: 'var(--spacing-md)',
                opacity: 0.6,
                fontSize: '0.85rem',
                color: 'var(--text-tertiary)',
                lineHeight: 1.6
            }}>
                This takes about 1-2 minutes • Researching → Writing → Recording
            </div>

            {/* Add shimmer animation keyframes */}
            <style>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                @keyframes fadeInUp {
                    from { opacity: 0.5; transform: translateY(5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default ProgressTracker;
