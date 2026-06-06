"use client";

import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { randomChoice, subjectsData, subtopicProblemGeneratorsMap } from "../data/subjectsData";

export default function Learn({ user, UIState, setUIState }) {
  const [topic, setTopic] = useState("");
  const [creditsUsed, setCreditsUsed] = useState(3);
  const [clickedToday, setClickedToday] = useState(true);
  const [generateLoading, setGenerateLoading] = useState(false);

  const [selectedSubjects, setSelectedSubjects] = useState(() => {
    const initial = {};
    for (let subject in subjectsData) {
      initial[subject] = { checked: false, subtopics: {} };
      subjectsData[subject].forEach((sub) => (initial[subject].subtopics[sub.name] = false));
    }
    return initial;
  });
  const handleSubjectChange = (subject) => {
    setSelectedSubjects((prev) => {
      const newChecked = !prev[subject].checked;
      const newSubtopics = {};
      for (let sub of subjectsData[subject]) {
        newSubtopics[sub.name] = newChecked;
      }
      return { ...prev, [subject]: { checked: newChecked, subtopics: newSubtopics } };
    });
  };
  const handleSubtopicChange = (subject, subtopic) => {
    setSelectedSubjects((prev) => {
      const newSubtopics = { ...prev[subject].subtopics, [subtopic]: !prev[subject].subtopics[subtopic] };
      const allUnchecked = Object.values(newSubtopics).every((v) => !v);
      return { ...prev, [subject]: { checked: !allUnchecked, subtopics: newSubtopics } };
    });
  };
  const regenerateProblem = (selectedSubtopics) => {
    const randomSubtopic = randomChoice(selectedSubtopics);
    const subtopicProblemGenerators = subtopicProblemGeneratorsMap[randomSubtopic];
    if (subtopicProblemGenerators.length === 0) return ["",""];
    return randomChoice(subtopicProblemGenerators)();
  };
  const toggleReveal = (id) => {
    setUIState((prev) => ({
      ...prev,
      moduleHistory: prev.moduleHistory.map((m) =>
        m.id === id
          ? {
              ...m,
              parameters: {
                ...m.parameters,
                revealed: !m.parameters?.revealed,
              },
            }
          : m
      ),
    }));
  };

  const DAILY_CREDITS = 3;

  const isAdmin = user?.email === "dchill0624@gmail.com";

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (UIState.moduleHistory.length === 0) return;
      e.preventDefault();
      e.returnValue = "";
      return "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [UIState.moduleHistory]);

  useEffect(() => {
    if (!user || !user.emailVerified) return;

    const fetchCredits = async () => {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        setCreditsUsed(0);
        setClickedToday(false);
        return;
      }

      const today = new Date().toISOString().split("T")[0];

      setCreditsUsed(userSnap.data().creditsUsed || 0);
      setClickedToday(userSnap.data().lastClickDate === today);
    };

    fetchCredits();
  }, [user]);

  const handleGenerateModule = async () => {
    if (!topic.trim()) return;

    if (!user || !user.emailVerified) {
      alert("You must create an account to use this feature");
      return;
    }

    //OPENAI API CODE
    const prompt = `Generate one brief ${UIState.studyType} about ${topic}`;

    setGenerateLoading(true);

    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, idToken }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Error generating response");
        return;
      }
      
      const newModule = {
        id: Date.now(),
        content: data.message,
        parameters: { option: "AI"},
      };
      setUIState((prev) => ({
        ...prev,
        moduleHistory: [newModule, ...prev.moduleHistory],
        overlayOption: null,
      }));
      setTopic("");

      setCreditsUsed(data.creditsUsed);
      setClickedToday(true);
    } catch (err) {
      console.error(err);
      alert("Error generating response");
    } finally {
      setGenerateLoading(false);
    }
    //END OF OPENAI API CODE
  };

  const handleAddModule = () => {
    if (UIState.studyType === "lesson") {
      alert("Lessons coming soon");
      return;
    }

    if (UIState.studyType === "difficult quiz problem") {
      alert("Practice quizzes coming soon");
      return;
    }

    const selectedSubtopics = [];
    for (const subject in selectedSubjects) {
      for (const subtopic in selectedSubjects[subject].subtopics) {
        if (selectedSubjects[subject].subtopics[subtopic]) {
          selectedSubtopics.push(subtopic);
        }
      }
    }

    if (selectedSubtopics.length === 0) return;

    const [question, answer] = regenerateProblem(selectedSubtopics);

    const newModule = {
      id: Date.now(),
      content: question,
      parameters: { option: "curated", answer, selectedSubtopics, revealed: false },
    };

    setUIState((prev) => ({
      ...prev,
      moduleHistory: [newModule, ...prev.moduleHistory],
      overlayOption: null,
    }));

    const resetSubjects = {};
    for (const subject in subjectsData) {
      resetSubjects[subject] = { checked: false, subtopics: {} };
      subjectsData[subject].forEach((sub) => (resetSubjects[subject].subtopics[sub.name] = false));
    }
    setSelectedSubjects(resetSubjects);
  };

  const handleDeleteModule = (id) => {
    setUIState((prev) => ({...prev, moduleHistory: prev.moduleHistory.filter((item) => item.id !== id)}));
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 pt-12 px-6">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">
        What would you like to study today?
      </h2>

      <div className="flex flex-wrap gap-4">
        <div className="flex justify-center items-center bg-white shadow-md rounded-full px-4 py-2 transition-all duration-300 focus-within:shadow-lg">
          <div className="flex gap-2">
            <button
              onClick={() => setUIState((prev) => ({...prev, studyType: "lesson"}))}
              className={UIState.studyType === "lesson" ? "selected" : ""}
            >
              A lesson
            </button>

            <button
              onClick={() => setUIState((prev) => ({...prev, studyType: "practice problem"}))}
              className={UIState.studyType === "practice problem" ? "selected" : ""}
            >
              Practice problems
            </button>

            <button
              onClick={() => setUIState((prev) => ({...prev, studyType: "difficult quiz problem"}))}
              className={UIState.studyType === "difficult quiz problem" ? "selected" : ""}
            >
              A practice quiz
            </button>
          </div>
        </div>

        <div className="flex justify-center items-center bg-white shadow-md rounded-full px-4 py-2 transition-all duration-300 focus-within:shadow-lg ml-4">
          <div className="flex gap-2">
            <button
              onClick={() => setUIState((prev) => ({...prev, overlayOption: (prev.overlayOption === "AI" ? null : "AI")}))}
              className={UIState.overlayOption === "AI" ? "selected" : ""}
            >
              Generate with AI
            </button>

            <button
              onClick={() => setUIState((prev) => ({...prev, overlayOption: (prev.overlayOption === "curated" ? null : "curated")}))}
              className={UIState.overlayOption === "curated" ? "selected" : ""}
            >
              Use curated topics
            </button>
          </div>
        </div>
      </div>

      <div className="w-full flex flex-col gap-2 mt-6 relative">
        {UIState.overlayOption === "AI" && (
          <div className="absolute inset-0 z-20 flex items-start justify-center bg-black/40">
            <div className="bg-white mx-2 justify-center rounded-xl shadow-2xl p-2 relative">
              <input
                type="text"
                placeholder="e.g., algebra, calculus"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="border-none outline-none text-gray-600 placeholder-gray-400 font-medium bg-transparent"
                style={{
                  width: `${Math.min(Math.max(topic.length + 1, 40), 80)}ch`,
                  maxWidth: "100%",
                }}
              />
              <button className="btn-generate ml-4 inline-flex items-center gap-2" onClick={handleGenerateModule}>
                {generateLoading ? (
                  <>
                    Generating...
                    <svg
                      className="w-4 h-4 animate-spin text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>
                  </>
                ) : (
                  "✨ Generate module"
                )}
              </button>

              {!isAdmin && user && user.emailVerified && (
                <span className="ml-4 text-gray-600">
                  {Math.max(DAILY_CREDITS-(clickedToday ? creditsUsed : 0),0)} credit{Math.max(DAILY_CREDITS-(clickedToday ? creditsUsed : 0),0) !== 1 ? "s" : ""} left today
                </span>
              )}
            </div>
          </div>
        )}

        {UIState.overlayOption === "curated" && (
          <div className="absolute inset-0 z-20 flex items-start justify-center bg-black/40">
            <div className="bg-white w-full max-w-4xl mx-2 rounded-xl shadow-2xl p-6 relative">
              <h3 className="text-xl font-semibold text-gray-800 mb-2 underline">
                Curated topics
              </h3>

              <h3 className="text-ms font-semibold text-gray-800 mb-2">
                Math
              </h3>

              <div className="flex flex-col gap-3">
                {Object.keys(subjectsData).map((subject) => (
                  <div key={subject} className="flex flex-col gap-1">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedSubjects[subject].checked}
                        onChange={() => handleSubjectChange(subject)}
                      />
                      <span className="font-medium text-gray-600">{subject}</span>
                    </label>
                    <div className="flex flex-col ml-6 gap-1">
                      {subjectsData[subject].map((sub) => (
                        <label key={sub.name} className="flex items-center gap-2 text-gray-600">
                          <input
                            type="checkbox"
                            checked={selectedSubjects[subject].subtopics[sub.name]}
                            onChange={() => handleSubtopicChange(subject, sub.name)}
                          />
                          {sub.name}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <button className="btn-generate mt-4" onClick={handleAddModule}>
                {"📚Add module"}
              </button>
            </div>
          </div>
        )}

        {UIState.moduleHistory.map((item) => (
          <div
            key={item.id}
            className="text-gray-600 flex justify-between items-center bg-white shadow-md rounded px-4 py-2 relative z-0"
          >
            {item.parameters.option === "AI" ? (
              <span>
                {item.content}
              </span>
            ) : (
              <div className="flex items-center justify-between w-full">
                <div className="flex flex-col">
                  <span>{item.content}</span>

                  {item.parameters?.revealed && item.parameters?.answer && (
                    <span className="text-green-700 mt-1">
                      Answer: {item.parameters.answer}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* Reveal button */}
                  <button
                    className="btn-rvl"
                    onClick={() => toggleReveal(item.id)}
                    title="Reveal answer"
                  >
                    👁
                  </button>

                  {/* Regenerate button */}
                  <button
                    className="btn-rgn"
                    onClick={() => {
                      const [question, answer] = regenerateProblem(item.parameters.selectedSubtopics);

                      setUIState((prev) => ({
                        ...prev,
                        moduleHistory: prev.moduleHistory.map((m) =>
                          m.id === item.id
                            ? {
                                ...m,
                                content: question,
                                parameters: {
                                  ...m.parameters,
                                  answer,
                                  revealed: false, // reset on regenerate
                                },
                              }
                            : m
                        ),
                      }));
                    }}
                  >
                    ⟳
                  </button>
                </div>
              </div>
            )}

            <button className="btn-x" onClick={() => handleDeleteModule(item.id)}>
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}