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
    proceedToQuote();
  };

  // ── Philosophical profiles ──────────────────────────────────────────────
  const profiles = {
    anxious:  {
      archetype: 'The Seeker',
      philosopher: 'Kierkegaard',
      description: 'Your mind lives in questions, not answers. That restlessness is not a flaw — it is exactly what drove the greatest thinkers of anxiety to their deepest work.',
      book: 'The Concept of Anxiety',
      bookAuthor: 'Søren Kierkegaard'
    },
    angry: {
      archetype: 'The Rebel',
      philosopher: 'Nietzsche',
      description: 'The contradiction you carry is not chaos. It is the creative tension from which people who actually change things are made.',
      book: 'Thus Spoke Zarathustra',
      bookAuthor: 'Friedrich Nietzsche'
    },
    calm: {
      archetype: 'The Stoic',
      philosopher: 'Marcus Aurelius',
      description: 'Your detachment is not indifference. It is controlled power. The people around you feel it, even when they cannot name it.',
      book: 'Meditations',
      bookAuthor: 'Marcus Aurelius'
    },
    sad: {
      archetype: 'The Witness',
      philosopher: 'Schopenhauer',
      description: 'You see things others prefer to ignore. That clarity is uncomfortable — and it is also rare. Most people spend their lives avoiding what you face directly.',
      book: 'The World as Will and Representation',
      bookAuthor: 'Arthur Schopenhauer'
    },
    lost: {
      archetype: 'The Wanderer',
      philosopher: 'Camus',
      description: 'You are not lost. You are between versions of yourself. That space feels formless — but it is where every real transformation begins.',
      book: 'The Myth of Sisyphus',
      bookAuthor: 'Albert Camus'
    },
    confused: {
      archetype: 'The Shadow',
      philosopher: 'Jung',
      description: 'The parts of yourself you cannot name yet are not your enemy. Jung called this the shadow — and integrating it is the work most people never begin.',
      book: 'Modern Man in Search of a Soul',
      bookAuthor: 'Carl Jung'
    },
    hopeful: {
      archetype: 'The Builder',
      philosopher: 'Seneca',
      description: 'Hope without direction is postponed anxiety. Hope with a clear eye — the kind Seneca wrote about — is the rarest form of discipline.',
      book: 'Letters from a Stoic',
      bookAuthor: 'Seneca'
    },
    neutral: {
      archetype: 'The Observer',
      philosopher: 'Epictetus',
      description: 'Stillness that is chosen is not emptiness. It is the position from which everything else can be seen clearly. Very few people ever reach it.',
      book: 'Discourses',
      bookAuthor: 'Epictetus'
    }
  };

  // ── Daily prediction based on history ───────────────────────────────────
  const getDailyPrediction = (currentMood) => {
    const history = JSON.parse(localStorage.getItem('moodHistory') || '[]');

    // Need at least 5 entries for a real pattern
    if (history.length < 5) {
      return {
        type: 'generic',
        text: `Most people who choose "${currentMood}" today will not return tomorrow. You already have.`,
        isGeneric: true
      };
    }

    // Count how many times this mood was followed by each other mood
    const transitions = {};
    for (let i = 0; i < history.length - 1; i++) {
      if (history[i].mood === currentMood) {
        const next = history[i + 1].mood;
        transitions[next] = (transitions[next] || 0) + 1;
      }
    }

    // Find most common next mood
    const nextMood = Object.entries(transitions).sort((a,b) => b[1]-a[1])[0];

    // Check day-of-week pattern
    const today = new Date().getDay();
    const dayMoods = history.filter(e => new Date(e.timestamp).getDay() === today);
    const dayFreq = {};
    dayMoods.forEach(e => { dayFreq[e.mood] = (dayFreq[e.mood] || 0) + 1; });
    const dominantDay = Object.entries(dayFreq).sort((a,b) => b[1]-a[1])[0];
    const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

    if (nextMood && nextMood[1] >= 2) {
      const isPositiveShift = ['calm','hopeful','neutral'].includes(nextMood[0]);
      return {
        type: 'transition',
        text: isPositiveShift
          ? `${nextMood[1]} times after "${currentMood}", what followed was "${nextMood[0]}". Tomorrow may already be different.`
          : `After "${currentMood}", your pattern moves toward "${nextMood[0]}". You have seen this before. You know how it ends.`,
        isGeneric: false
      };
    }

    if (dominantDay && dominantDay[1] >= 2 && dominantDay[0] === currentMood) {
      return {
        type: 'daypattern',
        text: `${days[today]}s tend to bring "${currentMood}" for you. This is not coincidence — it is a pattern worth examining.`,
        isGeneric: false
      };
    }

    const count = history.filter(e => e.mood === currentMood).length;
    const pct = Math.round((count / history.length) * 100);
    return {
      type: 'frequency',
      text: `"${currentMood}" has appeared in ${pct}% of your check-ins. The mirror has been showing you the same thing for a while now.`,
      isGeneric: false
    };
  };

  const proceedToQuote = () => {
    const userId = getUserId();

    // Save mood to local history for pattern analysis
    const history = JSON.parse(localStorage.getItem('moodHistory') || '[]');
    history.push({ mood, timestamp: Date.now() });
    if (history.length > 90) history.shift(); // keep last 90 days
    localStorage.setItem('moodHistory', JSON.stringify(history));

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
    const profile = profiles[mood] || profiles.neutral;
    const prediction = getDailyPrediction(mood);
    const emailCollected = localStorage.getItem('emailCollected');

    return (
      <div style={{
        minHeight: '100vh',
        background: bgColor,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        fontFamily: 'Georgia, serif',
        padding: '3em 2em',
        color: textColor
      }}>
        <h1 style={{
          fontSize: '1.4em',
          fontWeight: 300,
          letterSpacing: '6px',
          marginBottom: '3em',
          textTransform: 'uppercase',
          color: accentColor,
          alignSelf: 'center'
        }}>Mirror</h1>

        {/* ── Philosophical Profile ── */}
        <div style={{
          maxWidth: '480px',
          width: '100%',
          marginBottom: '3em',
          textAlign: 'center'
        }}>
          <p style={{
            fontSize: '0.7em',
            letterSpacing: '3px',
            color: accentColor,
            textTransform: 'uppercase',
            marginBottom: '0.8em'
          }}>Your profile</p>
          <p style={{
            fontSize: '2em',
            fontWeight: 300,
            letterSpacing: '2px',
            marginBottom: '0.3em',
            color: textColor
          }}>{profile.archetype}</p>
          <p style={{
            fontSize: '0.85em',
            letterSpacing: '2px',
            color: accentColor,
            marginBottom: '1.8em'
          }}>— {profile.philosopher}</p>
          <p style={{
            fontSize: '1em',
            lineHeight: '1.9',
            color: textColor,
            opacity: 0.85,
            fontStyle: 'italic'
          }}>{profile.description}</p>
        </div>

        {/* ── Divider ── */}
        <div style={{
          width: '40px',
          height: '1px',
          background: 'rgba(160,160,160,0.25)',
          marginBottom: '3em'
        }} />

        {/* ── Daily Prediction ── */}
        <div style={{
          maxWidth: '480px',
          width: '100%',
          marginBottom: '3em',
          textAlign: 'center'
        }}>
          <p style={{
            fontSize: '0.7em',
            letterSpacing: '3px',
            color: accentColor,
            textTransform: 'uppercase',
            marginBottom: '1.5em'
          }}>{prediction.isGeneric ? 'Today' : 'Your pattern'}</p>
          <p style={{
            fontSize: '1.1em',
            lineHeight: '1.9',
            color: textColor,
            opacity: 0.9
          }}>{prediction.text}</p>
        </div>

        {/* ── Divider ── */}
        <div style={{
          width: '40px',
          height: '1px',
          background: 'rgba(160,160,160,0.25)',
          marginBottom: '3em'
        }} />

        {/* ── Book Recommendation ── */}
        <div style={{
          maxWidth: '480px',
          width: '100%',
          marginBottom: '3em',
          textAlign: 'center'
        }}>
          <p style={{
            fontSize: '0.7em',
            letterSpacing: '3px',
            color: accentColor,
            textTransform: 'uppercase',
            marginBottom: '1.5em'
          }}>Read next</p>
          <p style={{
            fontSize: '1.1em',
            fontStyle: 'italic',
            color: textColor,
            marginBottom: '0.4em'
          }}>{profile.book}</p>
          <p style={{
            fontSize: '0.85em',
            color: accentColor,
            letterSpacing: '1px'
          }}>— {profile.bookAuthor}</p>
        </div>

        {/* ── Veil CTA (only if no email yet) ── */}
        {!emailCollected && (
          <>
            <div style={{
              width: '40px',
              height: '1px',
              background: 'rgba(160,160,160,0.25)',
              marginBottom: '3em'
            }} />
            <div style={{
              maxWidth: '480px',
              width: '100%',
              marginBottom: '3em',
              textAlign: 'center'
            }}>
              <p style={{
                fontSize: '0.7em',
                letterSpacing: '3px',
                color: accentColor,
                textTransform: 'uppercase',
                marginBottom: '1em'
              }}>The Veil</p>
              <p style={{
                fontSize: '0.9em',
                lineHeight: '1.8',
                color: textColor,
                opacity: 0.65,
                marginBottom: '1.5em'
              }}>After a week of check-ins, Mirror reads your actual patterns — not archetypes, but yours specifically. Leave an email if you want that.</p>
              <div style={{ display: 'flex', gap: '0.8em', justifyContent: 'center', flexWrap: 'wrap' }}>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(160,160,160,0.25)',
                    color: textColor,
                    padding: '0.6em 1em',
                    fontFamily: 'Georgia, serif',
                    fontSize: '0.85em',
                    outline: 'none',
                    width: '220px'
                  }}
                />
                <button
                  onClick={() => {
                    if (!email) return;
                    const userId = getUserId();
                    fetch(API_ENDPOINTS.EMAIL, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ email, mood, userId })
                    }).then(() => {
                      localStorage.setItem('emailCollected', 'true');
                      setEmail('');
                    });
                  }}
                  style={{
                    background: 'transparent',
                    color: accentColor,
                    border: '1px solid rgba(160,160,160,0.3)',
                    padding: '0.6em 1.2em',
                    cursor: 'pointer',
                    fontSize: '0.8em',
                    letterSpacing: '1px',
                    fontFamily: 'Georgia, serif'
                  }}
                >Enter</button>
              </div>
            </div>
          </>
        )}

        {/* ── Return ── */}
        <button
          onClick={() => {
            setSubmitted(false);
            setShowQuote(false);
            setMood('');
            setEmail('');
          }}
          style={{
            background: 'transparent',
            color: accentColor,
            border: '1px solid rgba(160,160,160,0.2)',
            padding: '0.8em 2.5em',
            cursor: 'pointer',
            fontSize: '0.8em',
            letterSpacing: '3px',
            fontFamily: 'Georgia, serif',
            marginTop: '1em',
            textTransform: 'uppercase'
          }}
          onMouseEnter={e => e.target.style.borderColor = accentColor}
          onMouseLeave={e => e.target.style.borderColor = 'rgba(160,160,160,0.2)'}
        >Return</button>
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
