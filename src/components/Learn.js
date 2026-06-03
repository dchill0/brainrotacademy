"use client";

import { useState } from "react";

export default function Learn() {
  const [type, setType] = useState("a lesson ");
  const [topic, setTopic] = useState("");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">
        What would you like to study today?
      </h2>

      <div className="flex items-center bg-white shadow-md rounded-full px-4 py-2 w-full max-w-2xl transition-all duration-300 focus-within:shadow-lg">
        <span className="text-gray-600 mr-2">I want </span>

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="bg-transparent border-none outline-none text-gray-800 font-medium mr-2 cursor-pointer"
        >
          <option value="a lesson ">a lesson </option>
          <option value="practice problems ">practice problems </option>
          <option value="a practice quiz ">a practice quiz </option>
        </select>

        <span className="text-gray-600 mr-2">for</span>

        <input
          type="text"
          placeholder="e.g., integrals, linear algebra"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="flex-1 border-none outline-none text-gray-800 placeholder-gray-400 font-medium bg-transparent"
        />
      </div>
    </div>
  );
}