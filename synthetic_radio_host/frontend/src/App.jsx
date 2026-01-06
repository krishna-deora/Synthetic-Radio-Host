import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import Hero from './components/Hero';
import TopicInput from './components/TopicInput';
import ProgressTracker from './components/ProgressTracker';
import AudioPlayer from './components/AudioPlayer';
import EvaluationScoreCard from './components/EvaluationScoreCard';
import ImprovementPromptCard from './components/ImprovementPromptCard';

function App() {
  const [status, setStatus] = useState('idle'); // idle, processing, completed, failed
  const [message, setMessage] = useState('');
  const [progress, setProgress] = useState(0);
  const [jobId, setJobId] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [currentTopic, setCurrentTopic] = useState('');
  const [error, setError] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [improvementPrompt, setImprovementPrompt] = useState(null);

  const pollingRef = useRef(null);
  const shouldPollRef = useRef(false);
  const lastErrorRef = useRef(null); // Store last error to ensure persistence
  const allowErrorClearRef = useRef(false); // Flag to allow error clearing (for user actions)
  const isFailedStateRef = useRef(false); // Track if we're in failed state to prevent clearing
  const statusRef = useRef(status); // Track status in ref for use in intervals

  const startGeneration = async (topic) => {
    try {
      // Stop any existing polling
      shouldPollRef.current = false;
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }

      setStatus('processing');
      setMessage('Sending request...');
      setProgress(0);
      setAudioUrl(null);
      // Only clear error if not in failed state
      if (!isFailedStateRef.current) {
        allowErrorClearRef.current = true; // Allow clearing when starting new generation
        setError(null); // Clear previous errors when starting new generation
        lastErrorRef.current = null; // Clear error ref when starting new generation
        allowErrorClearRef.current = false;
      } else {
        console.warn('Attempted to clear error while in failed state - blocked');
      }
      setCurrentTopic(topic);

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      });

      if (!response.ok) throw new Error('Failed to start generation');

      const data = await response.json();
      setJobId(data.job_id);

    } catch (err) {
      console.error(err);
      shouldPollRef.current = false;
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      setError(`Failed to connect to server: ${err.message}. Is backend running?`);
      setStatus('idle');
    }
  };

  useEffect(() => {
    // CRITICAL: Don't do anything if status is 'failed' - error should persist
    if (status === 'failed') {
      // Ensure polling is stopped
      shouldPollRef.current = false;
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      return; // Exit early - don't interfere with error state
    }

    // Only start polling if we're processing and have a jobId
    if (status === 'processing' && jobId) {
      shouldPollRef.current = true;

      // Start polling
      pollingRef.current = setInterval(async () => {
        // Check if we should continue polling - stop if status is no longer processing
        if (!shouldPollRef.current) {
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
          }
          return;
        }

        // CRITICAL: Check status before proceeding - if already failed/completed, stop immediately
        // This prevents race conditions where status changed but callback is still executing
        try {
          const res = await fetch(`/api/status/${jobId}`);
          if (!res.ok) {
            shouldPollRef.current = false;
            if (pollingRef.current) {
              clearInterval(pollingRef.current);
              pollingRef.current = null;
            }
            // Store error in ref to ensure persistence
            const errorMsg = "Failed to check job status. Please refresh and try again.";
            lastErrorRef.current = errorMsg;
            // Set status and error atomically - React 18+ batches these automatically
            setStatus('failed');
            setError(errorMsg);
            allowErrorClearRef.current = false; // Prevent accidental clearing
            return;
          }

          const data = await res.json();

          // CRITICAL: Don't update anything if we're no longer in processing state
          // This prevents race conditions where status changed but callback executed
          if (!shouldPollRef.current) {
            return;
          }

          // Update message and progress only if still processing
          setMessage(data.message || '');
          if (data.progress !== undefined) {
            setProgress(data.progress);
          }

          // Handle completion - stop polling immediately
          if (data.status === 'completed') {
            shouldPollRef.current = false;
            if (pollingRef.current) {
              clearInterval(pollingRef.current);
              pollingRef.current = null;
            }
            setStatus('completed');
            setAudioUrl(`/api/download/${data.filename}`);
            // Capture evaluation results from API response
            if (data.evaluation) {
              setEvaluation(data.evaluation);
            }
            // Capture improvement prompt from API response
            if (data.improvement_prompt) {
              setImprovementPrompt(data.improvement_prompt);
            }
            return;
          }
          // Handle failure - stop polling immediately and set error
          else if (data.status === 'failed') {
            // Stop polling FIRST before any state updates
            shouldPollRef.current = false;
            if (pollingRef.current) {
              clearInterval(pollingRef.current);
              pollingRef.current = null;
            }

            const errorMessage = data.message || data.error || "Generation failed. Please try again.";
            console.log('Job failed with message:', errorMessage, 'Full data:', data);

            // Store error in ref FIRST to ensure persistence even if state updates fail
            lastErrorRef.current = errorMessage;

            // CRITICAL: Set status and error together - React 18+ batches these automatically
            // But we set them in order: status first, then error, to ensure error card renders
            isFailedStateRef.current = true; // Mark that we're entering failed state
            setStatus('failed');
            setError(errorMessage);
            setMessage(''); // Clear progress message
            allowErrorClearRef.current = false; // Prevent accidental clearing

            // Log for debugging
            console.log('Status set to failed, error set to:', errorMessage);
            console.log('lastErrorRef.current:', lastErrorRef.current);
            console.log('isFailedStateRef.current set to true');

            return;
          }

        } catch (err) {
          console.error("Polling error", err);
          shouldPollRef.current = false;
          // If polling fails, set error state and stop polling
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
          }
          // Store error in ref to ensure persistence
          const errorMsg = "Failed to check job status. Please refresh and try again.";
          lastErrorRef.current = errorMsg;
          // Set status and error atomically - React 18+ batches these automatically
          setStatus('failed');
          setError(errorMsg);
          allowErrorClearRef.current = false; // Prevent accidental clearing
        }
      }, 1000); // Check every 1 second for more responsive updates
    } else if (status !== 'failed') {
      // Stop polling if status is not processing (but don't interfere if status is 'failed')
      // Status 'failed' is handled above with early return
      shouldPollRef.current = false;
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    }

    // Cleanup function - but don't interfere if status is 'failed'
    return () => {
      // Only cleanup polling if status is not 'failed'
      // If status is 'failed', we want to preserve the error state
      if (status !== 'failed') {
        shouldPollRef.current = false;
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
      }
    };
  }, [status, jobId]);

  // Monitor status changes to detect if it's being reset unexpectedly
  const prevStatusRef = useRef(status);
  useEffect(() => {
    if (prevStatusRef.current !== status) {
      console.log('🔄 STATUS CHANGED:', prevStatusRef.current, '->', status);
      if (prevStatusRef.current === 'failed' && status !== 'failed') {
        console.error('🚨 CRITICAL: Status changed FROM failed TO', status, '- This should not happen!');
      }
      prevStatusRef.current = status;
      statusRef.current = status; // Update ref whenever status changes
    }
  }, [status]);

  // Monitor if error card element exists in DOM
  useEffect(() => {
    if (status === 'failed' || isFailedStateRef.current || lastErrorRef.current) {
      const checkErrorCard = () => {
        const errorCard = document.getElementById('error-card-failed-persistent');
        if (!errorCard && (status === 'failed' || lastErrorRef.current)) {
          console.error('🚨 CRITICAL: Error card element NOT FOUND in DOM! Status:', status, 'lastErrorRef:', lastErrorRef.current);
          // Try to force a re-render by updating error state
          if (lastErrorRef.current && !error) {
            console.log('🔄 Attempting to restore error from ref...');
            setError(lastErrorRef.current);
          }
        } else if (errorCard) {
          const computed = window.getComputedStyle(errorCard);
          if (computed.display === 'none' || computed.visibility === 'hidden' || computed.opacity === '0') {
            console.warn('🚨 Error card exists but is hidden! Restoring...');
            errorCard.style.setProperty('display', 'block', 'important');
            errorCard.style.setProperty('visibility', 'visible', 'important');
            errorCard.style.setProperty('opacity', '1', 'important');
          }
        }
      };
      const intervalId = setInterval(checkErrorCard, 200);
      return () => clearInterval(intervalId);
    }
  }, [status, error]);

  // CRITICAL: Monitor and restore error if it gets cleared while status is 'failed'
  // This effect runs whenever error or status changes to catch any accidental clearing
  useEffect(() => {
    console.log('useEffect [status, error] - status:', status, 'error:', error, 'isFailedStateRef:', isFailedStateRef.current);

    if (status === 'failed') {
      isFailedStateRef.current = true; // Ensure flag is set

      // Ensure polling is stopped
      shouldPollRef.current = false;
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }

      // If status is 'failed' but error is null/empty, immediately restore from ref
      if (!error && lastErrorRef.current) {
        console.warn('🚨 ERROR WAS CLEARED WHILE STATUS IS FAILED! Restoring from ref:', lastErrorRef.current);
        // Restore immediately without timeout to prevent flicker
        setError(lastErrorRef.current);
        console.log('✅ Error restored to:', lastErrorRef.current);
      }

      // Also ensure the ref is updated if error exists but ref doesn't
      if (error && !lastErrorRef.current) {
        console.log('Updating ref with error:', error);
        lastErrorRef.current = error;
      }

      // Double-check: if we have error in ref but not in state, restore it
      if (!error && lastErrorRef.current) {
        console.warn('🚨 Double-check: error state is null but ref has value. Restoring...');
        setError(lastErrorRef.current);
      }

      // If status is 'failed' but we have no error message at all, reset to idle
      if (!error && !lastErrorRef.current && !message) {
        console.warn('🚨 Status is failed but no error message exists. Resetting to idle...');
        setStatus('idle');
        isFailedStateRef.current = false;
        return; // Exit early to prevent setting up the interval
      }

      // CRITICAL: Force a re-render to ensure error card stays visible
      // This is a safety measure in case React batches updates incorrectly
      const checkInterval = setInterval(() => {
        const currentStatus = statusRef.current || status;
        const currentError = error;
        const currentRefError = lastErrorRef.current;

        console.log('🔍 Periodic check - status:', currentStatus, 'error:', !!currentError, 'ref:', !!currentRefError);

        // If status should be failed but isn't, restore it
        if ((isFailedStateRef.current || currentRefError) && currentStatus !== 'failed') {
          console.error('🚨 CRITICAL: Status should be failed but is', currentStatus, '! Restoring...');
          setStatus('failed');
        }

        // If error is missing but ref has it, restore it
        if (currentStatus === 'failed' && !currentError && currentRefError) {
          console.warn('🚨 Periodic check: Error was cleared! Restoring...');
          setError(currentRefError);
        }

        // If status is 'failed' but we have no error message at all, reset to idle
        if (currentStatus === 'failed' && !currentError && !currentRefError) {
          console.warn('🚨 Periodic check: Status is failed but no error message exists. Resetting to idle...');
          setStatus('idle');
          isFailedStateRef.current = false;
          lastErrorRef.current = null;
        }

        // Check if error card exists in DOM
        const errorCard = document.getElementById('error-card-failed-persistent');
        if (!errorCard && (currentStatus === 'failed' || currentRefError)) {
          console.error('🚨 CRITICAL: Error card missing from DOM! Forcing re-render...');
          // Force a state update to trigger re-render
          if (currentRefError) {
            setError(currentRefError);
            setStatus('failed');
          }
        }
      }, 100); // Check every 100ms

      return () => clearInterval(checkInterval);
    } else {
      // Reset flag when status is not failed
      if (isFailedStateRef.current && status !== 'failed') {
        console.log('Status changed from failed to:', status);
        isFailedStateRef.current = false;
      }
    }
  }, [status, error]); // Watch both status AND error to catch when error gets cleared

  return (
    <div className="App">
      <Hero />

      {error && status !== 'failed' && (
        <div className="glass-card error-card slide-up" style={{
          marginBottom: 'var(--spacing-xl)',
          animationDelay: '0.1s'
        }}>
          <h3 style={{
            color: 'var(--error)',
            marginBottom: 'var(--spacing-sm)',
            fontSize: 'clamp(1.5rem, 3vw, 1.8rem)'
          }}>
            Error ⚠️
          </h3>
          <p style={{
            color: 'var(--text-secondary)',
            lineHeight: 1.7,
            marginBottom: 'var(--spacing-md)'
          }}>
            {error}
          </p>
          <button
            onClick={() => {
              allowErrorClearRef.current = true; // Allow clearing for user action
              setError(null);
              lastErrorRef.current = null; // Clear error ref
              allowErrorClearRef.current = false;
              setStatus('idle');
              shouldPollRef.current = false;
              if (pollingRef.current) {
                clearInterval(pollingRef.current);
                pollingRef.current = null;
              }
            }}
            className="btn-primary"
            style={{
              background: 'rgba(255, 107, 107, 0.2)',
              border: '1px solid var(--error)',
              color: 'var(--text-primary)',
              marginTop: 'var(--spacing-sm)',
              transition: 'all var(--transition-base)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 107, 107, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 107, 107, 0.2)';
            }}
          >
            Try Again
          </button>
        </div>
      )}

      {/* Debug: Log what's being rendered */}
      {console.log('🔍 Render check - status:', status, 'error:', error, 'will render idle?', status === 'idle' && !error, 'will render processing?', status === 'processing' && !error, 'will render failed?', status === 'failed' || isFailedStateRef.current || lastErrorRef.current)}

      {/* CRITICAL: Only render other components if status is NOT failed */}
      {status !== 'failed' && status === 'idle' && !error && (
        <TopicInput onGenerate={startGeneration} isProcessing={status === 'processing'} />
      )}

      {status !== 'failed' && status === 'processing' && !error && (
        <ProgressTracker status={status} message={message} progress={progress} />
      )}

      {status !== 'failed' && status === 'completed' && audioUrl && (
        <>
          <AudioPlayer
            audioUrl={audioUrl}
            topic={currentTopic}
            onReset={() => {
              allowErrorClearRef.current = true; // Allow clearing for user action
              setStatus('idle');
              setJobId(null);
              setAudioUrl(null);
              setCurrentTopic('');
              setError(null);
              setEvaluation(null); // Clear evaluation on reset
              setImprovementPrompt(null); // Clear improvement prompt on reset
              lastErrorRef.current = null; // Clear error ref
              allowErrorClearRef.current = false;
            }}
          />
          {/* Show evaluation scorecard after audio player */}
          {evaluation && <EvaluationScoreCard evaluation={evaluation} />}
          {/* Show improvement prompt card after evaluation */}
          {improvementPrompt && <ImprovementPromptCard improvementPrompt={improvementPrompt} />}
        </>
      )}

      {/* CRITICAL: Always render error card when status is 'failed' OR when we have an error in ref */}
      {/* This ensures the error card persists even if status changes unexpectedly */}
      {(() => {
        // Only show error card if we have an actual error message (not just flags)
        const hasErrorMessage = !!(error || lastErrorRef.current || message);
        const shouldShowError = (status === 'failed' || isFailedStateRef.current) && hasErrorMessage;
        console.log('🔍 Error card render decision - status:', status, 'isFailedStateRef:', isFailedStateRef.current, 'lastErrorRef:', !!lastErrorRef.current, 'error:', !!error, 'hasErrorMessage:', hasErrorMessage, 'shouldShowError:', shouldShowError);
        if (shouldShowError && !lastErrorRef.current && error) {
          // Ensure ref is set if we have error but ref is empty
          lastErrorRef.current = error;
          console.log('📝 Setting lastErrorRef from error state:', error);
        }
        return shouldShowError;
      })() && (
          <div
            id="error-card-failed-persistent"
            key="error-card-failed-persistent"
            className="glass-card error-card slide-up"
            ref={(el) => {
              // Keep a ref to the DOM element to ensure it stays mounted and visible
              if (el) {
                const shouldBeVisible = status === 'failed' || isFailedStateRef.current || !!lastErrorRef.current || !!error;
                console.log('🔧 Error card ref callback - element exists:', !!el, 'shouldBeVisible:', shouldBeVisible);
                if (shouldBeVisible) {
                  // Force visibility with multiple methods
                  el.style.setProperty('display', 'block', 'important');
                  el.style.setProperty('visibility', 'visible', 'important');
                  el.style.setProperty('opacity', '1', 'important');
                  el.style.setProperty('z-index', '99999', 'important');
                  el.style.setProperty('position', 'relative', 'important');
                  console.log('✅ Error card DOM element forced visible');

                  // Also check periodically if it gets hidden
                  const checkVisibility = () => {
                    const computed = window.getComputedStyle(el);
                    if (computed.display === 'none' || computed.visibility === 'hidden' || computed.opacity === '0') {
                      console.warn('🚨 Error card was hidden! Restoring visibility...');
                      el.style.setProperty('display', 'block', 'important');
                      el.style.setProperty('visibility', 'visible', 'important');
                      el.style.setProperty('opacity', '1', 'important');
                    }
                  };
                  const intervalId = setInterval(checkVisibility, 100);
                  // Store interval ID on element for cleanup (using data attribute)
                  el.setAttribute('data-visibility-check-interval', intervalId.toString());
                }
              }
            }}
            style={{
              textAlign: 'center',
              marginTop: 'var(--spacing-xl)',
              animationDelay: '0.1s',
              padding: 'var(--spacing-xl)',
              maxWidth: '600px',
              marginLeft: 'auto',
              marginRight: 'auto',
              zIndex: 99999, // Very high z-index to ensure it's on top
              position: 'relative',
              display: 'block', // Force display
              visibility: 'visible',
              opacity: 1,
              pointerEvents: 'auto'
            }}>
            <h2 style={{
              marginBottom: 'var(--spacing-md)',
              fontSize: 'clamp(2rem, 4vw, 2.5rem)',
              color: 'var(--error)'
            }}>
              {(() => {
                // Defensive check: use error, message, or ref as fallback - prioritize ref for persistence
                const errorText = error || lastErrorRef.current || message || '';
                const isNotFound = errorText.includes("Topic not found") ||
                  errorText.includes("not found") ||
                  errorText.includes("not available");
                return isNotFound
                  ? "Topic Not Found 🤷‍♂️"
                  : "Oops! Something broke. 📉";
              })()}
            </h2>
            <p
              id="error-message-display"
              style={{
                color: 'var(--text-secondary)',
                marginBottom: 'var(--spacing-lg)',
                lineHeight: 1.7,
                fontSize: 'clamp(1rem, 2vw, 1.2rem)',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                minHeight: '3em', // Ensure space for message
                visibility: 'visible', // Force visibility
                opacity: 1 // Force opacity
              }}>
              {/* Prioritize error state, then ref (most persistent), then message */}
              {(() => {
                const displayError = error || lastErrorRef.current || message;
                console.log('🎯 Rendering error card - status:', status, 'error:', error, 'ref:', lastErrorRef.current, 'isFailedStateRef:', isFailedStateRef.current, 'displayError:', displayError);
                // This should never happen due to the condition above, but just in case
                if (!displayError) {
                  console.error('⚠️ Error card rendering but no error message available! This should not happen.');
                  return "An unknown error occurred. Please try again.";
                }
                return displayError;
              })()}
            </p>
            <button
              onClick={() => {
                // Stop any polling
                shouldPollRef.current = false;
                if (pollingRef.current) {
                  clearInterval(pollingRef.current);
                  pollingRef.current = null;
                }
                // Reset all state
                allowErrorClearRef.current = true; // Allow clearing for user action
                setStatus('idle');
                setError(null);
                lastErrorRef.current = null; // Clear error ref
                allowErrorClearRef.current = false;
                setJobId(null);
                setAudioUrl(null);
                setCurrentTopic('');
                setMessage('');
                setProgress(0);
              }}
              className="btn-primary"
              style={{
                marginTop: 'var(--spacing-sm)',
                maxWidth: '300px',
                margin: 'var(--spacing-sm) auto 0'
              }}
            >
              Try Different Topic
            </button>
          </div>
        )}
    </div>
  );
}

export default App;
