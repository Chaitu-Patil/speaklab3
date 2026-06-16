import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isCasualMessage(text: string): boolean {
  const t = text.trim().toLowerCase();
  if (t.length < 60) {
    const casualPhrases = [
      'ok', 'okay', 'thanks', 'thank you', 'got it', 'cool', 'great', 'nice',
      'sounds good', 'makes sense', 'i see', 'i understand', 'understood',
      'awesome', 'perfect', 'alright', 'sure', 'yep', 'yes', 'no', 'nope',
      'haha', 'lol', 'wow', 'interesting', 'good to know', 'that helps',
      'will do', 'i\'ll try', 'ill try', 'makes sense',
    ];
    if (casualPhrases.some((p) => t === p || t.startsWith(p + ' ') || t.endsWith(' ' + p))) {
      return true;
    }
  }
  return false;
}

// ---------------------------------------------------------------------------
// Demo mode — coaching data
// ---------------------------------------------------------------------------

interface CoachingEntry {
  keywords: string[];
  diagnosis: string;
  drill: string;
  followUp: string;
}

const coachingEntries: CoachingEntry[] = [
  {
    keywords: ['freeze', 'blank', 'forget', 'nervous', 'anxiety', 'scared', 'fear', 'panic'],
    diagnosis:
      "Your brain is treating the audience as a threat and triggering the fight-or-flight response. This floods your working memory and makes it hard to recall what you planned to say. The root cause is almost never lack of preparation — it's the reframe that's missing.",
    drill:
      "3-breath reset: Before you begin, inhale for 4 counts, hold for 2, exhale for 6. Repeat three times. Then say one grounding sentence out loud — 'I'm here to help them, not impress them.' This shifts your nervous system from threat mode to performance mode.",
    followUp:
      "Which part of the freeze hits hardest — the opening line, or losing your thread mid-speech? Knowing this narrows down the fix.",
  },
  {
    keywords: ['um', 'uh', 'like', 'filler', 'word', 'stutter'],
    diagnosis:
      "Filler words are a fear-of-silence habit. Your brain perceives a pause as awkward, so it fills the gap automatically. The bad news: fillers undermine credibility. The good news: this is one of the most trainable speaking flaws.",
    drill:
      "Pause drill (2 min/day): Set a timer and speak freely about anything. Each time you feel an 'um' coming, stop completely and breathe instead. The pause will feel endless to you — it sounds natural to everyone else. Also, record yourself once this week and count your fillers per minute. Awareness alone reduces them by 30%.",
    followUp:
      "Are your fillers worse when you're improvising, or even when you've rehearsed? That tells me whether it's a nerves problem or a structure problem.",
  },
  {
    keywords: ['hands', 'gesture', 'body', 'posture', 'stand', 'stance', 'movement', 'arms'],
    diagnosis:
      "The 'what do I do with my hands' problem comes from heightened self-awareness. When nervous, your brain flags every limb as a liability. Random movement reads as fidgeting; deliberate movement reads as confidence — the difference is intention.",
    drill:
      "Home base drill: Choose a 'home base' position — hands loosely clasped at waist height. Whenever you're not actively gesturing, return there. Practice a 2-minute speech where you consciously gesture only when emphasizing a specific word, then return to base. Watch it back with the sound off.",
    followUp:
      "Is the problem mostly 'I don't know where to put them,' or 'I move them too much and it looks distracting'? Different fixes.",
  },
  {
    keywords: ['voice', 'shakes', 'shaking', 'trembles', 'volume', 'quiet', 'soft', 'monotone', 'tone', 'pitch'],
    diagnosis:
      "A shaky or flat voice is almost always a breathing issue, not a confidence issue. Shallow chest breathing tightens the vocal cords. Without proper diaphragm support, the voice wavers and sounds thin.",
    drill:
      "Belly breathing + projection: Put one hand on your stomach. Inhale so your belly expands (not your chest). Speak your next sentence on the slow exhale. Do 5 sentences this way. Also try humming for 30 seconds before your next speech — it warms the cords and reduces tension physically.",
    followUp:
      "Is the shakiness worse at the start, or consistent throughout? Consistent usually means a breathing habit; front-loaded usually means adrenaline — each needs a slightly different approach.",
  },
  {
    keywords: ['opening', 'hook', 'intro', 'start', 'beginning', 'first line', 'first sentence'],
    diagnosis:
      "Most openings fail because they start with preamble — 'Hi, today I'll be talking about…' Your audience decides whether to pay attention in the first 8 seconds. A strong opening creates a question in their mind they want answered.",
    drill:
      "The 4-opening test: Write your opening four ways: (1) a micro-story, (2) a startling stat, (3) a direct question, (4) a bold claim. Read each one out loud. The one that sounds most natural AND creates the most curiosity is your opening. Don't start with your name or your topic.",
    followUp:
      "What's the topic of the speech? I can workshop a specific opening with you.",
  },
  {
    keywords: ['pace', 'fast', 'slow', 'speed', 'rush', 'ramble', 'quick', 'racing'],
    diagnosis:
      "Rushing is almost always an adrenaline response — your brain wants to escape the discomfort. The problem is that fast speakers sound unconfident, not prepared. Paradoxically, slowing down makes you sound like you own the room.",
    drill:
      "Pause marks: Take your next practice script and add a forward slash '/' after every sentence. When you hit a slash, pause for a full two seconds — count them silently. It will feel unbearably slow. Record it. You'll hear that it sounds authoritative, not slow.",
    followUp:
      "Is the rushing consistent, or mostly at the start when nerves peak? If it's front-loaded, there's a different technique that works better.",
  },
  {
    keywords: ['eye contact', 'eyes', 'look', 'audience', 'look at', 'stare'],
    diagnosis:
      "Most speakers either avoid eye contact (scanning) or hold it too long (staring). Both break connection. True eye contact means completing one full thought with one person — long enough to feel personal, short enough to feel natural.",
    drill:
      "Lighthouse drill: In your next practice, pick one person and finish one complete sentence while looking at them. Then shift to another. Never move your eyes mid-sentence. Three to five seconds per person. Low-stakes version: practice this in normal conversations this week before applying it to speeches.",
    followUp:
      "Is the issue more 'I avoid it entirely' or 'I make contact but it feels awkward and I break it too fast'? Both are fixable, just differently.",
  },
];

const defaultCoaching: CoachingEntry = {
  diagnosis:
    "Most speaking challenges come down to three root causes: shallow breathing (which affects voice and nerves), fear of silence (which causes rushing and fillers), and self-monitoring (which kills naturalness). Getting better at speaking is less about adding new skills and more about removing these interference patterns.",
  drill:
    "Foundation drill — 2 minutes daily: Record yourself speaking on any topic. Watch it back once without audio (body language), then once without video (voice). Write down one thing you'd change from each. Do this every day for two weeks. The self-awareness alone will accelerate your improvement faster than any other single habit.",
  followUp:
    "What specific aspect would you like to dig into? The more concrete you are — 'I freeze on the first sentence' vs 'I'm nervous in general' — the more targeted I can make the feedback.",
};

function getChatReply(msg: string): string {
  const t = msg.trim().toLowerCase();
  if (t.includes('thank') || t === 'thanks') {
    return "Happy to help! Come back any time you want to work through something. What's next on your radar?";
  }
  if (t.includes('will do') || t.includes("i'll try") || t.includes('ill try')) {
    return "Good luck — give it a go and come back to tell me how it felt. Small consistent reps beat big occasional practice every time.";
  }
  if (t.includes('got it') || t.includes('understand') || t.includes('understood') || t.includes('i see')) {
    return "Good. The real test is applying it in a live practice — that's where it clicks. What else would you like to work on?";
  }
  if (t.includes('makes sense') || t.includes('that makes')) {
    return "Exactly. Keep that in mind the next time you practice. Is there another challenge you're running into?";
  }
  if (t.includes('yes') || t.includes('yep') || t.includes('yup') || t === 'sure') {
    return "Great — tell me more. What specifically is the issue?";
  }
  if (t.includes('no') || t.includes('nope') || t.includes('not really')) {
    return "No problem. What would be most helpful right now? We can dig into any aspect of your speaking — nerves, delivery, structure, anything.";
  }
  if (t.includes('cool') || t.includes('awesome') || t.includes('great') || t.includes('nice') || t.includes('perfect')) {
    return "Glad that landed. Consistency is what makes it stick — a little deliberate practice every day goes a long way. What else?";
  }
  if (t.includes('ok') || t.includes('okay') || t.includes('alright')) {
    return "Sounds good. Anything else you'd like to work on today?";
  }
  return "Got it. What else is on your mind?";
}

function getDemoResponse(messages: ChatMessage[]): object {
  const lastMsg = messages[messages.length - 1]?.content || '';

  if (isCasualMessage(lastMsg)) {
    return { responseType: 'chat', message: getChatReply(lastMsg) };
  }

  const lower = lastMsg.toLowerCase();
  for (const entry of coachingEntries) {
    if (entry.keywords.some((kw) => lower.includes(kw))) {
      return { responseType: 'coaching', ...entry };
    }
  }

  return { responseType: 'coaching', ...defaultCoaching };
}

// ---------------------------------------------------------------------------
// Demo coach analysis
// ---------------------------------------------------------------------------

function getDemoAnalysis() {
  const rand = (min: number, max: number) =>
    Math.round((Math.random() * (max - min) + min) * 10) / 10;

  const scores = {
    body_language: rand(5.5, 8.0),
    eye_contact: rand(5.0, 7.5),
    voice_modulation: rand(5.5, 8.0),
    pace: rand(6.0, 8.5),
    projection: rand(5.5, 7.5),
    presence: rand(6.0, 8.0),
    overall: 0,
  };
  scores.overall =
    Math.round(
      ((scores.body_language + scores.eye_contact + scores.voice_modulation +
        scores.pace + scores.projection + scores.presence) / 6) * 10
    ) / 10;

  return {
    scores,
    feedback: {
      body_language: {
        strength: "You maintained an open stance throughout, which signals confidence.",
        improvement: "Add deliberate hand gestures timed to key words.",
        drill: "Home base drill: hands loosely clasped at waist; gesture on emphasis words only, then return.",
      },
      eye_contact: {
        strength: "You attempted to distribute attention across the audience.",
        improvement: "Hold eye contact for one complete thought (3-5 sec) before shifting.",
        drill: "Lighthouse drill: finish one full sentence per person before moving. Practice in everyday conversations first.",
      },
      voice_modulation: {
        strength: "Consistent vocal energy kept the audience engaged.",
        improvement: "Use contrast — drop volume for emphasis, not just raise it.",
        drill: "Read a passage three ways: whisper, normal, loud. Notice the emotional difference.",
      },
      pace: {
        strength: "Your baseline speed was easy to follow.",
        improvement: "Add 2-second pauses after key points to let ideas land.",
        drill: "Mark your script with '/' after each key sentence. Stop for a count of two at every slash.",
      },
      projection: {
        strength: "Voice carried well and was clearly audible.",
        improvement: "Support projection with diaphragmatic breathing for a fuller sound.",
        drill: "Hand on stomach: inhale so it rises, speak on the slow exhale. 5 sentences daily.",
      },
      presence: {
        strength: "Genuine enthusiasm for your topic was visible and contagious.",
        improvement: "Own pauses instead of filling them — silence signals confidence.",
        drill: "2-min timer: speak freely; every time an 'um' is coming, stop and breathe instead.",
      },
    },
    summary:
      "Solid performance with good energy and clear delivery. Priority areas: deliberate eye contact and strategic pauses after key points.",
    encouraging_note:
      "Recording yourself and seeking feedback already puts you ahead of most speakers. Consistency is everything — keep going.",
  };
}

// ---------------------------------------------------------------------------
// Live Gemini mode
// ---------------------------------------------------------------------------

async function runGemini(type: string, messages: ChatMessage[], videoAnalysis?: string) {
  const { GoogleGenerativeAI } = await import("npm:@google/generative-ai");
  const genAI = new GoogleGenerativeAI(Deno.env.get("GEMINI_API_KEY")!);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  if (type === 'buddy') {
    const systemPrompt = `You are SpeakBuddy, a sharp public speaking coach for students. Read every message carefully and decide what kind of response is needed:

RULE 1 — If the user is describing a speaking challenge, problem, or asking for help → respond with structured coaching. Return JSON:
{"responseType":"coaching","diagnosis":"2-3 sentences identifying the root cause of the problem","drill":"a specific, timed practice exercise (1-3 minutes) they can do today","followUp":"one focused question to sharpen the next piece of advice"}

RULE 2 — If the user is responding casually (e.g. 'ok', 'thanks', 'got it', 'makes sense', short affirmation) → respond conversationally. Return JSON:
{"responseType":"chat","message":"a brief, warm reply that keeps the conversation going"}

Always return valid JSON only. No markdown, no preamble.`;

    const chatHistory = messages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const chat = model.startChat({
      history: [
        { role: 'user', parts: [{ text: 'I need help with public speaking.' }] },
        { role: 'model', parts: [{ text: systemPrompt }] },
        ...chatHistory.slice(0, -1),
      ],
    });

    const result = await chat.sendMessage(messages[messages.length - 1]?.content || 'Hello!');
    const text = result.response.text().trim();
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        // fallback: return as plain chat
      }
    }
    return { responseType: 'chat', message: text };
  }

  if (type === 'coach' && videoAnalysis) {
    const prompt = `You are SpeakCoach. Analyze the speaking performance below and return ONLY valid JSON with this structure:
{"scores":{"body_language":number,"eye_contact":number,"voice_modulation":number,"pace":number,"projection":number,"presence":number,"overall":number},"feedback":{"body_language":{"strength":"string","improvement":"string","drill":"string"},"eye_contact":{"strength":"string","improvement":"string","drill":"string"},"voice_modulation":{"strength":"string","improvement":"string","drill":"string"},"pace":{"strength":"string","improvement":"string","drill":"string"},"projection":{"strength":"string","improvement":"string","drill":"string"},"presence":{"strength":"string","improvement":"string","drill":"string"}},"summary":"string","encouraging_note":"string"}

Performance context:
${videoAnalysis}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Could not parse JSON from AI response");
    return { analysis: JSON.parse(match[0]) };
  }

  throw new Error("Invalid request");
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { type, messages, videoAnalysis } = await req.json();
    const hasApiKey = !!Deno.env.get("GEMINI_API_KEY");
    let response;

    if (hasApiKey) {
      response = await runGemini(type, messages ?? [], videoAnalysis);
    } else {
      if (type === 'buddy') {
        response = getDemoResponse(messages ?? []);
      } else if (type === 'coach') {
        response = { analysis: getDemoAnalysis() };
      } else {
        throw new Error("Invalid request type");
      }
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Function error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
