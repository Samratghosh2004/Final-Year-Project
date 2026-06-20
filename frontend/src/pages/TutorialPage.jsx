import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

const TutorialPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  // ── Dictionary data (expanded to all 8 regional languages) ──────────────
  const tutorialCards = [
    {
      id: "namaste",
      label: "Namaste / Hello",
      tip: "Keep fingers together and smile respectfully.",
      regional: {
        Hindi: "नमस्ते",
        Tamil: "வணக்கம்",
        Telugu: "నమస్కారం",
        Bengali: "নমস্কার",
        Marathi: "नमस्कार",
        Kannada: "ನಮಸ್ಕಾರ",
        Gujarati: "નમસ્તે",
        Malayalam: "നമസ്കാരം",
      },
    },
    {
      id: "water",
      label: "Water",
      tip: "Move your hand gently toward your mouth.",
      regional: {
        Hindi: "पानी",
        Tamil: "தண்ணீர்",
        Telugu: "నీరు",
        Bengali: "জল",
        Marathi: "पाणी",
        Kannada: "ನೀರು",
        Gujarati: "પાણી",
        Malayalam: "വെള്ളം",
      },
    },
    {
      id: "thankyou",
      label: "Thank You",
      tip: "Move your hand outward from your chin.",
      regional: {
        Hindi: "धन्यवाद",
        Tamil: "நன்றி",
        Telugu: "ధన్యవాదాలు",
        Bengali: "ধন্যবাদ",
        Marathi: "धन्यवाद",
        Kannada: "ಧನ್ಯವಾದಗಳು",
        Gujarati: "આભાર",
        Malayalam: "നന്ദി",
      },
    },
    {
      id: "help",
      label: "Help",
      tip: "Raise one hand while supporting it with the other.",
      regional: {
        Hindi: "मदद",
        Tamil: "உதவி",
        Telugu: "సహాయం",
        Bengali: "সাহায্য",
        Marathi: "मदत",
        Kannada: "ಸಹಾಯ",
        Gujarati: "મદદ",
        Malayalam: "സഹായം",
      },
    },
    {
      id: "food",
      label: "Food / Hungry",
      tip: "Touch fingertips together and move toward lips.",
      regional: {
        Hindi: "खाना",
        Tamil: "உணவு",
        Telugu: "ఆహారం",
        Bengali: "খাবার",
        Marathi: "जेवण",
        Kannada: "ಆಹಾರ",
        Gujarati: "ખોરાક",
        Malayalam: "ഭക്ഷണം",
      },
    },
    {
      id: "emergency",
      label: "Emergency",
      tip: "Wave your hand quickly to attract attention.",
      regional: {
        Hindi: "आपातकाल",
        Tamil: "அவசரம்",
        Telugu: "అత్యవసరం",
        Bengali: "জরুরি",
        Marathi: "आपत्कालीन",
        Kannada: "ತುರ್ತು",
        Gujarati: "કટોકટી",
        Malayalam: "അടിയന്തരാവസ്ഥ",
      },
    },
  ];

  // ── Quiz question pool ───────────────────────────────────────────────────
  const quizPool = [
    {
      videoId: "namaste",
      question: "What does this gesture mean?",
      options: ["Water", "Namaste / Hello", "Thank You", "Help"],
      answer: 1,
    },
    {
      videoId: "water",
      question: "What does this gesture mean?",
      options: ["Food / Hungry", "Emergency", "Water", "Namaste / Hello"],
      answer: 2,
    },
    {
      videoId: "thankyou",
      question: "What does this gesture mean?",
      options: ["Thank You", "Help", "Water", "Emergency"],
      answer: 0,
    },
    {
      videoId: "help",
      question: "What does this gesture mean?",
      options: ["Food / Hungry", "Namaste / Hello", "Help", "Thank You"],
      answer: 2,
    },
    {
      videoId: "food",
      question: "What does this gesture mean?",
      options: ["Food / Hungry", "Water", "Emergency", "Thank You"],
      answer: 0,
    },
    {
      videoId: "emergency",
      question: "What does this gesture mean?",
      options: ["Help", "Emergency", "Namaste / Hello", "Food / Hungry"],
      answer: 1,
    },
  ];

  // ── Alphabet reference (A-Z fingerspelling) ──────────────────────────────
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const [selectedLetter, setSelectedLetter] = useState("A");

  const filteredCards = tutorialCards.filter((card) =>
    card.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentQuiz = quizPool[quizIndex];

  const handleAnswerClick = (idx) => {
    if (selectedAnswer !== null) return; // already answered
    setSelectedAnswer(idx);
    setScore((prev) => ({
      correct: prev.correct + (idx === currentQuiz.answer ? 1 : 0),
      total: prev.total + 1,
    }));
  };

  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setQuizIndex((prev) => (prev + 1) % quizPool.length);
  };

  const handlePracticeLive = (card) => {
    // Navigate to the live translator, passing the target word/sign as state
    navigate("/translator", { state: { practiceWord: card.label, practiceId: card.id } });
  };

  // ── Reusable local VIDEO component (for .mp4 files) ───────────────
  const SignVideo = ({ src, label }) => {
    const [errored, setErrored] = useState(false);

    if (errored) {
      return (
        <div className="aspect-video bg-slate-700 rounded-2xl flex flex-col items-center justify-center text-center px-4">
          <span className="text-3xl mb-2">🎬</span>
          <p className="text-sm text-gray-400">
            Missing Video: <code className="text-emerald-400">{src}</code>
          </p>
        </div>
      );
    }

    return (
      <video
        className="w-full h-64 bg-[#111827] rounded-2xl object-contain p-4"
        src={src}
        controls
        loop
        muted
        playsInline
        onError={() => setErrored(true)}
      />
    );
  };

  // ── Reusable local IMAGE component (for .jpg files) ───────────────
  const SignImage = ({ src, label }) => {
    const [errored, setErrored] = useState(false);

    if (errored) {
      return (
        <div className="aspect-video bg-slate-700 rounded-2xl flex flex-col items-center justify-center text-center px-4">
          <span className="text-3xl mb-2">🖼️</span>
          <p className="text-sm text-gray-400">
            Missing Image: <code className="text-emerald-400">{src}</code>
          </p>
        </div>
      );
    }

    return (
      <img
        className="w-full h-64 bg-[#111827] rounded-2xl object-contain p-4"
        src={src}
        alt={`Sign for ${label}`}
        onError={() => setErrored(true)}
      />
    );
  };

  return (
    <div className="min-h-screen bg-[#070B1A] text-white">
      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* HERO SECTION */}
        <div className="grid lg:grid-cols-3 gap-8 items-start mb-12">

          {/* LEFT */}
          <div className="lg:col-span-2">
            <p className="text-emerald-400 text-sm font-semibold mb-3">
              INTERACTIVE LEARNING CENTER
            </p>

            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-5">
              Learn Common Signs in 5 Minutes
            </h1>

            <p className="text-gray-400 text-lg max-w-2xl">
              Learn daily-use Indian Sign Language gestures with
              multilingual translations and interactive learning cards.
            </p>
          </div>

          {/* SEARCH BOX */}
          <div className="bg-[#0D1326] border border-slate-800 rounded-2xl p-6">
            <p className="text-xs text-gray-400 font-semibold mb-4">
              SEARCH SIGN DICTIONARY
            </p>

            <div className="relative">
              <input
                type="text"
                placeholder="Search 'water', 'hello', 'food'..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-emerald-400"
              />

              <button
                onClick={() => setSearchQuery(searchQuery)}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-emerald-400 text-black px-4 py-2 rounded-lg font-semibold hover:bg-emerald-300 transition"
              >
                Search
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-3">
              Search from 100+ signs
            </p>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="grid lg:grid-cols-4 gap-8">

          {/* LEFT SIDEBAR */}
          <div className="space-y-6">

            {/* TUTORIAL */}
            <div className="bg-[#0D1326] border border-slate-800 rounded-2xl p-6">
              <h2 className="text-2xl font-bold mb-5">
                How to show signs clearly
              </h2>

              <div className="mb-6">
                <SignVideo src="/assets/signs/namaste.mp4" label="How to show signs clearly" />
              </div>

              <div className="space-y-5">

                <div className="flex gap-3">
                  <span className="text-emerald-400 text-xl">✓</span>

                  <div>
                    <h4 className="font-semibold text-emerald-400">
                      Good Lighting
                    </h4>

                    <p className="text-sm text-gray-400">
                      Ensure light is in front of you.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="text-emerald-400 text-xl">✓</span>

                  <div>
                    <h4 className="font-semibold text-emerald-400">
                      Clear Hand Position
                    </h4>

                    <p className="text-sm text-gray-400">
                      Keep gestures visible at chest level.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="text-emerald-400 text-xl">✓</span>

                  <div>
                    <h4 className="font-semibold text-emerald-400">
                      Slow Motion
                    </h4>

                    <p className="text-sm text-gray-400">
                      Hold gestures for 2 seconds.
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* QUIZ */}
            <div className="bg-[#16101A] border border-orange-900 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-orange-400 text-xs font-bold">
                  QUICK QUIZ
                </p>
                <p className="text-xs text-gray-500">
                  Score: {score.correct}/{score.total}
                </p>
              </div>

              <h3 className="text-2xl font-bold mb-5">
                Guess the sign below
              </h3>

              <div className="mb-5">
                <SignVideo
                  src={`/assets/signs/${currentQuiz.videoId}.mp4`}
                  label={tutorialCards.find((c) => c.id === currentQuiz.videoId)?.label || currentQuiz.videoId}
                />
              </div>

              <p className="text-gray-400 mb-5">
                {currentQuiz.question}
              </p>

              <div className="space-y-3">
                {currentQuiz.options.map((opt, idx) => {
                  const letters = ["A", "B", "C", "D"];
                  let style = "w-full border border-slate-700 rounded-xl py-3 text-left px-4 hover:border-emerald-400 transition";

                  if (selectedAnswer !== null) {
                    if (idx === currentQuiz.answer) {
                      style = "w-full border border-emerald-400 bg-emerald-400/10 text-emerald-400 rounded-xl py-3 text-left px-4";
                    } else if (idx === selectedAnswer) {
                      style = "w-full border border-red-500 bg-red-500/10 text-red-400 rounded-xl py-3 text-left px-4";
                    } else {
                      style = "w-full border border-slate-800 text-gray-500 rounded-xl py-3 text-left px-4";
                    }
                  }

                  return (
                    <button key={idx} className={style} onClick={() => handleAnswerClick(idx)}>
                      {letters[idx]}. {opt}
                      {selectedAnswer !== null && idx === currentQuiz.answer && " ✓"}
                      {selectedAnswer !== null && idx === selectedAnswer && idx !== currentQuiz.answer && " ✗"}
                    </button>
                  );
                })}
              </div>

              {selectedAnswer !== null && (
                <button
                  onClick={handleNextQuestion}
                  className="w-full mt-4 bg-orange-400 text-black font-semibold rounded-xl py-3 hover:bg-orange-300 transition"
                >
                  Next Question →
                </button>
              )}
            </div>

            {/* ALPHABET REFERENCE */}
            <div className="bg-[#0D1326] border border-slate-800 rounded-2xl p-6">
              <p className="text-emerald-400 text-xs font-bold mb-2">
                FINGERSPELLING CHART
              </p>
              <h3 className="text-2xl font-bold mb-5">
                ISL Alphabet Reference
              </h3>

              <div className="mb-5">
                <SignImage
                  src={`/assets/alphabet/${selectedLetter.toLowerCase()}.png`}
                  label={`Letter ${selectedLetter}`}
                />
              </div>

              <div className="grid grid-cols-7 gap-2">
                {alphabet.map((letter) => (
                  <button
                    key={letter}
                    onClick={() => setSelectedLetter(letter)}
                    className={`aspect-square rounded-lg font-bold text-sm transition ${
                      selectedLetter === letter
                        ? "bg-emerald-400 text-black"
                        : "bg-slate-900 border border-slate-700 hover:border-emerald-400"
                    }`}
                  >
                    {letter}
                  </button>
                ))}
              </div>

              <p className="text-xs text-gray-500 mt-4">
                Tap a letter to preview its hand shape. This matches the alphabet
                your camera recognizes in the Live Translator.
              </p>
            </div>
          </div>

          {/* RIGHT SECTION */}
          <div className="lg:col-span-3">

            {/* HEADER */}
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold">
                Common Daily Phrases Dictionary
              </h2>

              <p className="text-gray-500 text-sm">
                Showing {filteredCards.length} gestures
              </p>
            </div>

            {/* CARDS */}
            <div className="grid md:grid-cols-2 gap-6">

              {filteredCards.map((card) => (
                <div
                  key={card.id}
                  className="bg-[#0D1326] border border-slate-800 rounded-2xl overflow-hidden hover:border-emerald-400 transition"
                >

                  {/* VIDEO */}
                  <SignVideo src={`/assets/signs/${card.id}.mp4`} label={card.label} />

                  {/* CONTENT */}
                  <div className="p-5">

                    {/* TITLE */}
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="text-xl font-bold">
                        {card.label}
                      </h3>

                      <span className="text-xs bg-emerald-400/10 text-emerald-400 px-3 py-1 rounded-full">
                        High
                      </span>
                    </div>

                    {/* TRANSLATIONS — scrollable horizontal chips */}
                    <div className="bg-[#111827] rounded-xl p-4 mb-5">
                      <h4 className="text-sm text-gray-400 mb-4">
                        Regional Language Translation
                      </h4>

                      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-thin">
                        {Object.entries(card.regional).map(([lang, word]) => (
                          <div
                            key={lang}
                            className="bg-slate-900 rounded-lg px-4 py-2 text-center shrink-0 min-w-[88px]"
                          >
                            <p className="text-sm font-medium">{word}</p>
                            <p className="text-[10px] text-gray-500 mt-1">{lang}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* TIP */}
                    <div className="bg-slate-900 rounded-xl p-4 mb-5">
                      <p className="text-sm text-gray-300">
                         {card.tip}
                      </p>
                    </div>

                    {/* FOOTER */}
                    <div className="flex items-center justify-between">

                      <span className="text-emerald-400 text-sm font-medium">
                        Recognition: High
                      </span>

                      <button
                        onClick={() => handlePracticeLive(card)}
                        className="bg-emerald-400/10 text-emerald-400 px-4 py-2 rounded-lg text-sm hover:bg-emerald-400 hover:text-black transition"
                      >
                        Practice Live →
                      </button>

                    </div>

                  </div>
                </div>
              ))}

            </div>

            {/* EMPTY STATE */}
            {filteredCards.length === 0 && (
              <div className="text-center py-20">
                <h3 className="text-3xl font-bold mb-3">
                  No Sign Found
                </h3>

                <p className="text-gray-400">
                  Try searching another keyword.
                </p>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorialPage;