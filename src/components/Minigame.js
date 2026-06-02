"use client";

import { useEffect, useState } from "react";

import { doc, setDoc, increment } from "firebase/firestore";
import { db } from "../firebase";

function generatePuzzle() {
  const numbers = Array.from({length:5}, () => Math.floor(Math.random()*10)+1);
  const tuples = numbers.map(n => ["num",[n,1]]);
  const ops = [
    ["op", (x,y) => [x[0] * y[1] + y[0] * x[1], x[1] * y[1]]],
    ["op", (x,y) => [x[0] * y[1] - y[0] * x[1], x[1] * y[1]]],
    ["op", (x,y) => [x[0] * y[0], x[1] * y[1]]],
    ["op", (x,y) => [x[0] * y[1], y[0] * x[1]]]
  ];

  function permutations(origArr) {
    let perms = [];
    function permute(m1,m2=[]) {
      if (m1.length === 0) {
        perms.push(m2);
        return;
      }
      for (let i = 0; i < m1.length; i++) {
        let newArr = m1.slice(0,i).concat(m1.slice(i+1));
        permute(newArr, m2.concat([m1[i]]));
      }
    }
    permute(origArr);
    return perms;
  }

  const integerResults = new Map();
  const perms = permutations(tuples);
  for (const p of perms) {
    const [a,b,c,d,e] = p;
    for (const F of ops) {
      for (const G of ops) {
        for (const H of ops) {
          for (const I of ops) {
            const arr_arr = [
              [a,b,c,G,d,H,e,I,F],
              [a,b,c,d,H,G,e,I,F],
              [a,b,c,G,d,e,I,H,F],
              [a,b,c,d,H,e,I,G,F],
              [a,b,c,d,e,I,H,G,F],
              [a,b,F,c,d,H,e,I,G],
              [a,b,F,c,d,e,I,H,G],
              [a,b,F,c,G,d,e,I,H],
              [a,b,c,G,F,d,e,I,H],
              [a,b,F,c,G,d,H,e,I],
              [a,b,c,G,F,d,H,e,I],
              [a,b,F,c,d,H,G,e,I],
              [a,b,c,G,d,H,F,e,I],
              [a,b,c,d,H,G,F,e,I]
            ];
            for (const arr of arr_arr) {
              let stack = [];
              for (const node of arr) {
                if (node[0] === "num") {
                  stack.push(node[1]);
                } else {
                  const B = stack.pop();
                  const A = stack.pop();
                  stack.push(node[1](A,B));
                }
              }
              let r = stack[0];
              if (r[1] !== 0 && r[0]%r[1] === 0) {
                let ir = Math.floor(r[0] / r[1]);
                if (ir >= 20 && ir <= 99) {
                  if (!integerResults[ir]) integerResults[ir] = 0;
                  integerResults[ir]++;
                }
              }
            }
          }
        }
      }
    }
  }
  const values = Object.values(integerResults);
  const mv = Math.min(...values);

  let target;

  if (mv > 400) {
    const keys = Object.keys(integerResults);
    target = keys[Math.floor(Math.random() * keys.length)];
  } else {
    let buckets = [[[], [], [], [], [], []],[[], [], [], [], [], []]];
    let below = false;
    let above = false;

    for (const [e, v] of Object.entries(integerResults)) {
      const half = Math.floor((e-20)/40);
      if (half === 0) {
        below = true;
      } else {
        above = true;
      }
      buckets[half][Math.min(Math.floor((v-1)/20),5)].push(e)
    }

    const row = (below && above) ? Math.floor(Math.random()*2) : (below ? 0 : 1);
    let indices = [];
    for (let i = 0; i < 6; i++) {
      if (buckets[row][i].length > 0) indices.push(i);
    }

    const chosenBucket = buckets[row][indices[Math.floor(Math.random() * indices.length)]];
    target = chosenBucket[Math.floor(Math.random() * chosenBucket.length)];
  }
  return [numbers,target]
}

function checkAnswer(numbers,target,expression) {
  let exprArr = [...expression].filter(ch => ch !== " ");
  const allowedChars = "0123456789+-*x/()[]";
  let L = exprArr.length;
  if (L == 0) {
    return "NO_ANSWER";
  }
  if (L > 100) {
    return "LONG_ANSWER";
  }
  for (let i = 0; i < L; i++) {
    let e = exprArr[i]
    if (!allowedChars.includes(e)) {
      return "BAD_ANSWER";
    } else if (e === "x") {
      exprArr[i] = "*";
    } else if (e === "[") {
      exprArr[i] = "(";
    } else if (e === "]") {
      exprArr[i] = ")";
    }
  }
  expression = exprArr.join("");

  let pos = 0;
  function peek() {
    if (pos < L) return expression[pos];
    return "n";
  }

  function consume() {
    let ch = peek();
    if (ch !== "n") pos++;
    return ch;
  }

  let terms = [];

  function parseExpression() {
    let [a,b] = parseTerm();

    while ("+-".includes(peek())) {
      let op = consume();
      let [c,d] = parseTerm();
      if (op === "+") {
        [a,b] = [a*d+b*c,b*d];
      } else {
        [a,b] = [a*d-b*c,b*d];
      }
    }

    return [a,b];
  }

  function parseTerm() {
    let [a,b] = parseFactor();

    while ("*/".includes(peek())) {
      let op = consume();
      let [c,d] = parseTerm();
      if (op === "*") {
        [a,b] = [a*c,b*d];
      } else {
        [a,b] = [a*d,b*c];
      }
    }

    return [a,b];
  }

  function parseFactor() {
    let ch = peek();
    if (ch === "n") {
      return "INV_ANSWER";
    }
    if (ch === "(") {
      consume();
      let value = parseExpression();
      if (consume() !== ")") {
        return "INV_ANSWER";
      }
      return value;
    }
    if (/\d/.test(ch)) {
      let start = pos;
      while (peek() && /\d/.test(peek())) {
        consume();
      }
      let num = parseInt(expression.slice(start,pos),10);
      terms.push(num);
      return [num,1];
    }
    return "INV_ANSWER";
  }

  let [a,b] = parseExpression();
  if (pos !== L) {
    return "INV_ANSWER";
  }
  if (b !== 0 && a%b === 0 && b*target === a) {
    const sorted_numbers = [...numbers].sort((z1,z2) => z1-z2);
    const sorted_terms = [...terms].sort((z1,z2) => z1-z2);
    if (JSON.stringify(sorted_numbers) === JSON.stringify(sorted_terms)) {
      return "RIGHT_ANSWER";
    } else {
      return "CHEAT_ANSWER";
    }
  }
  return "WRONG_ANSWER";
}

export default function MiniGame({ user }) {
  const [numbers, setNumbers] = useState([]);
  const [target, setTarget] = useState(null);
  const [answer, setAnswer] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const [numbers, target] = generatePuzzle();
    setNumbers(numbers);
    setTarget(target);
  }, []);

  function nextQuestion() {
    const [numbers, target] = generatePuzzle();
    setNumbers(numbers);
    setTarget(target);
    setAnswer("");
  }

  async function awardPoints() {
    if (!user) return;

    await setDoc(
      doc(db, "users", user.uid),
      {
        email: user.email,
        masteryPoints: increment(10),
      },
      { merge: true }
    );
  }

  async function submit() {
    if (numbers.length === 0) return;

    const verdict = checkAnswer(numbers,target,answer);

    if (verdict === "NO_ANSWER") {
      setMessage("Please enter an answer");
    } else if (verdict === "LONG_ANSWER") {
      setMessage("Your answer is too long");
    } else if (verdict === "BAD_ANSWER") {
      setMessage("Your answer contains an invalid character");
    } else if (verdict === "INV_ANSWER") {
      setMessage("Your answer is an invalid expression");
    } else if (verdict === "CHEAT_ANSWER") {
      setMessage("Your answer doesn't use each number exactly once")
    } else if (verdict === "WRONG_ANSWER") {
      setMessage("Your answer is incorrect")
    } else if (verdict === "RIGHT_ANSWER") {
      setMessage("Your answer is correct!")
      await awardPoints();
      nextQuestion();
    }
  }

  if (numbers.length === 0) {
    return <p>Loading game...</p>;
  }

  return (
    <div>
      <h2>Math Game</h2>

      <h3>Numbers: {numbers.join(" ")}</h3>
      <h3>Target: {target}</h3>

      <input
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
      />

      <button onClick={submit}>Submit</button>
      <h4>{message}</h4>

    </div>
  );
}