import React, { useState } from 'react';

/**
 * ImprovementPromptCard Component
 * 
 * Displays a detailed improvement prompt that can be easily copied
 * for use in AI IDEs like Cursor to improve the podcast generation.
 */

const ImprovementPromptCard = ({ improvementPrompt }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [copied, setCopied] = useState(false);
    const [showFullPrompt, setShowFullPrompt] = useState(false);

    if (!improvementPrompt || improvementPrompt.error) {
        return null;
    }

    const prompt = improvementPrompt.prompt || '';
    const modelUsed = improvementPrompt.model_used || 'Unknown';
    const basedOnScore = improvementPrompt.based_on_score || 0;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(prompt);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        } catch (err) {
            console.error('Failed to copy:', err);
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = prompt;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                setCopied(true);
                setTimeout(() => setCopied(false), 2500);
            } catch (e) {
                console.error('Fallback copy failed:', e);
            }
            document.body.removeChild(textArea);
        }
    };

    // Truncate prompt for preview
    const previewLength = 500;
    const isLongPrompt = prompt.length > previewLength;
    const displayPrompt = showFullPrompt ? prompt : prompt.slice(0, previewLength) + (isLongPrompt ? '...' : '');

    return (
        <div className="improvement-prompt-card glass-card slide-up" style={{
            marginTop: 'var(--spacing-xl)',
            padding: 'var(--spacing-xl)',
            maxWidth: '800px',
            marginLeft: 'auto',
            marginRight: 'auto',
            animationDelay: '0.5s',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)'
        }}>
            {/* Header with toggle */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: 0,
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-primary)'
                }}
            >
                <h2 style={{
                    fontSize: 'clamp(1.3rem, 3vw, 1.8rem)',
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    <span style={{
                        background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                    }}>
                        🚀 Improve Podcast Generation
                    </span>
                </h2>
                <span style={{
                    fontSize: '1.5rem',
                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s ease',
                    color: 'var(--text-secondary)'
                }}>
                    ▼
                </span>
            </button>

            {/* Subtitle */}
            <p style={{
                color: 'var(--text-secondary)',
                fontSize: '0.9rem',
                marginTop: 'var(--spacing-sm)',
                marginBottom: isExpanded ? 'var(--spacing-lg)' : 0
            }}>
                Copy this prompt and paste it into your AI IDE (Cursor, Copilot, etc.) to improve the code
            </p>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="fade-in">
                    {/* Copy Button */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        marginBottom: 'var(--spacing-md)'
                    }}>
                        <button
                            onClick={handleCopy}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '10px 20px',
                                background: copied
                                    ? 'linear-gradient(135deg, #10b981, #059669)'
                                    : 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                                border: 'none',
                                borderRadius: '8px',
                                color: 'white',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                transform: copied ? 'scale(1.05)' : 'scale(1)',
                                boxShadow: copied
                                    ? '0 4px 20px rgba(16, 185, 129, 0.4)'
                                    : '0 4px 20px rgba(139, 92, 246, 0.3)'
                            }}
                            onMouseEnter={(e) => {
                                if (!copied) {
                                    e.currentTarget.style.transform = 'scale(1.05)';
                                    e.currentTarget.style.boxShadow = '0 6px 25px rgba(139, 92, 246, 0.5)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!copied) {
                                    e.currentTarget.style.transform = 'scale(1)';
                                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(139, 92, 246, 0.3)';
                                }
                            }}
                        >
                            {copied ? (
                                <>
                                    <span style={{ fontSize: '1.1rem' }}>✓</span>
                                    Copied!
                                </>
                            ) : (
                                <>
                                    <span style={{ fontSize: '1.1rem' }}>📋</span>
                                    Copy Prompt
                                </>
                            )}
                        </button>
                    </div>

                    {/* Prompt Display */}
                    <div style={{
                        position: 'relative',
                        background: 'rgba(0, 0, 0, 0.3)',
                        borderRadius: '12px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        overflow: 'hidden'
                    }}>
                        <pre style={{
                            padding: 'var(--spacing-lg)',
                            margin: 0,
                            fontFamily: '"Fira Code", "Monaco", "Consolas", monospace',
                            fontSize: '0.85rem',
                            lineHeight: 1.6,
                            color: 'var(--text-secondary)',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            maxHeight: showFullPrompt ? 'none' : '400px',
                            overflowY: showFullPrompt ? 'visible' : 'auto'
                        }}>
                            {displayPrompt}
                        </pre>

                        {/* Show More/Less Button */}
                        {isLongPrompt && (
                            <div style={{
                                position: showFullPrompt ? 'relative' : 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                padding: 'var(--spacing-md)',
                                background: showFullPrompt
                                    ? 'transparent'
                                    : 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                                textAlign: 'center'
                            }}>
                                <button
                                    onClick={() => setShowFullPrompt(!showFullPrompt)}
                                    style={{
                                        padding: '8px 16px',
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        borderRadius: '6px',
                                        color: 'var(--text-primary)',
                                        cursor: 'pointer',
                                        fontSize: '0.85rem',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                                    }}
                                >
                                    {showFullPrompt ? '▲ Show Less' : '▼ Show Full Prompt'}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Model Info */}
                    <div style={{
                        marginTop: 'var(--spacing-md)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.75rem',
                        color: 'var(--text-muted, rgba(255,255,255,0.4))'
                    }}>
                        <span>
                            Generated by {modelUsed}
                        </span>
                        <span>
                            Based on score: {typeof basedOnScore === 'number' ? basedOnScore.toFixed(1) : basedOnScore}/5.0
                        </span>
                    </div>

                    {/* Usage Tips */}
                    <div style={{
                        marginTop: 'var(--spacing-lg)',
                        padding: 'var(--spacing-md)',
                        background: 'rgba(59, 130, 246, 0.1)',
                        borderRadius: '8px',
                        border: '1px solid rgba(59, 130, 246, 0.2)'
                    }}>
                        <h4 style={{
                            color: '#3b82f6',
                            margin: '0 0 8px 0',
                            fontSize: '0.9rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            💡 How to use this prompt
                        </h4>
                        <ol style={{
                            margin: 0,
                            paddingLeft: '20px',
                            color: 'var(--text-secondary)',
                            fontSize: '0.85rem',
                            lineHeight: 1.8
                        }}>
                            <li>Click <strong>Copy Prompt</strong> above</li>
                            <li>Open your AI IDE (Cursor, GitHub Copilot, etc.)</li>
                            <li>Paste the prompt and let the AI analyze your code</li>
                            <li>Review and apply the suggested improvements</li>
                        </ol>
                    </div>
                </div>
            )}

            {/* Animation styles */}
            <style>{`
                .fade-in {
                    animation: fadeIn 0.3s ease-out forwards;
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default ImprovementPromptCard;
