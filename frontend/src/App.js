import React, { useEffect, useState } from 'react';
import { API_ENDPOINTS } from './api.config';

function App() {
  const [mood, setMood] = useState('');
  const [reflection, setReflection] = useState('');
  const [quote, setQuote] = useState('');
  const [showQuote, setShowQuote] = useState(false);
  const [email, setEmail] = useState('');
  const [showEmailPrompt, setShowEmailPrompt] = useState(false);
  const [checkInCount, setCheckInCount] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const quotes = {
    anxious: {
      text: "What doesn't kill me makes me stronger.",
      author: "— Nietzsche"
    },
    angry: {
      text: "Never waste your anger on people who don't deserve it.",
      author: "— Marcus Aurelius"
    },
    calm: {
      text: "The greatest victory is to conquer yourself.",
      author: "— Plato"
    },
    sad: {
      text: "Suffering tests the strength of men.",
      author: "— Seneca"
    },
    lost: {
      text: "A man who doesn't know what he wants from life accepts anything.",
      author: "— Schopenhauer"
    },
    confused: {
      text: "Your own confusion is a form of understanding.",
      author: "— Jung"
    },
    hopeful: {
      text: "Hope is the worst of evils, for it prolongs the torment of man.",
      author: "— Nietzsche"
    },
    neutral: {
      text: "Observe yourself as you would allow anyone else to.",
      author: "— Machiavelli"
    }
  };

  useEffect(() => {
    const savedCount = localStorage.getItem('checkInCount');
    if (savedCount) {
      setCheckInCount(parseInt(savedCount));
    }
    const lastCheckIn = localStorage.getItem('lastCheckInDate');
    const today = new Date().toDateString();
    if (lastCheckIn === today) {
      setSubmitted(true);
    }
  }, []);

  const handleCheckIn = () => {
    if (!mood) return;
    
    // If email provided, save it to The Veil
    if (email) {
      fetch(API_ENDPOINTS.EMAIL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, mood })
      }).then(() => {
        localStorage.setItem('emailCollected', 'true');
        proceedToQuote();
      });
    } else {
      proceedToQuote();
    }
  };

  const proceedToQuote = () => {
    fetch(API_ENDPOINTS.MOOD, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mood, reflection: email || '' })
    }).then(() => {
      const newCount = checkInCount + 1;
      setCheckInCount(newCount);
      localStorage.setItem('checkInCount', newCount);
      localStorage.setItem('lastCheckInDate', new Date().toDateString());

      const selectedQuote = quotes[mood] || quotes.neutral;
      setQuote(selectedQuote);
      setShowQuote(true);
      setSubmitted(true);
    });
  };

  const bgColor = '#0a0a0a';
  const textColor = '#e0e0e0';
  const accentColor = '#a8a8a8';
  const darkGray = '#1a1a1a';

  if (submitted && showQuote) {
    return (
      <div style={{
        minHeight: '100vh',
        background: bgColor,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Georgia, serif',
        padding: '2em',
        color: textColor
      }}>
        <h1 style={{
          fontSize: '2.2em',
          fontWeight: 300,
          letterSpacing: '4px',
          marginBottom: '3em',
          textTransform: 'uppercase',
          color: accentColor
        }}>Mirror</h1>

        <div style={{
          maxWidth: '500px',
          textAlign: 'center',
          marginBottom: '4em'
        }}>
          <p style={{
            fontSize: '1.4em',
            fontStyle: 'italic',
            lineHeight: '1.8',
            marginBottom: '1.5em',
            color: textColor
          }}>
            {quote.text}
          </p>
          <p style={{
            fontSize: '0.95em',
            color: accentColor,
            letterSpacing: '2px'
          }}>
            {quote.author}
          </p>
        </div>

        <div style={{
          maxWidth: '500px',
          minHeight: '200px',
          borderTop: '1px solid rgba(160, 160, 160, 0.2)',
          paddingTop: '2em',
          marginBottom: '3em'
        }}>
          <p style={{
            color: accentColor,
            fontSize: '0.85em',
            letterSpacing: '1px',
            marginBottom: '1em'
          }}>
            The Veil
          </p>
          {email && (
            <p style={{
              color: textColor,
              fontSize: '0.85em',
              lineHeight: '1.6',
              opacity: 0.8
            }}>
              You've been seen. Monthly clarity awaits your inbox.
            </p>
          )}
        </div>

        <button
          onClick={() => {
            setSubmitted(false);
            setShowQuote(false);
            setMood('');
            setReflection('');
          }}
          style={{
            background: 'transparent',
            color: accentColor,
            border: '1px solid rgba(160, 160, 160, 0.3)',
            padding: '0.8em 2em',
            cursor: 'pointer',
            fontSize: '0.9em',
            letterSpacing: '2px',
            transition: 'all 0.3s ease',
            fontFamily: 'Georgia, serif'
          }}
          onMouseEnter={(e) => e.target.style.borderColor = accentColor}
          onMouseLeave={(e) => e.target.style.borderColor = 'rgba(160, 160, 160, 0.3)'}
        >
          Return
        </button>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: bgColor,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Georgia, serif',
      padding: '2em',
      color: textColor
    }}>
      <h1 style={{
        fontSize: '3em',
        fontWeight: 300,
        letterSpacing: '4px',
        marginBottom: '3em',
        textTransform: 'uppercase',
        color: accentColor
      }}>Mirror</h1>

      <div style={{
        maxWidth: '500px',
        textAlign: 'center',
        marginBottom: '3em'
      }}>
        <p style={{
          fontSize: '1.2em',
          fontWeight: 300,
          letterSpacing: '1px',
          marginBottom: '2em',
          color: textColor
        }}>
          How are you, really?
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1em',
          marginBottom: '2em'
        }}>
          {Object.keys(quotes).map((m) => (
            <button
              key={m}
              onClick={() => setMood(m)}
              style={{
                background: mood === m ? darkGray : 'transparent',
                color: mood === m ? '#fff' : accentColor,
                border: `1px solid ${mood === m ? accentColor : 'rgba(160, 160, 160, 0.2)'}`,
                padding: '1em',
                cursor: 'pointer',
                fontSize: '0.9em',
                letterSpacing: '1px',
                fontFamily: 'Georgia, serif',
                textTransform: 'capitalize',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                if (mood !== m) e.target.style.borderColor = accentColor;
              }}
              onMouseLeave={(e) => {
                if (mood !== m) e.target.style.borderColor = 'rgba(160, 160, 160, 0.2)';
              }}
            >
              {m}
            </button>
          ))}
        </div>

        <div style={{
          width: '100%',
          marginBottom: '2em'
        }}>
          <p style={{
            fontSize: '0.9em',
            color: accentColor,
            letterSpacing: '1px',
            marginBottom: '1.5em',
            fontStyle: 'italic'
          }}>
            Enter your email to receive The Veil — monthly philosophical insights based on your mood.
          </p>
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleCheckIn(); }}
            style={{
              width: '100%',
              background: 'transparent',
              border: '1px solid rgba(160, 160, 160, 0.2)',
              color: textColor,
              padding: '1em',
              fontFamily: 'Georgia, serif',
              fontSize: '0.95em',
              boxSizing: 'border-box',
              lineHeight: '1.6'
            }}
          />
        </div>

        <button
          onClick={handleCheckIn}
          disabled={!mood}
          style={{
            background: mood ? 'transparent' : 'rgba(160, 160, 160, 0.1)',
            color: accentColor,
            border: `1px solid ${mood ? accentColor : 'rgba(160, 160, 160, 0.2)'}`,
            padding: '1em 3em',
            cursor: mood ? 'pointer' : 'not-allowed',
            fontSize: '0.95em',
            letterSpacing: '2px',
            fontFamily: 'Georgia, serif',
            transition: 'all 0.3s ease',
            textTransform: 'uppercase'
          }}
          onMouseEnter={(e) => {
            if (mood) e.target.style.borderColor = '#fff';
          }}
          onMouseLeave={(e) => {
            if (mood) e.target.style.borderColor = accentColor;
          }}
        >
          Check In
        </button>
      </div>

      <div style={{
        position: 'fixed',
        bottom: '2em',
        fontSize: '0.8em',
        color: accentColor,
        opacity: 0.5,
        letterSpacing: '1px'
      }}>
        {checkInCount > 0 && `${checkInCount} reflections`}
      </div>
    </div>
  );
}

export default App;
