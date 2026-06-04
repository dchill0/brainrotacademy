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

  let below = [];
  let above = [];
  for (const key in integerResults) {
    const k = Number(key);
    if (k < 60) {
      below.push([integerResults[k],k]);
    } else {
      above.push([integerResults[k],k]);
    }
  }
  below.sort((t1,t2) => t1[0]-t2[0]);
  above.sort((t1,t2) => t1[0]-t2[0]);
  let i1 = 0, i2 = 0;
  const belowLen = below.length;
  const aboveLen = above.length;
  let level = 50;
  let target = null;
  while (true) {
    while (i1 < belowLen && below[i1][0] <= level) {
      i1++;
    }
    while (i2 < aboveLen && above[i2][0] <= level) {
      i2++;
    }
    if (i1 > 0 && i2 > 0) {
      const belowIndex = Math.floor(Math.random()*i1);
      const aboveIndex = Math.floor(Math.random()*i2);
      target = Math.random() < 0.5 ? below[belowIndex][1] : above[aboveIndex][1];
      break;
    }
    level*=2;
  }
  return [numbers,target]
}

function checkAnswer(numbers,target,expression) {
  try {
    let exprArr = [...expression].filter(ch => ch !== " ");
    const allowedChars = "0123456789+-*x/()[]";
    let L = exprArr.length;
    if (L == 0) {
      throw "NO_ANSWER";
    }
    if (L > 100) {
      throw "LONG_ANSWER";
    }
    for (let i = 0; i < L; i++) {
      let e = exprArr[i]
      if (!allowedChars.includes(e)) {
        throw "BAD_ANSWER";
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

      while (true) {
        let ch = peek();
        if ("*/".includes(peek())) {
          let op = consume();
          let [c,d] = parseFactor();
          if (op === "*") {
            [a,b] = [a*c,b*d];
          } else {
            [a,b] = [a*d,b*c];
          }
        } else if (ch === "(") {
          let [c,d] = parseFactor();
          [a,b] = [a*c,b*d];
        } else {
          break;
        }
      }

      return [a,b];
    }

    function parseFactor() {
      let ch = peek();
      if (ch === "+" || ch === "-") {
        let op = consume();
        let [a,b] = parseFactor();
        return op === "-" ? [-a,b] : [a,b];
      }
      if (ch === "n") {
        throw "INV_ANSWER";
      }
      if (ch === "(") {
        consume();
        let value = parseExpression();
        if (consume() !== ")") {
          throw "INV_ANSWER";
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
      throw "INV_ANSWER";
    }

    let [a,b] = parseExpression();
    if (pos !== L) {
      throw "INV_ANSWER";
    }
    if (b !== 0 && a%b === 0 && b*target === a) {
      const sorted_numbers = [...numbers].sort((z1,z2) => z1-z2);
      const sorted_terms = [...terms].sort((z1,z2) => z1-z2);
      if (JSON.stringify(sorted_numbers) === JSON.stringify(sorted_terms)) {
        return "RIGHT_ANSWER";
      } else {
        throw "CHEAT_ANSWER";
      }
    }
    throw "WRONG_ANSWER";
  } catch (err) {
    return err;
  }
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
    if (!user || !user.emailVerified) return;

    await setDoc(
      doc(db, "users", user.uid),
      {
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
      <h2>Daily Puzzles</h2>

      <h3>Can you make {target} using the numbers {numbers.join(", ")}?</h3>
      <h4>Use the operations addition (+), subtraction (-), multiplication (*), and division (/)</h4>
      <h4>Additionally, you must use each number exactly once in your answer</h4>

      <input
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
      />

      <button onClick={submit}>Submit</button>
      <h4>{message}</h4>

    </div>
  );
}