"use client";

import { useState } from "react";

import {
  doc,
  setDoc,
  increment
} from "firebase/firestore";

import { db } from "../firebase";

function randomNum() {
  return (
    Math.floor(
      Math.random() * 10
    ) + 1
  );
}

export default function MiniGame({
  user,
}) {
  const [a, setA] =
    useState(randomNum());

  const [b, setB] =
    useState(randomNum());

  const [answer, setAnswer] =
    useState("");

  function nextQuestion() {
    setA(randomNum());
    setB(randomNum());
    setAnswer("");
  }

  async function awardPoints() {
    if (!user) return;

    await setDoc(
      doc(db, "users", user.uid),
      {
        email: user.email,
        masteryPoints:
          increment(10),
      },
      {
        merge: true,
      }
    );
  }

  async function submit() {
    if (
      Number(answer) ===
      a + b
    ) {
      await awardPoints();

      nextQuestion();
    }
  }

  return (
    <div>
      <h2>Math Game</h2>

      <h3>
        {a} + {b} = ?
      </h3>

      <input
        value={answer}
        onChange={(e) =>
          setAnswer(
            e.target.value
          )
        }
      />

      <button onClick={submit}>
        Submit
      </button>
    </div>
  );
}