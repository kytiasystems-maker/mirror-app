// The Veil — Pattern Analysis Engine
// Analyzes a user's mood history and surfaces the single most relevant
// insight about THEM — never a generic quote.

const MS_DAY = 24 * 60 * 60 * 1000;

// Curated "Veil-tier" quotes — deeper, rarer than the daily set.
// These are only ever delivered through The Veil, never on the home screen.
const VEIL_QUOTES = {
  anxious: [
    { text: "We suffer more often in imagination than in reality.", author: "Seneca" },
    { text: "Man is not worried by real problems so much as by his imagined anxieties about real problems.", author: "Epictetus" }
  ],
  angry: [
    { text: "How much more grievous are the consequences of anger than the causes of it.", author: "Marcus Aurelius" },
    { text: "Anger is a momentary madness, so control your passion or it will control you.", author: "Horace" }
  ],
  calm: [
    { text: "Nothing can disturb you but your own imaginings.", author: "Epictetus" },
    { text: "The soul becomes dyed with the color of its thoughts.", author: "Marcus Aurelius" }
  ],
  sad: [
    { text: "The wound is the place where the Light enters you.", author: "Rumi" },
    { text: "What is now proved was once only imagined.", author: "William Blake" }
  ],
  lost: [
    { text: "Not all those who wander are lost.", author: "Tolkien" },
    { text: "He who has a why to live can bear almost any how.", author: "Nietzsche" }
  ],
  confused: [
    { text: "The privilege of a lifetime is to become who you truly are.", author: "Jung" },
    { text: "Until you make the unconscious conscious, it will direct your life and you will call it fate.", author: "Jung" }
  ],
  hopeful: [
    { text: "He that can have patience can have what he will.", author: "Benjamin Franklin" },
    { text: "Fall seven times, stand up eight.", author: "Japanese proverb" }
  ],
  neutral: [
    { text: "Know thyself.", author: "Socrates" },
    { text: "The unexamined life is not worth living.", author: "Socrates" }
  ]
};

function pickVeilQuote(mood) {
  const pool = VEIL_QUOTES[mood] || VEIL_QUOTES.neutral;
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Returns entries for a given user within the last N days.
 */
function entriesForUser(moodLog, userId, days = 14) {
  const cutoff = Date.now() - days * MS_DAY;
  return moodLog
    .filter(e => e.userId === userId && e.timestamp >= cutoff)
    .sort((a, b) => a.timestamp - b.timestamp);
}

/**
 * Counts consecutive distinct check-in days, ending today or yesterday.
 */
function consecutiveDays(entries) {
  if (entries.length === 0) return 0;
  const days = [...new Set(entries.map(e => new Date(e.timestamp).toDateString()))]
    .map(d => new Date(d).getTime())
    .sort((a, b) => b - a);

  let streak = 1;
  for (let i = 0; i < days.length - 1; i++) {
    const diff = (days[i] - days[i + 1]) / MS_DAY;
    if (diff === 1) {
      streak++;
    } else {
      break;
    }
  }

  const today = new Date().toDateString();
  const mostRecent = new Date(days[0]).toDateString();
  const yesterday = new Date(Date.now() - MS_DAY).toDateString();
  if (mostRecent !== today && mostRecent !== yesterday) return 0;

  return streak;
}

/**
 * Mood frequency over the period.
 */
function moodFrequency(entries) {
  const counts = {};
  entries.forEach(e => {
    counts[e.mood] = (counts[e.mood] || 0) + 1;
  });
  return counts;
}

/**
 * Finds the most common A -> B transition within `withinDays`.
 */
function topTransition(entries, withinDays = 2) {
  const transitions = {};
  for (let i = 0; i < entries.length - 1; i++) {
    const from = entries[i];
    const to = entries[i + 1];
    if (from.mood === to.mood) continue;
    const gapDays = (to.timestamp - from.timestamp) / MS_DAY;
    if (gapDays <= withinDays) {
      const key = `${from.mood}->${to.mood}`;
      transitions[key] = (transitions[key] || 0) + 1;
    }
  }

  let best = null;
  let bestCount = 0;
  for (const [key, count] of Object.entries(transitions)) {
    if (count > bestCount) {
      bestCount = count;
      best = key;
    }
  }

  if (!best || bestCount < 2) return null;
  const [from, to] = best.split('->');
  return { from, to, count: bestCount };
}

/**
 * Compares mood frequency between this week and last week.
 */
function weekOverWeekShift(allEntries) {
  const now = Date.now();
  const thisWeek = allEntries.filter(e => now - e.timestamp <= 7 * MS_DAY);
  const lastWeek = allEntries.filter(e => {
    const age = now - e.timestamp;
    return age > 7 * MS_DAY && age <= 14 * MS_DAY;
  });

  if (thisWeek.length === 0 || lastWeek.length === 0) return null;

  const thisFreq = moodFrequency(thisWeek);
  const lastFreq = moodFrequency(lastWeek);

  let maxDrop = null;
  for (const mood of Object.keys(lastFreq)) {
    const before = lastFreq[mood];
    const after = thisFreq[mood] || 0;
    const drop = before - after;
    if (drop >= 2 && (!maxDrop || drop > maxDrop.drop)) {
      maxDrop = { mood, before, after, drop };
    }
  }

  let maxRise = null;
  for (const mood of Object.keys(thisFreq)) {
    const before = lastFreq[mood] || 0;
    const after = thisFreq[mood];
    const rise = after - before;
    if (rise >= 2 && (!maxRise || rise > maxRise.rise)) {
      maxRise = { mood, before, after, rise };
    }
  }

  if (maxDrop) return { type: 'drop', ...maxDrop };
  if (maxRise) return { type: 'rise', ...maxRise };
  return null;
}

/**
 * Main entry point: generates the single most relevant Veil insight
 * for a user, given their full mood history.
 *
 * Returns null if the user hasn't earned a Veil yet (< minDays).
 */
function generateVeilInsight(moodLog, userId, minDays = 7) {
  const entries14 = entriesForUser(moodLog, userId, 14);
  const entries7 = entriesForUser(moodLog, userId, 7);

  const streak = consecutiveDays(entries14);
  if (streak < minDays && entries14.length < minDays) {
    return null;
  }

  const candidates = [];

  // 1. Week-over-week shift (most narratively powerful — prioritize)
  const shift = weekOverWeekShift(entries14);
  if (shift) {
    if (shift.type === 'drop') {
      candidates.push({
        priority: 3,
        mood: shift.mood,
        text: `Last week, you logged "${shift.mood}" ${shift.before} times. This week, just ${shift.after}. Something shifted — and you may not have noticed it happening.`
      });
    } else {
      candidates.push({
        priority: 3,
        mood: shift.mood,
        text: `"${shift.mood}" appeared ${shift.rise > 1 ? `${shift.rise} more times` : 'more often'} this week than last. Worth asking what changed — or what didn't.`
      });
    }
  }

  // 2. Transition pattern
  const transition = topTransition(entries14);
  if (transition) {
    candidates.push({
      priority: 2,
      mood: transition.to,
      text: `${transition.count} times, "${transition.from}" was followed by "${transition.to}" within a day or two. Your mind moves through this faster than you give it credit for.`
    });
  }

  // 3. Dominant mood
  const freq = moodFrequency(entries14);
  const moodEntries = Object.entries(freq).sort((a, b) => b[1] - a[1]);
  if (moodEntries.length > 0) {
    const [topMood, topCount] = moodEntries[0];
    const pct = Math.round((topCount / entries14.length) * 100);
    if (pct >= 40) {
      candidates.push({
        priority: 1,
        mood: topMood,
        text: `In the last ${entries14.length > 7 ? '14' : '7'} days, "${topMood}" showed up ${topCount} times — about ${pct}% of your check-ins. That's not random. It's the lens you've been looking through.`
      });
    }
  }

  // 4. Consistency (fallback if nothing else stands out)
  candidates.push({
    priority: 0,
    mood: moodEntries[0] ? moodEntries[0][0] : 'neutral',
    text: `You've shown up ${streak >= minDays ? streak : entries14.length} times in the last two weeks. Most people stop by day five. You didn't.`
  });

  // Pick highest priority candidate
  candidates.sort((a, b) => b.priority - a.priority);
  const chosen = candidates[0];
  const quote = pickVeilQuote(chosen.mood);

  return {
    insight: chosen.text,
    quote: quote.text,
    quoteAuthor: quote.author,
    daysAnalyzed: entries14.length,
    streak
  };
}

module.exports = {
  generateVeilInsight,
  consecutiveDays,
  moodFrequency,
  entriesForUser
};
