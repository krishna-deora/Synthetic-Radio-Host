import React, { useState, useEffect, useRef } from 'react';

const AudioPlayer = ({ audioUrl, onReset, topic }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [hoverTime, setHoverTime] = useState(null);
    const [hoverPosition, setHoverPosition] = useState(0);
    const [showHoverTooltip, setShowHoverTooltip] = useState(false);
    const [buffered, setBuffered] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [showRemainingTime, setShowRemainingTime] = useState(false);
    const audioRef = useRef(null);
    const progressBarRef = useRef(null);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.playbackRate = playbackRate;

            const updateTime = () => setCurrentTime(audioRef.current.currentTime);
            const updateDuration = () => setDuration(audioRef.current.duration);
            const updateBuffered = () => {
                if (audioRef.current.buffered.length > 0) {
                    setBuffered(audioRef.current.buffered.end(audioRef.current.buffered.length - 1));
                }
            };

            audioRef.current.addEventListener('timeupdate', updateTime);
            audioRef.current.addEventListener('progress', updateBuffered);
            audioRef.current.addEventListener('loadedmetadata', updateDuration);
            audioRef.current.addEventListener('loadeddata', updateDuration);

            // Auto-play when URL changes
            if (audioUrl) {
                audioRef.current.play().catch(console.error);
                setIsPlaying(true);
            }

            return () => {
                audioRef.current?.removeEventListener('timeupdate', updateTime);
                audioRef.current?.removeEventListener('progress', updateBuffered);
                audioRef.current?.removeEventListener('loadedmetadata', updateDuration);
                audioRef.current?.removeEventListener('loadeddata', updateDuration);
            };
        }
    }, [audioUrl, playbackRate]);

    const handleSpeedChange = (speed) => {
        setPlaybackRate(speed);
        if (audioRef.current) {
            audioRef.current.playbackRate = speed;
        }
    };

    const togglePlayPause = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleReplay = () => {
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            setCurrentTime(0);
            audioRef.current.play();
            setIsPlaying(true);
        }
    };

    const formatTime = (seconds) => {
        if (!seconds || isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleProgressClick = (e) => {
        if (audioRef.current && progressBarRef.current) {
            const rect = progressBarRef.current.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            const newTime = percent * duration;
            audioRef.current.currentTime = newTime;
            setCurrentTime(newTime);
        }
    };

    const handleProgressHover = (e) => {
        if (progressBarRef.current && duration > 0) {
            const rect = progressBarRef.current.getBoundingClientRect();
            const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            const hoverTimeValue = percent * duration;
            setHoverTime(hoverTimeValue);
            setHoverPosition(percent * 100);
            setShowHoverTooltip(true);
        }
    };

    const handleProgressLeave = () => {
        setShowHoverTooltip(false);
        setHoverTime(null);
    };

    const handleTimeDisplayClick = () => {
        setShowRemainingTime(!showRemainingTime);
    };

    const handleMouseDown = (e) => {
        setIsDragging(true);
        handleProgressClick(e);
    };

    const handleMouseMove = (e) => {
        if (isDragging && audioRef.current && progressBarRef.current) {
            const rect = progressBarRef.current.getBoundingClientRect();
            const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
            const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
            const newTime = percent * duration;
            audioRef.current.currentTime = newTime;
            setCurrentTime(newTime);
        } else if (!isDragging) {
            handleProgressHover(e);
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // Add global mouse and touch listeners to handle drag end even if pointer leaves the component
    useEffect(() => {
        const handleGlobalMouseUp = () => {
            setIsDragging(false);
        };

        const handleGlobalTouchEnd = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            document.addEventListener('mouseup', handleGlobalMouseUp);
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('touchend', handleGlobalTouchEnd);
            document.addEventListener('touchmove', handleMouseMove);
        }

        return () => {
            document.removeEventListener('mouseup', handleGlobalMouseUp);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('touchend', handleGlobalTouchEnd);
            document.removeEventListener('touchmove', handleMouseMove);
        };
    }, [isDragging, duration]);

    return (
        <div className="glass-card fade-in-up" style={{
            marginTop: 'var(--spacing-xl)',
            textAlign: 'center',
            animationDelay: '0.2s'
        }}>
            <h2 style={{
                marginBottom: 'var(--spacing-lg)',
                fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
                fontWeight: 600,
                lineHeight: 1.3
            }}>
                Now Playing: {topic}
            </h2>

            {/* Enhanced Waveform visual simulation */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 'var(--spacing-md)',
                height: '60px',
                marginBottom: 'var(--spacing-xl)',
                padding: 'var(--spacing-md) 0'
            }}>
                {/* Boy emoji (Amit) on the left */}
                <div style={{
                    fontSize: '2.5rem',
                    filter: isPlaying ? 'drop-shadow(0 0 12px rgba(0, 242, 254, 0.6))' : 'none',
                    animation: isPlaying ? 'bounce 2s infinite' : 'none',
                    animationDelay: '0s',
                    transition: 'all var(--transition-base)',
                    opacity: isPlaying ? 1 : 0.7
                }}>
                    👨
                </div>

                {/* Waveform bars */}
                <div style={{
                    display: 'flex',
                    gap: '6px',
                    alignItems: 'center',
                    height: '100%'
                }}>
                    {[...Array(25)].map((_, i) => (
                        <div
                            key={i}
                            style={{
                                width: '5px',
                                height: `${Math.random() * 40 + 15}px`,
                                background: 'var(--secondary-gradient)',
                                borderRadius: 'var(--radius-sm)',
                                animation: `wave ${0.6 + Math.random() * 0.4}s infinite ease-in-out`,
                                animationDelay: `${Math.random() * 0.5}s`,
                                boxShadow: '0 0 8px rgba(0, 242, 254, 0.4)',
                                transition: 'all var(--transition-base)'
                            }}
                        />
                    ))}
                </div>

                {/* Girl emoji (Priya) on the right */}
                <div style={{
                    fontSize: '2.5rem',
                    filter: isPlaying ? 'drop-shadow(0 0 12px rgba(255, 107, 107, 0.6))' : 'none',
                    animation: isPlaying ? 'bounce 2s infinite' : 'none',
                    animationDelay: '0.5s',
                    transition: 'all var(--transition-base)',
                    opacity: isPlaying ? 1 : 0.7
                }}>
                    👩‍🦰
                </div>
            </div>

            {/* Custom Audio Player */}
            <audio
                ref={audioRef}
                src={audioUrl}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
                style={{ display: 'none' }}
            />

            <div style={{
                width: '100%',
                marginBottom: 'var(--spacing-lg)',
                padding: 'var(--spacing-sm) 0',
                background: 'transparent',
                borderRadius: 0,
                border: 'none'
            }}>
                {/* YouTube-style Progress Slider */}
                <div
                    ref={progressBarRef}
                    className={`yt-slider-container ${isDragging ? 'dragging' : ''}`}
                    onMouseDown={handleMouseDown}
                    onMouseMove={isDragging ? handleMouseMove : handleProgressHover}
                    onMouseLeave={handleProgressLeave}
                    onMouseUp={handleMouseUp}
                    onTouchStart={handleMouseDown}
                    onTouchMove={isDragging ? handleMouseMove : handleProgressHover}
                    onTouchEnd={handleMouseUp}
                >
                    {/* Hover Preview Bar (Lighter Gray) */}
                    {showHoverTooltip && hoverTime !== null && (
                        <div
                            className="yt-hover-preview"
                            style={{
                                width: `${hoverPosition}%`,
                            }}
                        />
                    )}

                    {/* Buffered Bar (Semi-transparent White/Gray) */}
                    <div
                        className="yt-buffered-bar"
                        style={{
                            width: `${duration > 0 ? (buffered / duration) * 100 : 0}%`,
                        }}
                    />

                    {/* Progress Bar (Red) */}
                    <div
                        className="yt-progress-bar"
                        style={{
                            width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
                        }}
                    />

                    {/* Progress Thumb (Red Circle) */}
                    <div
                        className="yt-slider-thumb"
                        style={{
                            left: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
                        }}
                    />

                    {/* Hover Tooltip */}
                    {showHoverTooltip && hoverTime !== null && (
                        <div
                            style={{
                                position: 'absolute',
                                left: `${hoverPosition}%`,
                                bottom: '15px',
                                transform: 'translateX(-50%)',
                                padding: '4px 8px',
                                background: 'rgba(28, 28, 28, 0.9)',
                                color: '#fff',
                                fontSize: '12px',
                                fontWeight: '500',
                                borderRadius: '2px',
                                whiteSpace: 'nowrap',
                                pointerEvents: 'none',
                                zIndex: 10,
                                boxShadow: '0 2px 4px rgba(0,0,0,0.5)'
                            }}
                        >
                            {formatTime(hoverTime)}
                        </div>
                    )}
                </div>

                {/* Time Display and Controls */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-md)',
                    marginTop: 'var(--spacing-sm)',
                    justifyContent: 'space-between'
                }}>
                    {/* Time Display - Stylish Bubble Button */}
                    <button className="time-display-bubble" onClick={handleTimeDisplayClick}>
                        <span>{showRemainingTime ? `-${formatTime(duration - currentTime)}` : formatTime(currentTime)}</span>
                        <span style={{ opacity: 0.7 }}> / </span>
                        <span>{formatTime(duration)}</span>
                    </button>

                    {/* Play and Replay Buttons - Centered */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 'var(--spacing-lg)',
                        flex: 1
                    }}>
                        <button
                            onClick={togglePlayPause}
                            style={{
                                border: '2px solid rgba(255, 255, 255, 0.3)',
                                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
                                color: '#fff',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '2.2rem',
                                width: '60px',
                                height: '60px',
                                borderRadius: '50%',
                                transition: 'all 0.2s ease',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                                backdropFilter: 'blur(10px)'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'scale(1.1)';
                                e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 107, 107, 0.4)';
                                e.currentTarget.style.borderColor = 'rgba(255, 107, 107, 0.6)';
                                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 107, 107, 0.2), rgba(255, 107, 107, 0.1))';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
                                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))';
                            }}
                        >
                            {isPlaying ? '⏸' : '▶'}
                        </button>

                        <button
                            onClick={handleReplay}
                            style={{
                                border: '2px solid rgba(255, 255, 255, 0.3)',
                                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
                                color: '#fff',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.8rem',
                                width: '50px',
                                height: '50px',
                                borderRadius: '50%',
                                transition: 'all 0.2s ease',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                                backdropFilter: 'blur(10px)'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'scale(1.1)';
                                e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 242, 254, 0.4)';
                                e.currentTarget.style.borderColor = 'rgba(0, 242, 254, 0.6)';
                                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 242, 254, 0.2), rgba(0, 242, 254, 0.1))';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
                                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))';
                            }}
                            title="Replay from beginning"
                        >
                            ↻
                        </button>
                    </div>
                </div>
            </div>

            {/* Speed Controls */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 'var(--spacing-sm)',
                marginBottom: 'var(--spacing-xl)',
                flexWrap: 'wrap'
            }}>
                <span style={{
                    fontSize: '0.95rem',
                    color: 'var(--text-secondary)',
                    marginRight: 'var(--spacing-xs)'
                }}>
                    Speed:
                </span>
                {[1, 1.5, 2, 3, 4].map((speed) => (
                    <button
                        key={speed}
                        onClick={() => handleSpeedChange(speed)}
                        style={{
                            padding: 'var(--spacing-xs) var(--spacing-sm)',
                            fontSize: '0.9rem',
                            fontWeight: playbackRate === speed ? 600 : 400,
                            background: playbackRate === speed
                                ? 'rgba(0, 242, 254, 0.2)'
                                : 'rgba(255, 255, 255, 0.08)',
                            border: playbackRate === speed
                                ? '1px solid rgba(0, 242, 254, 0.5)'
                                : '1px solid rgba(255, 255, 255, 0.15)',
                            color: playbackRate === speed
                                ? 'var(--primary)'
                                : 'var(--text-secondary)',
                            borderRadius: 'var(--radius-md)',
                            cursor: 'pointer',
                            transition: 'all var(--transition-base)',
                            minWidth: '45px'
                        }}
                        onMouseEnter={(e) => {
                            if (playbackRate !== speed) {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
                                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (playbackRate !== speed) {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                            }
                        }}
                    >
                        {speed}x
                    </button>
                ))}
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 'var(--spacing-md)'
            }}>
                <a
                    href={audioUrl}
                    download={`radio_host_${topic}.mp3`}
                    className="btn-primary"
                    style={{
                        textDecoration: 'none',
                        textAlign: 'center',
                        background: 'rgba(255,255,255,0.12)',
                        border: '1px solid rgba(255,255,255,0.25)',
                        transition: 'all var(--transition-base)'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.18)';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)';
                    }}
                >
                    Download MP3 ⬇️
                </a>

                <button
                    onClick={onReset}
                    className="btn-primary"
                    style={{
                        transition: 'all var(--transition-base)'
                    }}
                >
                    Make Another ↻
                </button>
            </div>
        </div>
    );
};

export default AudioPlayer;
