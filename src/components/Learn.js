"use client";

import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function Learn({ user, moduleHistory, setModuleHistory }) {
  const [type, setType] = useState("lesson");
  const [topic, setTopic] = useState("");
  const [creditsUsed, setCreditsUsed] = useState(3);
  const [generateLoading, setGenerateLoading] = useState(false);

  const DAILY_CREDITS = 3;

  const isAdmin = user?.email === "dchill0624@gmail.com";

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (moduleHistory.length === 0) return;
      e.preventDefault();
      e.returnValue = "";
      return "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [moduleHistory]);

  useEffect(() => {
    if (!user || !user.emailVerified) return;

    const fetchCredits = async () => {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        setCreditsUsed(0);
        return;
      }

      setCreditsUsed(userSnap.data().creditsUsed || 0);
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
    const prompt = `Generate one brief ${type} about ${topic}`;

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
      setModuleHistory((prev) => [{ id: Date.now(), message: data.message }, ...prev]);
      setTopic("");

      setCreditsUsed((prev) => prev + 1);
    } catch (err) {
      alert("Error generating response");
    } finally {
      setGenerateLoading(false);
    }
    //END OF OPENAI API CODE
  };

  const handleDeleteModule = (id) => {
    setModuleHistory((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 pt-12 px-6">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">
        What would you like to study today?
      </h2>

      <div className="flex flex-wrap justify-center items-center w-full gap-3">
        <div className="flex items-center bg-white shadow-md rounded-full px-4 py-2 w-full max-w-2xl transition-all duration-300 focus-within:shadow-lg">
          <span className="text-gray-600 mr-2">I want </span>

          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="bg-transparent border-none outline-none text-gray-600 font-medium mr-2 cursor-pointer"
          >
            <option value="lesson">a lesson </option>
            <option value="practice problem">practice problems </option>
            <option value="difficult quiz problem">a practice quiz </option>
          </select>

          <span className="text-gray-600 mr-2">about </span>

          <input
            type="text"
            placeholder="e.g., algebra, calculus"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="flex-1 border-none outline-none text-gray-600 placeholder-gray-400 font-medium bg-transparent"
          />
        </div>

        <button className="btn-ai" onClick={handleGenerateModule}>
          {generateLoading ? "Generating..." : "Generate✨"}
        </button>

        {!isAdmin && user && user.emailVerified && (
          <span className="ml-2 text-gray-600">
            {Math.max(DAILY_CREDITS-creditsUsed,0)} credit{Math.max(DAILY_CREDITS-creditsUsed,0) !== 1 ? "s" : ""} left today
          </span>
        )}
      </div>

      <div className="w-full flex flex-col gap-2 mt-6">
        {moduleHistory.map((item) => (
          <div
            key={item.id}
            className="text-gray-600 flex justify-between items-center bg-white shadow-md rounded px-4 py-2"
          >
            <span>
              {item.message}
            </span>
            <button className="btn-x" onClick={() => handleDeleteModule(item.id)}>
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}