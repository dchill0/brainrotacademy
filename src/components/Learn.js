"use client";

import { useState, useEffect } from "react";

export default function Learn({ moduleHistory, setModuleHistory }) {
  const [type, setType] = useState("lesson");
  const [topic, setTopic] = useState("");

  useEffect(() => {
    console.log("Saving history:", moduleHistory);
    localStorage.setItem("savedHistory", JSON.stringify(moduleHistory));
  }, [moduleHistory]);

  const handleGenerateModule = () => {
    if (!topic.trim()) return;
    const newEntry = { id: Date.now(), type, topic };
    setModuleHistory((prev) => [newEntry, ...prev]);
    setTopic("");
  };

  const handleDeleteModule = (id) => {
    setModuleHistory((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 pt-12 px-6">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">
        What would you like to study today?
      </h2>

      <div className="flex items-center w-full max-w-2xl gap-3">
        <div className="flex items-center bg-white shadow-md rounded-full px-4 py-2 w-full max-w-2xl transition-all duration-300 focus-within:shadow-lg">
          <span className="text-gray-600 mr-2">I want </span>

          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="bg-transparent border-none outline-none text-gray-800 font-medium mr-2 cursor-pointer"
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
            className="flex-1 border-none outline-none text-gray-800 placeholder-gray-400 font-medium bg-transparent"
          />
        </div>

        <button className="btn-ai" onClick={handleGenerateModule}>
          Generate✨
        </button>
      </div>

      <div className="w-full max-w-2xl flex flex-col gap-2 mt-6">
        {moduleHistory.map((item) => (
          <div
            key={item.id}
            className="flex justify-between items-center bg-white shadow-md rounded px-4 py-2"
          >
            <span>
              {item.type} about {item.topic}
            </span>
            <button
              onClick={() => handleDeleteModule(item.id)}
              className="text-red-500 font-bold hover:text-red-700"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}