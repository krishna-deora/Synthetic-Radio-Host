import React, { useState, useEffect } from 'react';

/**
 * EvaluationScoreCard Component
 * 
 * Displays the LLM critic evaluation results for a generated podcast.
 * Features animated score reveal, category breakdowns, and feedback.
 */

const EvaluationScoreCard = ({ evaluation }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [animatedScore, setAnimatedScore] = useState(0);
    const [showDetails, setShowDetails] = useState(false);

    // Animate the score on mount
    useEffect(() => {
        if (!evaluation?.overall_score) return;

        const targetScore = evaluation.overall_score;
        const duration = 1500; // 1.5 seconds
        const steps = 60;
        const increment = targetScore / steps;
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= targetScore) {
                setAnimatedScore(targetScore);
                clearInterval(timer);
                // Show details after score animation completes
                setTimeout(() => setShowDetails(true), 300);
            } else {
                setAnimatedScore(Math.round(current * 10) / 10);
            }
        }, duration / steps);

        return () => clearInterval(timer);
    }, [evaluation?.overall_score]);

    if (!evaluation || evaluation.error) {
        return null;
    }

    const getScoreLabel = (score) => {
        if (score >= 4.5) return { text: 'Excellent', emoji: '🌟', color: '#10b981' };
        if (score >= 4.0) return { text: 'Great', emoji: '⭐', color: '#22c55e' };
        if (score >= 3.5) return { text: 'Good', emoji: '👍', color: '#84cc16' };
        if (score >= 3.0) return { text: 'Average', emoji: '😐', color: '#eab308' };
        if (score >= 2.0) return { text: 'Below Average', emoji: '📉', color: '#f97316' };
        return { text: 'Needs Work', emoji: '🔧', color: '#ef4444' };
    };

    const getScoreColor = (score) => {
        if (score >= 4.0) return 'var(--success, #22c55e)';
        if (score >= 3.0) return 'var(--warning, #eab308)';
        return 'var(--error, #ef4444)';
    };

    const categoryLabels = {
        hinglish_quality: { name: 'Hinglish Quality', emoji: '🗣️' },
        conversational_naturalness: { name: 'Conversational Flow', emoji: '💬' },
        emotional_expression: { name: 'Emotional Expression', emoji: '🎭' },
        content_coherence: { name: 'Content & Coherence', emoji: '📚' },
        host_chemistry: { name: 'Host Chemistry', emoji: '🤝' }
    };

    const scoreLabel = getScoreLabel(evaluation.overall_score);
    const categories = evaluation.categories || {};
    const strengths = evaluation.strengths || [];
    const improvements = evaluation.improvements || [];
    const feedback = evaluation.feedback || '';

    // Calculate percentage for gauge
    const scorePercentage = (animatedScore / 5) * 100;

    return (
        <div className="evaluation-scorecard glass-card slide-up" style={{
            marginTop: 'var(--spacing-xl)',
            padding: 'var(--spacing-xl)',
            maxWidth: '700px',
            marginLeft: 'auto',
            marginRight: 'auto',
            animationDelay: '0.3s'
        }}>
            {/* Header */}
            <h2 style={{
                textAlign: 'center',
                marginBottom: 'var(--spacing-lg)',
                fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                color: 'var(--text-primary)'
            }}>
                🎯 Podcast Quality Score
            </h2>

            {/* Main Score Display */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginBottom: 'var(--spacing-xl)'
            }}>
                {/* Circular Score Gauge */}
                <div style={{
                    position: 'relative',
                    width: '160px',
                    height: '160px',
                    marginBottom: 'var(--spacing-md)'
                }}>
                    {/* Background circle */}
                    <svg viewBox="0 0 100 100" style={{
                        width: '100%',
                        height: '100%',
                        transform: 'rotate(-90deg)'
                    }}>
                        <circle
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth="8"
                        />
                        {/* Progress circle */}
                        <circle
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke={scoreLabel.color}
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={`${scorePercentage * 2.51} 251`}
                            style={{
                                transition: 'stroke-dasharray 0.5s ease-out',
                                filter: 'drop-shadow(0 0 10px ' + scoreLabel.color + '40)'
                            }}
                        />
                    </svg>
                    {/* Score text in center */}
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        textAlign: 'center'
                    }}>
                        <div style={{
                            fontSize: '2.5rem',
                            fontWeight: 'bold',
                            color: scoreLabel.color,
                            lineHeight: 1
                        }}>
                            {animatedScore.toFixed(1)}
                        </div>
                        <div style={{
                            fontSize: '0.9rem',
                            color: 'var(--text-secondary)',
                            marginTop: '4px'
                        }}>
                            /5.0
                        </div>
                    </div>
                </div>

                {/* Score Label */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '1.3rem',
                    fontWeight: '600',
                    color: scoreLabel.color
                }}>
                    <span>{scoreLabel.emoji}</span>
                    <span>{scoreLabel.text}</span>
                </div>
            </div>

            {/* Category Breakdown */}
            {showDetails && (
                <div className="fade-in" style={{
                    marginBottom: 'var(--spacing-lg)'
                }}>
                    <h3 style={{
                        fontSize: '1.1rem',
                        marginBottom: 'var(--spacing-md)',
                        color: 'var(--text-secondary)'
                    }}>
                        Category Breakdown
                    </h3>

                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--spacing-sm)'
                    }}>
                        {Object.entries(categories).map(([key, data], index) => {
                            const label = categoryLabels[key] || { name: key, emoji: '📊' };
                            const score = data?.score || 0;
                            const percentage = (score / 5) * 100;

                            return (
                                <div key={key} className="category-row" style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'var(--spacing-sm)',
                                    opacity: 0,
                                    animation: `fadeSlideIn 0.4s ease-out ${index * 0.1}s forwards`
                                }}>
                                    <span style={{ width: '24px', textAlign: 'center' }}>{label.emoji}</span>
                                    <span style={{
                                        flex: '0 0 160px',
                                        fontSize: '0.9rem',
                                        color: 'var(--text-secondary)'
                                    }}>
                                        {label.name}
                                    </span>
                                    <div style={{
                                        flex: 1,
                                        height: '8px',
                                        background: 'rgba(255,255,255,0.1)',
                                        borderRadius: '4px',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{
                                            width: `${percentage}%`,
                                            height: '100%',
                                            background: getScoreColor(score),
                                            borderRadius: '4px',
                                            transition: 'width 0.8s ease-out'
                                        }} />
                                    </div>
                                    <span style={{
                                        width: '50px',
                                        textAlign: 'right',
                                        fontSize: '0.9rem',
                                        fontWeight: '600',
                                        color: getScoreColor(score)
                                    }}>
                                        {score.toFixed(1)}/5
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Strengths & Improvements */}
            {showDetails && (strengths.length > 0 || improvements.length > 0) && (
                <div className="fade-in" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: 'var(--spacing-md)',
                    marginBottom: 'var(--spacing-lg)'
                }}>
                    {/* Strengths */}
                    {strengths.length > 0 && (
                        <div style={{
                            padding: 'var(--spacing-md)',
                            background: 'rgba(34, 197, 94, 0.1)',
                            borderRadius: '12px',
                            border: '1px solid rgba(34, 197, 94, 0.3)'
                        }}>
                            <h4 style={{
                                color: '#22c55e',
                                marginBottom: 'var(--spacing-sm)',
                                fontSize: '1rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                ✅ Strengths
                            </h4>
                            <ul style={{
                                margin: 0,
                                paddingLeft: '18px',
                                listStyle: 'none'
                            }}>
                                {strengths.slice(0, 3).map((strength, i) => (
                                    <li key={i} style={{
                                        color: 'var(--text-secondary)',
                                        fontSize: '0.85rem',
                                        marginBottom: '6px',
                                        position: 'relative'
                                    }}>
                                        <span style={{
                                            position: 'absolute',
                                            left: '-18px',
                                            color: '#22c55e'
                                        }}>•</span>
                                        {strength}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Improvements */}
                    {improvements.length > 0 && (
                        <div style={{
                            padding: 'var(--spacing-md)',
                            background: 'rgba(234, 179, 8, 0.1)',
                            borderRadius: '12px',
                            border: '1px solid rgba(234, 179, 8, 0.3)'
                        }}>
                            <h4 style={{
                                color: '#eab308',
                                marginBottom: 'var(--spacing-sm)',
                                fontSize: '1rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                💡 Areas to Improve
                            </h4>
                            <ul style={{
                                margin: 0,
                                paddingLeft: '18px',
                                listStyle: 'none'
                            }}>
                                {improvements.slice(0, 3).map((improvement, i) => (
                                    <li key={i} style={{
                                        color: 'var(--text-secondary)',
                                        fontSize: '0.85rem',
                                        marginBottom: '6px',
                                        position: 'relative'
                                    }}>
                                        <span style={{
                                            position: 'absolute',
                                            left: '-18px',
                                            color: '#eab308'
                                        }}>•</span>
                                        {improvement}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {/* Expandable Detailed Feedback */}
            {showDetails && feedback && (
                <div className="fade-in">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            width: '100%',
                            padding: 'var(--spacing-sm) var(--spacing-md)',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                            fontSize: '0.95rem',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                        }}
                    >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            📝 Detailed Feedback
                        </span>
                        <span style={{
                            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.3s ease'
                        }}>
                            ▼
                        </span>
                    </button>

                    {isExpanded && (
                        <div style={{
                            padding: 'var(--spacing-md)',
                            marginTop: 'var(--spacing-sm)',
                            background: 'rgba(255,255,255,0.03)',
                            borderRadius: '8px',
                            color: 'var(--text-secondary)',
                            fontSize: '0.9rem',
                            lineHeight: 1.7
                        }}>
                            {feedback}
                        </div>
                    )}
                </div>
            )}

            {/* Model Info */}
            {showDetails && evaluation.model_used && (
                <div style={{
                    marginTop: 'var(--spacing-md)',
                    textAlign: 'center',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted, rgba(255,255,255,0.4))'
                }}>
                    Evaluated by {evaluation.model_used} • {evaluation.script_segments} segments analyzed
                </div>
            )}

            {/* Animation keyframes - add to document head */}
            <style>{`
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
        </div>
    );
};

export default EvaluationScoreCard;
