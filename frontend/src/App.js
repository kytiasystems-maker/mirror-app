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

  const quotePool = {
    anxious: [
      { text: "We suffer more often in imagination than in reality.", author: "— Seneca" },
      { text: "What doesn't kill me makes me stronger.", author: "— Nietzsche" },
      { text: "Man is not worried by real problems so much as by his imagined anxieties about real problems.", author: "— Epictetus" },
      { text: "The mind that is anxious about future events is miserable.", author: "— Seneca" },
      { text: "Anxiety is the dizziness of freedom.", author: "— Kierkegaard" },
      { text: "He who is not everyday conquering some fear has not learned the secret of life.", author: "— Ralph Waldo Emerson" },
      { text: "Nothing in the affairs of men is worthy of great anxiety.", author: "— Plato" }
    ],
    angry: [
      { text: "How much more grievous are the consequences of anger than the causes of it.", author: "— Marcus Aurelius" },
      { text: "Anger is a momentary madness, so control your passion or it will control you.", author: "— Horace" },
      { text: "The best fighter is never angry.", author: "— Lao Tzu" },
      { text: "Speak when you are angry and you will make the best speech you will ever regret.", author: "— Ambrose Bierce" },
      { text: "For every minute you remain angry, you give up sixty seconds of peace of mind.", author: "— Emerson" },
      { text: "Anybody can become angry — that is easy. But to be angry with the right person, to the right degree, at the right time — that is not easy.", author: "— Aristotle" },
      { text: "Let your enemies be disarmed by the gentleness of your manner, but at the same time let your friends see what mettle you are made of.", author: "— Machiavelli" }
    ],
    calm: [
      { text: "The greatest victory is to conquer yourself.", author: "— Plato" },
      { text: "Nothing can disturb you but your own imaginings.", author: "— Epictetus" },
      { text: "The soul becomes dyed with the color of its thoughts.", author: "— Marcus Aurelius" },
      { text: "To the mind that is still, the whole universe surrenders.", author: "— Lao Tzu" },
      { text: "Calmness is the cradle of power.", author: "— J.G. Holland" },
      { text: "In the midst of movement and chaos, keep stillness inside of you.", author: "— Deepak Chopra" },
      { text: "The wise man does not expose himself needlessly to danger, since there are few things for which he cares sufficiently.", author: "— Aristotle" }
    ],
    sad: [
      { text: "The keenest sorrow is to recognize ourselves as the sole cause of all our adversities.", author: "— Sophocles" },
      { text: "Even a happy life cannot be without a measure of darkness.", author: "— Jung" },
      { text: "One must still have chaos in oneself to be able to give birth to a dancing star.", author: "— Nietzsche" },
      { text: "The wound is the place where the Light enters you.", author: "— Rumi" },
      { text: "Sadness is but a wall between two gardens.", author: "— Kahlil Gibran" },
      { text: "Man performs and engenders so much more than he can or should have to bear. That is what is truly terrible.", author: "— Cormac McCarthy" },
      { text: "There is no education like adversity.", author: "— Disraeli" }
    ],
    lost: [
      { text: "Not all those who wander are lost.", author: "— Tolkien" },
      { text: "He who has a why to live can bear almost any how.", author: "— Nietzsche" },
      { text: "In the middle of difficulty lies opportunity.", author: "— Einstein" },
      { text: "A man who does not know what he wants from life accepts anything.", author: "— Schopenhauer" },
      { text: "I am not lost, for I know where I am. But however, where I am may be lost.", author: "— Winnie the Pooh" },
      { text: "No man ever steps in the same river twice, for it's not the same river and he's not the same man.", author: "— Heraclitus" },
      { text: "I took a deep breath and listened to the old brag of my heart: I am, I am, I am.", author: "— Sylvia Plath" }
    ],
    confused: [
      { text: "Until you make the unconscious conscious, it will direct your life and you will call it fate.", author: "— Jung" },
      { text: "The privilege of a lifetime is to become who you truly are.", author: "— Jung" },
      { text: "The most confused we ever get is when we're trying to convince our heads of something our heart knows is a lie.", author: "— Karen Moning" },
      { text: "Confusion is a word we have invented for an order which is not yet understood.", author: "— Henry Miller" },
      { text: "In all chaos there is a cosmos, in all disorder a secret order.", author: "— Jung" },
      { text: "He who thinks he knows, doesn't know. He who knows that he doesn't know, knows.", author: "— Lao Tzu" },
      { text: "I am not what happened to me, I am what I choose to become.", author: "— Jung" }
    ],
    hopeful: [
      { text: "Hope is the worst of evils, for it prolongs the torment of man.", author: "— Nietzsche" },
      { text: "He that can have patience can have what he will.", author: "— Benjamin Franklin" },
      { text: "Learn from yesterday, live for today, hope for tomorrow.", author: "— Einstein" },
      { text: "Hope is a waking dream.", author: "— Aristotle" },
      { text: "The very least you can do in your life is figure out what you hope for.", author: "— Barbara Kingsolver" },
      { text: "Hope is being able to see that there is light despite all of the darkness.", author: "— Desmond Tutu" },
      { text: "Where there is no hope, it is incumbent on us to invent it.", author: "— Camus" }
    ],
    neutral: [
      { text: "Know thyself.", author: "— Socrates" },
      { text: "The unexamined life is not worth living.", author: "— Socrates" },
      { text: "Observe all men, thyself most.", author: "— Benjamin Franklin" },
      { text: "He who knows others is wise. He who knows himself is enlightened.", author: "— Lao Tzu" },
      { text: "Most powerful is he who has himself in his own power.", author: "— Seneca" },
      { text: "To conquer oneself is a greater victory than to conquer thousands in a battle.", author: "— Buddha" },
      { text: "It is not that I am mad, it is only that my head is different from yours.", author: "— Diogenes" }
    ]
  };

  // Rotate quotes daily — same quote for everyone on same day, different each day
  const getDailyQuote = (mood) => {
    const pool = quotePool[mood] || quotePool.neutral;
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    return pool[dayOfYear % pool.length];
  };

  const quotes = Object.fromEntries(
    Object.keys(quotePool).map(m => [m, getDailyQuote(m)])
  );

  useEffect(() => {
    // Generate a persistent anonymous user ID — links mood history to The Veil
    let uid = localStorage.getItem('mirrorUserId');
    if (!uid) {
      uid = (crypto.randomUUID && crypto.randomUUID()) ||
        'm-' + Date.now() + '-' + Math.random().toString(36).slice(2);
      localStorage.setItem('mirrorUserId', uid);
    }

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

  const getUserId = () => localStorage.getItem('mirrorUserId');

  const handleCheckIn = () => {
    if (!mood) return;
    const userId = getUserId();

    // If email provided, save it to The Veil
    if (email) {
      fetch(API_ENDPOINTS.EMAIL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, mood, userId })
      }).then(() => {
        localStorage.setItem('emailCollected', 'true');
        proceedToQuote();
      });
    } else {
      proceedToQuote();
    }
  };

  const proceedToQuote = () => {
    const userId = getUserId();
    fetch(API_ENDPOINTS.MOOD, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mood, reflection: email || '', userId })
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
              You've been seen. After a week of honesty, the Veil lifts — and shows you what you've been missing.
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
            Enter your email. After a week of honest check-ins, The Veil lifts — a reflection on the patterns you didn't know you were showing.
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
