import React, { useState, useRef, useEffect } from 'react';

// Get API base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const TopicInput = ({ onGenerate, isProcessing }) => {
    const [topic, setTopic] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);

    // Debounce ref
    const timeoutRef = useRef(null);
    const inputRef = useRef(null);

    // Fetch suggestions from backend
    const fetchSuggestions = async (query) => {
        if (!query || query.length < 2) {
            setSuggestions([]);
            setShowDropdown(false);
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/wikipedia/suggest?query=${encodeURIComponent(query)}`);
            if (response.ok) {
                const data = await response.json();
                setSuggestions(data.suggestions || []);
                setShowDropdown(true);
            }
        } catch (error) {
            console.error("Error fetching suggestions:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setTopic(value);

        // Debounce logic
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        if (value.length >= 2) {
            timeoutRef.current = setTimeout(() => {
                fetchSuggestions(value);
            }, 300);
        } else {
            setSuggestions([]);
            setShowDropdown(false);
        }
    };

    const handleKeyDown = (e) => {
        if (!showDropdown || suggestions.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlightedIndex(prev =>
                prev < suggestions.length - 1 ? prev + 1 : prev
            );
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
        } else if (e.key === 'Enter') {
            if (highlightedIndex >= 0) {
                e.preventDefault();
                selectSuggestion(suggestions[highlightedIndex]);
            }
        } else if (e.key === 'Escape') {
            setShowDropdown(false);
        }
    };

    const selectSuggestion = (suggestion) => {
        setTopic(suggestion);
        setSuggestions([]);
        setShowDropdown(false);
        setHighlightedIndex(-1);
        // Optional: Auto-submit or just focus back
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (topic.trim()) {
            onGenerate(topic);
            setShowDropdown(false);
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (inputRef.current && !inputRef.current.closest('.autocomplete-container').contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    return (
        <div className="glass-card slide-up" style={{ animationDelay: '0.2s', overflow: 'visible' }}>
            <form onSubmit={handleSubmit}>
                <div className="autocomplete-container" style={{ marginBottom: 'var(--spacing-lg)' }}>
                    <label style={{
                        display: 'block',
                        marginBottom: 'var(--spacing-sm)',
                        fontWeight: 600,
                        fontSize: '1.1rem',
                        color: 'var(--text-primary)',
                        transition: 'all var(--transition-base)',
                        transform: isFocused || topic ? 'translateY(0)' : 'translateY(0)'
                    }}>
                        What do you want to listen to?
                    </label>
                    <input
                        ref={inputRef}
                        type="text"
                        className="input-field"
                        placeholder="e.g., Black Holes, Mumbai, Quantum Physics"
                        value={topic}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        onFocus={() => {
                            setIsFocused(true);
                            if (topic.length >= 2 && suggestions.length > 0) {
                                setShowDropdown(true);
                            }
                        }}
                        onBlur={() => {
                            setIsFocused(false);
                            // Delay hiding to allow click event on suggestion to fire
                            setTimeout(() => setShowDropdown(false), 200);
                        }}
                        disabled={isProcessing}
                        autoComplete="off"
                        style={{
                            transition: 'all var(--transition-base)',
                            marginBottom: 0
                        }}
                    />

                    {isLoading && <div className="autocomplete-spinner"></div>}

                    {showDropdown && suggestions.length > 0 && (
                        <div className="autocomplete-dropdown">
                            {suggestions.map((suggestion, index) => (
                                <div
                                    key={index}
                                    className={`autocomplete-item ${index === highlightedIndex ? 'highlighted' : ''}`}
                                    onClick={() => selectSuggestion(suggestion)}
                                    onMouseEnter={() => setHighlightedIndex(index)}
                                >
                                    <strong>#</strong> {suggestion}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <button
                    type="submit"
                    className={`btn-primary ${isProcessing ? 'processing' : ''}`}
                    disabled={!topic.trim() || isProcessing}
                    style={{
                        marginTop: 'var(--spacing-md)'
                    }}
                >
                    {isProcessing ? 'Thinking...' : 'Generate Podcast ✨'}
                </button>
            </form>
        </div>
    );
};

export default TopicInput;
