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
  if (t.length < 80) {
    const casualPhrases = [
      'ok', 'okay', 'thanks', 'thank you', 'got it', 'cool', 'great', 'nice',
      'sounds good', 'makes sense', 'i see', 'i understand', 'understood',
      'awesome', 'perfect', 'alright', 'sure', 'yep', 'yes', 'no', 'nope',
      'haha', 'lol', 'wow', 'interesting', 'good to know', 'that helps',
      'will do', "i'll try", 'ill try', 'i will try', 'noted',
      'that makes sense', 'that\'s helpful', 'thats helpful',
      'got it thanks', 'ok thanks', 'okay thanks', 'thank you so much',
      'appreciate it', 'i appreciate', 'helpful', 'makes a lot of sense',
    ];
    if (casualPhrases.some((p) => t === p || t.startsWith(p + ' ') || t.endsWith(' ' + p) || t.startsWith(p + '!'))) {
      return true;
    }
    // Very short messages with no question are likely casual
    if (t.length < 20 && !t.includes('?') && !t.includes('how') && !t.includes('what') && !t.includes('why')) {
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
  message: string;
  diagnosis: string;
  drill: string;
  followUp: string;
}

const coachingEntries: CoachingEntry[] = [
  {
    keywords: ['freeze', 'blank', 'forget', 'nervous', 'anxiety', 'scared', 'fear', 'panic', 'stage fright', 'terrified', 'dread'],
    message: "That freeze response is one of the most common things I hear — and it's completely fixable. Here's what's actually happening:",
    diagnosis:
      "Your brain is treating the audience as a threat and triggering fight-or-flight. This floods working memory and makes it hard to recall what you planned to say. The root cause is almost never lack of preparation — it's the reframe that's missing.",
    drill:
      "3-breath reset: Before you begin, inhale for 4 counts, hold for 2, exhale for 6. Repeat three times. Then say one grounding sentence out loud — 'I'm here to help them, not impress them.' This shifts your nervous system from threat mode to performance mode.",
    followUp:
      "Which part of the freeze hits hardest — the opening line, or losing your thread mid-speech? Knowing this narrows down the fix.",
  },
  {
    keywords: ['um', 'uh', 'like', 'filler', 'filler word', 'stutter', 'stumble', 'hesitate', 'hesitation'],
    message: "Filler words are a habit, not a personality trait — and habits can be broken. Here's the real picture:",
    diagnosis:
      "Filler words are a fear-of-silence habit. Your brain perceives a pause as awkward, so it fills the gap automatically. They undermine credibility — but this is one of the most trainable speaking flaws there is.",
    drill:
      "Pause drill (2 min/day): Set a timer and speak freely on any topic. Each time you feel an 'um' coming, stop completely and breathe instead. The pause will feel endless to you — it sounds natural to listeners. Record yourself once this week and count fillers per minute. Awareness alone reduces them by ~30%.",
    followUp:
      "Are your fillers worse when you're improvising, or even when you've rehearsed? That tells me whether it's a nerves problem or a structure problem.",
  },
  {
    keywords: ['hands', 'gesture', 'gestures', 'gesturing', 'body', 'posture', 'stand', 'stance', 'movement', 'arms', 'fidget', 'fidgeting'],
    message: "The 'what do I do with my hands' problem is incredibly common — and the fix is simpler than most people think:",
    diagnosis:
      "This comes from heightened self-awareness. When nervous, your brain flags every limb as a liability. Random movement reads as fidgeting; deliberate movement reads as confidence. The difference is intention, not skill.",
    drill:
      "Home base drill: Choose a 'home base' position — hands loosely clasped at waist height. Whenever you're not actively gesturing, return there. Practice a 2-minute speech gesturing only on emphasis words, then return to base. Watch it back with the sound off.",
    followUp:
      "Is the problem 'I don't know where to put them,' or 'I move them too much and it looks distracting'? Different issues, different fixes.",
  },
  {
    keywords: ['voice', 'shakes', 'shaking', 'trembles', 'trembling', 'volume', 'quiet', 'too quiet', 'soft', 'monotone', 'flat', 'boring', 'tone', 'pitch', 'wavering', 'weak'],
    message: "Voice issues almost always come down to breathing, not confidence. Good news — that's very coachable:",
    diagnosis:
      "A shaky or flat voice is almost always a breathing issue. Shallow chest breathing tightens the vocal cords. Without proper diaphragm support, the voice wavers and sounds thin — not because you're scared, but because the mechanism isn't engaged.",
    drill:
      "Belly breathing + projection: Put one hand on your stomach. Inhale so your belly expands (not your chest). Speak your next sentence on the slow exhale. Do 5 sentences this way daily. Also try humming for 30 seconds before speaking — it warms the cords and reduces tension physically.",
    followUp:
      "Is the shakiness worse at the start, or consistent throughout? Consistent usually means a breathing habit; front-loaded usually means adrenaline — each has a different fix.",
  },
  {
    keywords: ['opening', 'hook', 'intro', 'introduction', 'start', 'beginning', 'first line', 'first sentence', 'how to start', 'how do i start'],
    message: "The opening is the highest-leverage moment in any speech. Here's why most openings fail — and how to nail yours:",
    diagnosis:
      "Most openings fail because they start with preamble — 'Hi, today I'll be talking about…' Your audience decides whether to pay attention in the first 8 seconds. A strong opening creates a question in their mind they want answered.",
    drill:
      "The 4-opening test: Write your opening four ways — (1) a micro-story, (2) a startling stat, (3) a direct question, (4) a bold claim. Read each one aloud. The one that feels most natural AND creates the most curiosity is your opening. Never start with your name or your topic title.",
    followUp:
      "What's the topic of the speech? I can workshop a specific opening with you right now.",
  },
  {
    keywords: ['pace', 'fast', 'slow', 'speed', 'rush', 'rushing', 'ramble', 'rambling', 'quick', 'racing', 'too fast', 'speak too fast', 'talk too fast'],
    message: "Rushing is the most common adrenaline-driven habit in speaking — and it signals the opposite of what you want. Here's the fix:",
    diagnosis:
      "Rushing is almost always an adrenaline response — your brain wants to escape the discomfort. Fast speakers sound unconfident, not prepared. Paradoxically, slowing down makes you sound like you own the room.",
    drill:
      "Pause marks: Take your next practice script and add a '/' after every sentence. When you hit a slash, pause for a full two seconds — count them silently. It will feel unbearably slow. Record it. You'll hear that it sounds authoritative, not slow.",
    followUp:
      "Is the rushing consistent, or mostly at the start when nerves peak? If it's front-loaded, there's a specific technique that works better for that.",
  },
  {
    keywords: ['eye contact', 'eyes', 'look at', 'looking at', 'look up', 'audience', 'crowd', 'stare', 'staring', 'avoid'],
    message: "Eye contact is one of the most powerful connection tools in speaking — and most people either avoid it entirely or overdo it. Here's the sweet spot:",
    diagnosis:
      "Most speakers either avoid eye contact (scanning) or hold it too long (staring). Both break connection. True eye contact means completing one full thought with one person — long enough to feel personal, short enough to feel natural.",
    drill:
      "Lighthouse drill: In your next practice, pick one person and finish one complete sentence while looking at them. Then shift to someone else. Never move your eyes mid-sentence. Aim for 3–5 seconds per person. Low-stakes version: practice this in everyday conversations this week before applying it to speeches.",
    followUp:
      "Is the issue more 'I avoid it entirely' or 'I make contact but it feels awkward and I break it too fast'? Both are fixable, just differently.",
  },
  {
    keywords: ['structure', 'organize', 'organization', 'outline', 'flow', 'transition', 'transitions', 'logical', 'order', 'format', 'layout'],
    message: "Structure is the invisible backbone of a great speech — when it's wrong, everything else suffers. Here's how to fix it:",
    diagnosis:
      "Most rambling speeches lack a clear through-line — one sentence that captures what the speech is actually about. Without it, listeners can't follow you even if they want to. Structure isn't about restricting creativity; it's about respecting your audience's working memory.",
    drill:
      "The one-sentence test: Before your next practice, write a single sentence that completes 'The one thing I want my audience to remember is ___.' Then check every section of your speech against that sentence. Cut anything that doesn't serve it. If you can't write that sentence, your topic is still too broad.",
    followUp:
      "Is your speech structured around a central argument, or more like a list of related points? That distinction shapes which structure fix will help most.",
  },
  {
    keywords: ['confidence', 'confident', 'self-conscious', 'insecure', 'self doubt', 'doubt', 'imposter', 'believe in myself', 'not good enough'],
    message: "Confidence in speaking isn't a personality trait — it's a trained response. Here's what's actually holding you back:",
    diagnosis:
      "Speaking confidence isn't about feeling fearless — it's about doing the thing despite the fear until the brain updates its threat assessment. Every time you speak and survive, you build a small deposit of evidence that contradicts the fear narrative. The problem isn't lack of confidence; it's lack of reps.",
    drill:
      "Micro-exposure ladder: This week, do ONE low-stakes public act per day — order confidently at a café, speak up once in class, introduce yourself to a stranger. No speeches needed. Each small act rewires the 'speaking = danger' association and builds the neural pathway for confident action.",
    followUp:
      "Is the lack of confidence tied to a specific type of situation (presentations, one-on-ones, large groups), or is it consistent across all speaking contexts? That narrows down the root cause significantly.",
  },
  {
    keywords: ['memorize', 'memorizing', 'memory', 'forget words', 'remember', 'remember lines', 'script', 'notes', 'cards', 'notes or no notes'],
    message: "The memorization vs. notes debate trips up a lot of speakers. Here's what actually works:",
    diagnosis:
      "Trying to memorize word-for-word is what causes blanking. When you miss one word, the whole chain breaks. The alternative — speaking from understanding, not from memory — is far more resilient and sounds more natural. You remember ideas, not sentences.",
    drill:
      "Chunking drill: Break your speech into 5–7 key ideas (not sentences). Write each idea in 3 words on a card. Practice delivering each chunk in your own words — don't worry about exact phrasing. Run through the whole speech this way daily. After 3 days, try it without the cards. The ideas will be there even when the exact words aren't.",
    followUp:
      "Is the forgetting happening during practice or only in the actual performance moment? That's a key distinction — it changes whether this is a preparation problem or a nerves problem.",
  },
];

const defaultCoaching: CoachingEntry = {
  keywords: [],
  message: "Good question. Let me give you something concrete to work with:",
  diagnosis:
    "Most speaking challenges trace back to three root causes: shallow breathing (affects voice and nerves), fear of silence (causes rushing and fillers), and self-monitoring (kills naturalness). Getting better at speaking is less about adding skills and more about removing these interference patterns.",
  drill:
    "Foundation drill — 2 minutes daily: Record yourself speaking on any topic. Watch it back once without audio (body language only), then once without video (voice only). Write down one thing you'd change from each viewing. Do this every day for two weeks. This self-awareness habit accelerates improvement faster than any other single practice.",
  followUp:
    "What specific aspect would you like to dig into? The more concrete you are — 'I freeze on the first sentence' rather than 'I get nervous' — the more targeted I can make the feedback.",
};

function getChatReply(msg: string): string {
  const t = msg.trim().toLowerCase();
  if (t.includes('thank') || t === 'thanks') {
    return "Happy to help. Come back any time you want to work through something — small consistent reps are what move the needle. What's next on your radar?";
  }
  if (t.includes('will do') || t.includes("i'll try") || t.includes('ill try') || t.includes('i will try')) {
    return "Good luck — go give it a shot and come back to tell me how it felt. Small consistent reps beat big occasional practice every time.";
  }
  if (t.includes('got it') || t.includes('understand') || t.includes('understood') || t.includes('i see')) {
    return "Good. The real test is applying it in a live practice — that's when it actually clicks. What else would you like to work on?";
  }
  if (t.includes('makes sense') || t.includes('that makes')) {
    return "Exactly. Keep that framing in mind the next time you practice. Is there another challenge you're running into?";
  }
  if (t.includes('appreciate') || t.includes('helpful') || t.includes('that helps')) {
    return "Glad it landed. Consistency is what makes it stick — a little deliberate practice every day goes further than you'd expect. What else?";
  }
  if (t.includes('yes') || t.includes('yep') || t.includes('yup') || t === 'sure') {
    return "Great — tell me more about what specifically is happening. The more detail you give me, the sharper the advice I can give back.";
  }
  if (t.includes('no') || t.includes('nope') || t.includes('not really')) {
    return "No problem. What would be most useful right now? We can dig into any aspect of your speaking — nerves, delivery, structure, or something else entirely.";
  }
  if (t.includes('cool') || t.includes('awesome') || t.includes('great') || t.includes('nice') || t.includes('perfect')) {
    return "Glad that landed. Consistency is everything — a little deliberate practice every day compounds fast. What else would you like to tackle?";
  }
  if (t.includes('ok') || t.includes('okay') || t.includes('alright') || t.includes('noted')) {
    return "Sounds good. Anything else you'd like to work through today?";
  }
  return "Got it. What else is on your mind — is there another challenge you want to dig into?";
}

function getDemoResponse(messages: ChatMessage[]): object {
  const lastMsg = messages[messages.length - 1]?.content || '';

  if (isCasualMessage(lastMsg)) {
    return { responseType: 'chat', message: getChatReply(lastMsg) };
  }

  const lower = lastMsg.toLowerCase();
  for (const entry of coachingEntries) {
    if (entry.keywords.some((kw) => lower.includes(kw))) {
      return {
        responseType: 'coaching',
        message: entry.message,
        diagnosis: entry.diagnosis,
        drill: entry.drill,
        followUp: entry.followUp,
      };
    }
  }

  return {
    responseType: 'coaching',
    message: defaultCoaching.message,
    diagnosis: defaultCoaching.diagnosis,
    drill: defaultCoaching.drill,
    followUp: defaultCoaching.followUp,
  };
}

// ---------------------------------------------------------------------------
// Demo coach analysis — consistent feedback for a representative student
// ---------------------------------------------------------------------------

function getDemoAnalysis() {
  return {
    scores: {
      body_language: 6.5,
      eye_contact: 5.8,
      voice_modulation: 7.0,
      pace: 6.8,
      projection: 6.2,
      presence: 7.2,
      overall: 6.6,
    },
    feedback: {
      body_language: {
        strength: "You maintained an open, upright stance throughout — this signals confidence even when nerves are present.",
        improvement: "Add deliberate hand gestures timed to your key words. Right now your hands are static, which reads as held tension.",
        drill: "Home base drill: hands loosely clasped at waist height. Gesture only on emphasis words, then return to base. Practice one 2-min speech this way.",
      },
      eye_contact: {
        strength: "You made genuine attempts to connect with different parts of the audience rather than staring at one spot.",
        improvement: "Hold eye contact for one complete thought (3–5 sec) before shifting. You're breaking it too early, which reads as uncertainty.",
        drill: "Lighthouse drill: finish one full sentence per person before moving on. Practice this in everyday conversations first — it transfers directly.",
      },
      voice_modulation: {
        strength: "Your vocal energy was consistent and kept the audience oriented in the content.",
        improvement: "Use contrast to add emphasis — drop your volume for key moments, not just raise it. Quiet emphasis is often more powerful.",
        drill: "Read a passage three ways: whisper, conversational, projected. Notice the emotional weight of each. Use all three in your next speech.",
      },
      pace: {
        strength: "Your baseline speaking speed was easy to follow — not too fast, not labored.",
        improvement: "Add intentional 2-second pauses after your most important points. Right now those ideas are rushing past before they can land.",
        drill: "Mark your script with '/' after each key sentence. Stop for a count of two at every slash. It'll feel slow — it sounds authoritative.",
      },
      projection: {
        strength: "Your voice was audible and carried well to the back of the room.",
        improvement: "Support your projection with diaphragmatic breathing for a fuller, more resonant sound — especially toward the end of sentences.",
        drill: "Hand on stomach: inhale so it expands, speak on the slow exhale. 5 sentences daily. This removes the breath-support ceiling on your voice.",
      },
      presence: {
        strength: "Your genuine engagement with the topic came through — listeners could feel that you cared about what you were saying.",
        improvement: "Own your pauses instead of filling them with sound. Silence between ideas signals confidence; rushing through them signals anxiety.",
        drill: "2-min timer: speak freely on any topic. Every time an 'um' is coming, stop and breathe instead. The pause will feel eternal — it sounds natural.",
      },
    },
    summary:
      "A solid, engaged performance with clear enthusiasm for your topic. The two highest-leverage areas to focus on: deliberate eye contact (hold it through a complete thought) and strategic pauses after key points to let your ideas fully land.",
    encouraging_note:
      "The fact that you recorded yourself and sought feedback already puts you in the top tier of speakers. Most people avoid that mirror entirely. Keep showing up — consistency is the whole game.",
  };
}

// ---------------------------------------------------------------------------
// Live Gemini mode
// ---------------------------------------------------------------------------

async function runGemini(type: string, messages: ChatMessage[], videoAnalysis?: string) {
  const { GoogleGenerativeAI } = await import("npm:@google/generative-ai");
  const genAI = new GoogleGenerativeAI(Deno.env.get("GEMINI_API_KEY")!);

  if (type === 'buddy') {
    const systemPrompt = `You are SpeakBuddy, a sharp and warm public speaking coach for students. Analyze each message carefully and decide what kind of response is needed.

RULE 1 — If the user is describing a speaking challenge, problem, or asking for coaching help, respond with structured coaching. Return JSON exactly:
{"responseType":"coaching","message":"1-2 sentences of warm acknowledgment or framing that sounds like natural conversation — e.g. 'This is one of the most common patterns I see, and it is fixable. Here is what is actually happening:'","diagnosis":"2-3 sentences identifying the specific root cause of the problem","drill":"a concrete, timed practice exercise (1-3 minutes) they can do today — be specific about the steps","followUp":"one focused question to sharpen the next piece of advice"}

RULE 2 — If the user is responding casually (e.g. 'ok', 'thanks', 'got it', 'makes sense', short affirmations, short reactions), respond conversationally. Return JSON exactly:
{"responseType":"chat","message":"a brief warm reply (1-2 sentences) that acknowledges what they said and gently opens the door to more coaching"}

Always return valid JSON only. No markdown, no code fences, no preamble, no explanation outside the JSON.`;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: systemPrompt,
    });

    const chatHistory = messages.slice(0, -1).map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const chat = model.startChat({ history: chatHistory });
    const result = await chat.sendMessage(messages[messages.length - 1]?.content || 'Hello!');
    const text = result.response.text().trim();
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        // fallback
      }
    }
    return { responseType: 'chat', message: text };
  }

  if (type === 'coach' && videoAnalysis) {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `You are SpeakCoach, an expert public speaking analyst. A student has submitted a recording for feedback. Provide realistic, constructive coaching feedback.

IMPORTANT SCORING RULES:
- All scores must be between 4.0 and 9.5 (representing real students, not perfection)
- Scores must be internally consistent — if eye_contact is 5.5, the feedback must reflect that as a weak area
- overall must equal the mathematical average of the 6 dimension scores, rounded to 1 decimal
- Each feedback entry must directly match its score (a 5.x score needs clear improvement areas; a 8.x score should mostly praise)

Return ONLY valid JSON with exactly this structure (no markdown, no code fences):
{"scores":{"body_language":number,"eye_contact":number,"voice_modulation":number,"pace":number,"projection":number,"presence":number,"overall":number},"feedback":{"body_language":{"strength":"specific observation","improvement":"one concrete thing to fix","drill":"specific timed exercise"},"eye_contact":{"strength":"specific observation","improvement":"one concrete thing to fix","drill":"specific timed exercise"},"voice_modulation":{"strength":"specific observation","improvement":"one concrete thing to fix","drill":"specific timed exercise"},"pace":{"strength":"specific observation","improvement":"one concrete thing to fix","drill":"specific timed exercise"},"projection":{"strength":"specific observation","improvement":"one concrete thing to fix","drill":"specific timed exercise"},"presence":{"strength":"specific observation","improvement":"one concrete thing to fix","drill":"specific timed exercise"}},"summary":"2-3 sentences on the overall performance and top 1-2 priorities","encouraging_note":"one genuine, specific sentence of encouragement"}

Student recording context:
${videoAnalysis}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Could not parse JSON from AI response");
    const parsed = JSON.parse(match[0]);

    // Ensure overall is actually the average of dimension scores
    const dims = ['body_language', 'eye_contact', 'voice_modulation', 'pace', 'projection', 'presence'] as const;
    const avg = dims.reduce((sum, k) => sum + (parsed.scores[k] ?? 0), 0) / 6;
    parsed.scores.overall = Math.round(avg * 10) / 10;

    return { analysis: parsed };
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
      try {
        response = await runGemini(type, messages ?? [], videoAnalysis);
      } catch (geminiError) {
        const msg = geminiError instanceof Error ? geminiError.message : String(geminiError);
        const isQuotaOrRateLimit = msg.includes('429') || msg.includes('quota') || msg.includes('rate') || msg.includes('RESOURCE_EXHAUSTED');
        if (isQuotaOrRateLimit) {
          // Fall back to demo mode rather than returning an error to the user
          if (type === 'buddy') {
            response = getDemoResponse(messages ?? []);
          } else if (type === 'coach') {
            response = { analysis: getDemoAnalysis() };
          } else {
            throw geminiError;
          }
        } else {
          throw geminiError;
        }
      }
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
