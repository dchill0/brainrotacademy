"use client";

import { useState, useEffect } from "react";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function Learn({ user, moduleHistory, setModuleHistory }) {
  const [type, setType] = useState("lesson");
  const [topic, setTopic] = useState("");
  const [creditsUsed, setCreditsUsed] = useState(3);

  const isAdmin = user?.email === "dchill0624@gmail.com";

  const DAILY_CREDITS = 3;

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
    if (!user || !user.emailVerified || isAdmin) return;

    const fetchCredits = async () => {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      const today = new Date().toISOString().split("T")[0];

      if (!userSnap.exists()) {
        await setDoc(userRef, { creditsUsed: 0, lastClickDate: today });
        setCreditsUsed(0);
        return;
      }

      const data = userSnap.data();
      if (data.lastClickDate !== today) {
        await updateDoc(userRef, { creditsUsed: 0, lastClickDate: today });
        setCreditsUsed(0);
      } else {
        setCreditsUsed(data.creditsUsed);
      }
    };

    fetchCredits();
  }, [user, isAdmin]);

  const handleGenerateModule = async () => {
    if (!topic.trim()) return;

    if ((!user || !user.emailVerified) && !isAdmin) {
      alert("Please create an account or login to use the AI generation feature");
      return;
    }

    if (!isAdmin && creditsUsed >= DAILY_CREDITS) {
      alert(`You have reached your daily limit of ${DAILY_CREDITS} generations.`);
      return;
    }

    const newEntry = { id: Date.now(), type, topic };
    setModuleHistory((prev) => [newEntry, ...prev]);
    setTopic("");

    if (user && user.emailVerified && !isAdmin) {
      const userRef = doc(db, "users", user.uid);
      const today = new Date().toISOString().split("T")[0];
      const userSnap = await getDoc(userRef);
      let credits = 1;

      if (userSnap.exists() && userSnap.data().lastClickDate === today) {
        credits = userSnap.data().creditsUsed + 1;
      }

      await setDoc(userRef, { creditsUsed: credits, lastClickDate: today });
      setCreditsUsed(credits);
    }
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
            <option value="problems">practice problems </option>
            <option value="quiz">a practice quiz </option>
          </select>

          <span className="text-gray-600 mr-2">about </span>

          <input
            type="text"
            placeholder="e.g., integrals, linear algebra"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="flex-1 border-none outline-none text-gray-600 placeholder-gray-400 font-medium bg-transparent"
          />
        </div>

        <button className="btn-ai" onClick={handleGenerateModule}>
          Generate✨
        </button>

        {!isAdmin && user && user.emailVerified && (
          <span className="ml-2 text-gray-600">
            {DAILY_CREDITS-creditsUsed} credit{DAILY_CREDITS-creditsUsed !== 1 ? "s" : ""} left today
          </span>
        )}
      </div>

      <div className="w-full max-w-2xl flex flex-col gap-2 mt-6">
        {moduleHistory.map((item) => (
          <div
            key={item.id}
            className="text-gray-600 flex justify-between items-center bg-white shadow-md rounded px-4 py-2"
          >
            <span>
              {item.type} about {item.topic}
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