const fs = require("fs");
const path = require("path");

const chaptersData = [
  {
    id: "C02",
    number: 2,
    title: "Introducing Yourself",
    subtitle: "State your name, kahan se hain, and wedding meetings",
    goal: "State your name, ask someone else's name, say where you're from, and express pleasure at meeting.",
    culturalNote: "Pakistanis are exceptionally welcoming and love asking where you're from. If you're a heritage learner, answering 'Main America se hoon' (I'm from America) or naming your parents' home city like Lahore or Karachi instantly creates a warm connection.",
    phrases: [
      { id: "C02-001", urdu: "میرا نام Sarah ہے", roman: "Mera naam Sarah hai", english: "My name is Sarah", category: "greeting", newLevelId: "L2-1" },
      { id: "C02-002", urdu: "آپ کا نام کیا ہے؟", roman: "Aap ka naam kya hai?", english: "What is your name?", category: "greeting", newLevelId: "L2-2" },
      { id: "C02-003", urdu: "میں امریکہ سے ہوں", roman: "Main America se hoon", english: "I am from America", category: "greeting", newLevelId: "L2-3" },
      { id: "C02-004", urdu: "آپ کہاں سے ہیں؟", roman: "Aap kahan se hain?", english: "Where are you from?", category: "greeting", newLevelId: "L2-3" },
      { id: "C02-005", urdu: "آپ سے مل کر خوشی ہوئی", roman: "Aap se mil kar khushi hui", english: "Pleased to meet you", category: "greeting", newLevelId: "L2-4" }
    ],
    bossScenario: {
      intro: "A Pakistani cousin you've never met before approaches you at a family wedding. Exchange names, ask where they live, and say it's a pleasure to meet them.",
      turns: [
        { speakerLine: { urdu: "السلام علیکم، میں علی ہوں۔ آپ کا نام کیا ہے؟", roman: "Assalam alaikum, main Ali hoon. Aap ka naam kya hai?", english: "Hello, I am Ali. What is your name?" }, expectedPhraseId: "C02-001", prompt: "Tell him your name is Sarah." },
        { speakerLine: { urdu: "آپ سے مل کر خوشی ہوئی! آپ کہاں سے ہیں؟", roman: "Aap se mil kar khushi hui! Aap kahan se hain?", english: "Pleased to meet you! Where are you from?" }, expectedPhraseId: "C02-003", prompt: "Tell him you are from America." },
        { speakerLine: { urdu: "بہت اچھا! میں لاہور سے ہوں۔", roman: "Bohat acha! Main Lahore se hoon.", english: "Very nice! I am from Lahore." }, expectedPhraseId: "C02-005", prompt: "Say it's a pleasure to meet him." }
      ]
    }
  },
  {
    id: "C03",
    number: 3,
    title: "Pronouns & \"To Be\"",
    subtitle: "Foundation pronouns and the respectful ji haan register",
    goal: "Master basic personal pronouns and to-be verbs along with formal polite agreement markers.",
    culturalNote: "Adding 'ji' before yes (ji haan) or no (ji nahin) instantly elevates your politeness. In Pakistani culture, using respect markers is a sign of good upbringing (tehzeeb).",
    phrases: [
      { id: "C03-001", urdu: "میں ہوں", roman: "Main hoon", english: "I am", category: "greeting", newLevelId: "L3-1" },
      { id: "C03-002", urdu: "ہم ہیں", roman: "Hum hain", english: "We are", category: "greeting", newLevelId: "L3-1" },
      { id: "C03-003", urdu: "آپ ہیں", roman: "Aap hain", english: "You are (respectful/formal)", category: "greeting", newLevelId: "L3-1" },
      { id: "C03-004", urdu: "جی ہاں", roman: "Ji haan", english: "Yes (polite)", category: "courtesy", newLevelId: "L3-4" },
      { id: "C03-005", urdu: "جی نہیں", roman: "Ji nahin", english: "No (polite)", category: "courtesy", newLevelId: "L3-4" }
    ],
    bossScenario: {
      intro: "You are introduced to an elder uncle at a gathering. He asks if you speak Urdu and if you are a student. Respond politely using respect registers.",
      turns: [
        { speakerLine: { urdu: "کیا آپ امریکہ سے ہیں؟", roman: "Kya aap America se hain?", english: "Are you from America?" }, expectedPhraseId: "C03-004", prompt: "Answer politely: Yes." },
        { speakerLine: { urdu: "بہت اچھے! کیا آپ طالب علم ہیں؟", roman: "Bohat ache! Kya aap talib-e-ilm hain?", english: "Great! Are you a student?" }, expectedPhraseId: "C03-004", prompt: "Answer politely: Yes." }
      ]
    }
  },
  {
    id: "C04",
    number: 4,
    title: "Family (Core)",
    subtitle: "Immediate family, mera vs meri, and showing respect to elders",
    goal: "Learn immediate family terms, apply masculine vs feminine possessive pronouns correctly, and plural respect markers.",
    culturalNote: "Parents and elders always take the plural verb 'hain' (e.g. Yeh meri ammi hain) as a fundamental mark of respect. Never use the singular 'hai' for parents or older family members.",
    phrases: [
      { id: "C04-001", urdu: "امی", roman: "Ammi", english: "Mother", category: "vocabulary", newLevelId: "L4-1" },
      { id: "C04-002", urdu: "ابو", roman: "Abbu", english: "Father", category: "vocabulary", newLevelId: "L4-1" },
      { id: "C04-003", urdu: "بھائی", roman: "Bhai", english: "Brother", category: "vocabulary", newLevelId: "L4-2" },
      { id: "C04-004", urdu: "بہن", roman: "Behen", english: "Sister", category: "vocabulary", newLevelId: "L4-2" },
      { id: "C04-005", urdu: "میرا بھائی", roman: "Mera bhai", english: "My brother", category: "vocabulary", newLevelId: "L4-3" },
      { id: "C04-006", urdu: "میری بہن", roman: "Meri behen", english: "My sister", category: "vocabulary", newLevelId: "L4-3" }
    ],
    bossScenario: {
      intro: "Your parents have arrived at a dinner, and you are introducing your siblings and mother to your teacher out loud.",
      turns: [
        { speakerLine: { urdu: "یہ کون ہے؟", roman: "Yeh kaun hai?", english: "Who is this? (pointing to brother)" }, expectedPhraseId: "C04-005", prompt: "Introduce him: My brother." },
        { speakerLine: { urdu: "اور یہ کون ہیں؟", roman: "Aur yeh kaun hain?", english: "And who is this? (pointing to mother)" }, expectedPhraseId: "C04-001", prompt: "Introduce her: Mother." }
      ]
    }
  },
  {
    id: "C05",
    number: 5,
    title: "Family (Extended)",
    subtitle: "Distinctive maternal vs paternal family terms at a Pakistani wedding",
    goal: "Distinguish paternal vs maternal uncles and aunts, and navigate extended family relations.",
    culturalNote: "Urdu family trees are highly specific. Dad's brother is 'chacha', mom's brother is 'mamu'. Your relations immediately know which side of the family you are referring to!",
    phrases: [
      { id: "C05-001", urdu: "دادا", roman: "Dada", english: "Paternal Grandfather", category: "vocabulary", newLevelId: "L5-1" },
      { id: "C05-002", urdu: "دادی", roman: "Dadi", english: "Paternal Grandmother", category: "vocabulary", newLevelId: "L5-1" },
      { id: "C05-003", urdu: "نانا", roman: "Nana", english: "Maternal Grandfather", category: "vocabulary", newLevelId: "L5-1" },
      { id: "C05-004", urdu: "نانی", roman: "Nani", english: "Maternal Grandmother", category: "vocabulary", newLevelId: "L5-1" },
      { id: "C05-005", urdu: "چچا", roman: "Chacha", english: "Paternal Uncle", category: "vocabulary", newLevelId: "L5-2" },
      { id: "C05-006", urdu: "خالہ", roman: "Khala", english: "Maternal Aunt", category: "vocabulary", newLevelId: "L5-3" }
    ],
    bossScenario: {
      intro: "At a large family wedding, your maternal grandmother and paternal uncle walk up. Greet them by their correct Urdu titles.",
      turns: [
        { speakerLine: { urdu: "بیٹا، السلام علیکم! پہچانا مجھے؟", roman: "Beta, Assalam alaikum! Pehchana mujhe?", english: "Child, hello! Do you recognize me? (Maternal grandmother)" }, expectedPhraseId: "C05-004", prompt: "Respond: Hello Nani!" },
        { speakerLine: { urdu: "اور میں کون ہوں؟", roman: "Aur main kaun hoon?", english: "And who am I? (Paternal uncle)" }, expectedPhraseId: "C05-005", prompt: "Identify him: Chacha." }
      ]
    }
  },
  {
    id: "C06",
    number: 6,
    title: "Numbers 1–20",
    subtitle: "Counting items and learning the irregular teen numbers honestly",
    goal: "Learn numbers 1 to 20 out loud, and count everyday items.",
    culturalNote: "Unlike English, numbers 11 through 19 do not follow a simple pattern. Each teen number is a distinct word that requires direct memorization. You'll get it with practice!",
    phrases: [
      { id: "C06-001", urdu: "ایک", roman: "Ek", english: "One", category: "vocabulary", newLevelId: "L6-1" },
      { id: "C06-002", urdu: "دو", roman: "Do", english: "Two", category: "vocabulary", newLevelId: "L6-1" },
      { id: "C06-003", urdu: "تین", roman: "Teen", english: "Three", category: "vocabulary", newLevelId: "L6-1" },
      { id: "C06-004", urdu: "دس", roman: "Das", english: "Ten", category: "vocabulary", newLevelId: "L6-2" },
      { id: "C06-005", urdu: "بیس", roman: "Bees", english: "Twenty", category: "vocabulary", newLevelId: "L6-4" }
    ],
    bossScenario: {
      intro: "You are ordering cups of tea (chai) at a local dhaba café. Tell the server how many cups you need.",
      turns: [
        { speakerLine: { urdu: "جی بھائی، کتنی چائے چاہیے؟", roman: "Ji bhai, kitni chai chahiye?", english: "Yes brother, how many teas do you want?" }, expectedPhraseId: "C06-003", prompt: "Answer: Three." },
        { speakerLine: { urdu: "تین چائے، ٹھیک ہے! اور کچھ؟", roman: "Teen chai, theek hai! Aur kuch?", english: "Three teas, okay! Anything else?" }, expectedPhraseId: "C06-001", prompt: "Answer: One (more item)." }
      ]
    }
  },
  {
    id: "C07",
    number: 7,
    title: "Colors",
    subtitle: "Invariant vs inflecting colors and describing a vibrant bazaar",
    goal: "Differentiate gender-changing inflecting colors from invariant ones to describe things in a colorful bazaar.",
    culturalNote: "Colors ending in '-a' (like 'neela' - blue, 'peela' - yellow) change their endings to '-i' for feminine nouns (neeli, peeli). Invariant colors like 'laal' (red) remain the same regardless of noun gender.",
    phrases: [
      { id: "C07-001", urdu: "لال", roman: "Laal", english: "Red", category: "vocabulary", newLevelId: "L7-1" },
      { id: "C07-002", urdu: "سفید", roman: "Safed", english: "White", category: "vocabulary", newLevelId: "L7-1" },
      { id: "C07-003", urdu: "نیلا", roman: "Neela", english: "Blue (masculine)", category: "vocabulary", newLevelId: "L7-2" },
      { id: "C07-004", jord: "neeli", urdu: "نیلی", roman: "Neeli", english: "Blue (feminine)", category: "vocabulary", newLevelId: "L7-2" },
      { id: "C07-005", urdu: "ہرا", roman: "Hara", english: "Green (masculine)", category: "vocabulary", newLevelId: "L7-2" }
    ],
    bossScenario: {
      intro: "You are at a textile shop in Liberty Market Lahore, selecting fabrics of different colors.",
      turns: [
        { speakerLine: { urdu: "یہ نیلا کپڑا کیسا ہے؟", roman: "Yeh neela kapra kaisa hai?", english: "How is this blue cloth?" }, expectedPhraseId: "C07-001", prompt: "Say you prefer: Red." },
        { speakerLine: { urdu: "ٹھیک ہے، اور یہ قمیض؟", roman: "Theek hai, aur yeh qameez? (feminine qameez)", english: "Okay, and this shirt?" }, expectedPhraseId: "C07-004", prompt: "Describe it using the feminine form: Blue (Neeli)." }
      ]
    }
  },
  {
    id: "C08",
    number: 8,
    title: "Common Objects",
    subtitle: "Identifying household objects, tea, and description builders",
    goal: "Name key household objects, request a cup of tea (chai), and build descriptions.",
    culturalNote: "Chai is more than a drink in Pakistan — it is hospitality itself. Offering chai is the universal greeting when guests enter any home or business.",
    phrases: [
      { id: "C08-001", urdu: "چائے", roman: "Chai", english: "Tea", category: "vocabulary", newLevelId: "L8-1" },
      { id: "C08-002", urdu: "گھر", roman: "Ghar", english: "House / Home", category: "vocabulary", newLevelId: "L8-1" },
      { id: "C08-003", urdu: "کتاب", roman: "Kitab", english: "Book", category: "vocabulary", newLevelId: "L8-2" },
      { id: "C08-004", urdu: "میز", roman: "Mez", english: "Table", category: "vocabulary", newLevelId: "L8-2" },
      { id: "C08-005", urdu: "کرسی", roman: "Kursi", english: "Chair", category: "vocabulary", newLevelId: "L8-2" }
    ],
    bossScenario: {
      intro: "You are visiting a relative's house in Islamabad. They welcome you and offer refreshments.",
      turns: [
        { speakerLine: { urdu: "خوش آمدید! آپ چائے پیئیں گے؟", roman: "Khush aamdeed! Aap chai peeyenge?", english: "Welcome! Will you have tea?" }, expectedPhraseId: "C08-001", prompt: "Request warmly: Tea (Chai)." },
        { speakerLine: { urdu: "کرسی پر بیٹھیں، گھر آپ کا ہی ہے۔", roman: "Kursi par baithein, ghar aap ka hi hai.", english: "Sit on the chair, this home is yours." }, expectedPhraseId: "C08-002", prompt: "Compliment their home: Home (Ghar)." }
      ]
    }
  },
  {
    id: "C09",
    number: 9,
    title: "Register Practice (Aap / Tum / Tu)",
    subtitle: "Choosing the correct level of respect across different relationships",
    goal: "Practice matching register honorific pronouns (Aap, Tum, Tu) based on relationships and social context.",
    culturalNote: "Always default to 'Aap' with strangers, service staff, elders, and in-laws. 'Tum' is reserved for peers and younger relatives. 'Tu' is highly intimate (close friends/siblings) or can sound rude if misused.",
    phrases: [
      { id: "C09-001", urdu: "آپ کیسے ہیں؟", roman: "Aap kaise hain?", english: "How are you? (Aap - respectful)", category: "greeting", newLevelId: "L9-1" },
      { id: "C09-002", urdu: "تم کیسے ہو؟", roman: "Tum kaise ho?", english: "How are you? (Tum - casual)", category: "greeting", newLevelId: "L9-2" },
      { id: "C09-003", urdu: "تو کیسا ہے؟", roman: "Tu kaisa hai?", english: "How are you? (Tu - intimate/slang)", category: "greeting", newLevelId: "L9-3" }
    ],
    bossScenario: {
      intro: "Practice switching registers. First, address a taxi driver (respectful), and then address your younger brother (casual).",
      turns: [
        { speakerLine: { urdu: "جی باجی، کہاں جانا ہے؟", roman: "Ji baji, kahan jana hai?", english: "Yes sister, where do we go? (Taxi driver greets you)" }, expectedPhraseId: "C09-001", prompt: "Greet him respectfully: How are you? (Aap)" },
        { speakerLine: { urdu: "بھائی! میں بھی آ رہا ہوں۔", roman: "Bhai! Main bhi aa raha hoon.", english: "Brother! I'm coming too. (Younger brother runs up)" }, expectedPhraseId: "C09-002", prompt: "Greet your brother casually: How are you? (Tum)" }
      ]
    }
  },
  {
    id: "C10",
    number: 10,
    title: "Capstone: Meeting the In-Laws",
    subtitle: "High stakes conversation roleplay at their Karachi home",
    goal: "Combine all greetings, introductions, family descriptions, respect markers, and vocabulary in a complex capstone roleplay.",
    culturalNote: "Congratulations on reaching the Stage 1 Capstone! Meeting in-laws in Karachi or Lahore is the ultimate test of spoken Urdu. Greet respectfully, express gratitude, and converse beautifully.",
    phrases: [
      { id: "C10-001", urdu: "السلام علیکم", roman: "Assalam alaikum", english: "Hello", category: "greeting", newLevelId: "L10-1" },
      { id: "C10-002", urdu: "میں ٹھیک ہوں، شکریہ", roman: "Main theek hoon, shukriya", english: "I am fine, thank you", category: "greeting", newLevelId: "L10-2" },
      { id: "C10-003", urdu: "آپ کا شکریہ", roman: "Aap ka shukriya", english: "Thank you respectfully", category: "courtesy", newLevelId: "L10-3" },
      { id: "C10-004", urdu: "اللہ حافظ", roman: "Allah hafiz", english: "Goodbye", category: "farewell", newLevelId: "L10-4" }
    ],
    bossScenario: {
      intro: "This is it — the Karachi home of your future in-laws. Enter, greet your host respectfully, respond to how you are, thank them warmly for the tea, and say a respectful goodbye.",
      turns: [
        { speakerLine: { urdu: "السلام علیکم! خوش آمدید، تشریف لائیں۔", roman: "Assalam alaikum! Khush aamdeed, tashreef layein.", english: "Hello! Welcome, please come in." }, expectedPhraseId: "C10-001", prompt: "Greet them respectfully in return." },
        { speakerLine: { urdu: "آپ کیسی ہیں؟ سفر کیسا رہا؟", roman: "Aap kaisi hain? Safar kaisa raha?", english: "How are you? How was the travel?" }, expectedPhraseId: "C10-002", prompt: "Say you are fine, thank you." },
        { speakerLine: { urdu: "یہ گرم چائے آپ کے لیے۔", roman: "Yeh garam chai aap ke liye.", english: "This hot tea is for you." }, expectedPhraseId: "C10-003", prompt: "Express your respectful gratitude." },
        { speakerLine: { urdu: "بہت خوشی ہوئی آپ سے مل کر۔ اللہ حافظ۔", roman: "Bohat khushi hui aap se mil kar. Allah hafiz.", english: "Pleased to meet you. Goodbye." }, expectedPhraseId: "C10-004", prompt: "Say goodbye respectfully." }
      ]
    }
  }
];

function generateChapterJson(ch) {
  // Phrases mapping
  const phrases = ch.phrases.map((p, idx) => ({
    id: p.id,
    chapterId: ch.id,
    levelId: p.newLevelId,
    order: idx + 1,
    urdu: p.urdu,
    roman: p.roman,
    english: p.english,
    englishContextual: p.english,
    gender: "neutral",
    category: p.category,
    audio: {
      normal: `audio/${ch.id}/${p.id}-normal.m4a`,
      slow: `audio/${ch.id}/${p.id}-slow.m4a`
    },
    image: null,
    exerciseTypes: ["L_TO_M", "LISTEN_REPEAT", "SPEAK"],
    notes: `Seeded phrase for ${ch.title} learning block.`
  }));

  // Levels mapping (4 standard + 1 boss)
  const levels = [];
  
  for (let l = 1; l <= 4; l++) {
    const levelId = `L${ch.number}-${l}`;
    const levelPhrases = phrases.filter(p => p.levelId === levelId);
    const newPhraseIds = levelPhrases.map(p => p.id);
    
    // Distractor phrase selection
    const distractors = phrases.filter(p => p.levelId !== levelId).map(p => p.id);
    if (distractors.length < 2) {
      distractors.push("C01-001", "C01-006"); // Fallbacks
    }

    const exerciseSequence = [];
    levelPhrases.forEach(p => {
      exerciseSequence.push({ id: `${levelId}-E1-${p.id}`, type: "INTRODUCE", phraseId: p.id });
      exerciseSequence.push({
        id: `${levelId}-E2-${p.id}`,
        type: "L_TO_M",
        phraseId: p.id,
        distractorPhraseIds: distractors.slice(0, 2),
        prompt: "Identify the Urdu meaning."
      });
      exerciseSequence.push({ id: `${levelId}-E3-${p.id}`, type: "LISTEN_REPEAT", phraseId: p.id });
      exerciseSequence.push({
        id: `${levelId}-E4-${p.id}`,
        type: "SPEAK",
        phraseId: p.id,
        prompt: `Say "${p.english}" in Urdu.`,
        hint: p.roman
      });
    });

    levels.push({
      id: levelId,
      chapterId: ch.id,
      number: l,
      title: `Practice Block ${l}`,
      subtitle: `Mastering phrases for ${ch.title}`,
      type: "STANDARD",
      estimatedMinutes: 2,
      newPhraseIds,
      reviewPhraseIds: [],
      exerciseSequence,
      rewards: { xp: 10 }
    });
  }

  // Boss level (level 5)
  const bossLevelId = `L${ch.number}-5`;
  const bossExercises = ch.bossScenario.turns.map((t, idx) => ({
    id: `${bossLevelId}-E${idx + 1}`,
    type: "SCENARIO_TURN",
    speakerLine: {
      audio: `audio/${ch.id}/scenario/turn${idx + 1}.m4a`,
      urdu: t.speakerLine.urdu,
      roman: t.speakerLine.roman,
      english: t.speakerLine.english
    },
    expectedPhraseId: t.expectedPhraseId,
    prompt: t.prompt,
    hint: null
  }));

  levels.push({
    id: bossLevelId,
    chapterId: ch.id,
    number: 5,
    title: `BOSS: ${ch.title} Capstone`,
    subtitle: ch.subtitle,
    type: "BOSS",
    estimatedMinutes: 4,
    newPhraseIds: [],
    reviewPhraseIds: phrases.map(p => p.id),
    scenarioIntro: ch.bossScenario.intro,
    passingScore: 0.75,
    exerciseSequence: bossExercises,
    rewards: { xp: 25, chapterCompleteBonus: 50 }
  });

  return {
    id: ch.id,
    number: ch.number,
    title: ch.title,
    subtitle: ch.subtitle,
    goal: ch.goal,
    estimatedMinutes: 14,
    culturalNote: ch.culturalNote,
    passingScore: 0.75,
    rewards: {
      xp: 50,
      completionMessage: `Aap ne baab ${ch.number} pura kiya! You completed Chapter ${ch.number}. You have successfully mastered ${ch.title}!`
    },
    phrases,
    levels
  };
}

const destDir = path.join(__dirname, "../content/chapters");

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

chaptersData.forEach(ch => {
  const jsonContent = generateChapterJson(ch);
  const filePath = path.join(destDir, `chapter_${ch.number.toString().padStart(2, "0")}.json`);
  fs.writeFileSync(filePath, JSON.stringify(jsonContent, null, 2), "utf8");
  console.log(`Successfully generated: ${filePath}`);
});

console.log("Scaffolding chapters completed successfully!");
