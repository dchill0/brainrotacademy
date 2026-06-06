function randomSign() {
  return Math.random() < 0.5 ? -1 : 1;
}

function randomInt(low,high) {
  return Math.floor(Math.random()*(high-low+1))+low;
}

export function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export const subjectsData = {
  "Algebra": [
    {name: "Linear equations", problemGenerators: [
      function() {
        const a = randomInt(2,10)*randomSign();
        const b = randomInt(-10,10);
        const c = randomInt(1,10);
        const cs = randomSign();
        const d = a*b+c*cs;
        return [`Solve for x in the equation ${a}x${c*cs < 0 ? "-" : "+"}${c}=${d}`,`x=${b}`];
      }
    ]},
    {name: "Polynomials", problemGenerators: [
      function() {
        const a = randomInt(-10,10);
        const b = randomInt(-10,10);
        const c = -(a+b);
        const d = a*b;
        let question = `Solve for x in the equation x^2${c < 0 ? "" : "+"}${c}x${d < 0 ? "" : "+"}${d}=0`;
        if (c === 0) {
          question = `Solve for x in the equation x^2${d < 0 ? "" : "+"}${d}=0`;
        }
        return [question,(a === b ? `x=${a}` : `x=${a},${b}`)];
      }
    ]},
  ],
  "Pre-Calculus": [
    {name: "Functions", problemGenerators: [
      function() {
        const baseAngles = [0,30,45,60,90];
        const funcs = ["sin","cos"];
        const answers = {
          "sin":{0:"0",30:"1/2",45:"√2/2",60:"√3/2",90:"1"},
          "cos":{0:"1",30:"√3/2",45:"√2/2",60:"1/2",90:"0"}
        }
        const angles = [0,30,45,60,90,120,135,150,180,210,225,240,270,300,315,330];

        const angle = randomChoice(angles);
        const func = randomChoice(funcs);
        let trigValue = "";
        if (angle <= 90) {
          trigValue = answers[func][angle];
        } else if (angle <= 180) {
          trigValue = (func === "cos" ? "-" : "")+answers[func][180-angle];
        } else if (angle <= 270) {
          trigValue = "-"+answers[func][angle-180];
        } else {
          trigValue = (func === "sin" ? "-" : "")+answers[func][360-angle];
        }
        return [`What is ${func} of ${angle}°?`,`${trigValue}`];
      }
    ]},
    {name: "Vectors and matrices", problemGenerators: [
      function() {
        const orthogonal = Math.random() < 0.5;

        let a1,a2,a3,b1,b2,b3;
        let found = false;
        for (let i = 0; i < 10; i++) {
          const w = randomInt(-10,10);
          const x = randomInt(-10,10);
          const y = randomInt(-10,10);
          const z = randomInt(-10,10);
          const c = (-w*x+y*z);
          for (let j = -10; j <= 10; j++) {
            if (j === 0) continue;
            if (c % j === 0) {
              const k = c / j;
              if (-10 <= k && k <= 10) {
                a1 = w;
                a2 = y;
                a3 = j;
                b1 = x;
                b2 = z;
                b3 = k;
                found = true;
                break;
              }
            }
          }
          if (found) break;
        }
        if ((orthogonal && !found) || !orthogonal) {
          a1 = randomInt(-10,10);
          a2 = randomInt(-10,10);
          a3 = randomInt(-10,10);
          b1 = randomInt(-10,10);
          b2 = randomInt(-10,10);
          b3 = randomInt(-10,10);
        }
        
        return [`Are the vectors (${a1},${a2},${a3}) and (${b1},${b2},${b3}) orthogonal?`,(orthogonal ? "Yes" : "No")];
      }
    ]},
  ],
};

export const subtopicProblemGeneratorsMap = {};
for (const subject in subjectsData) {
  for (const sub of subjectsData[subject]) {
    subtopicProblemGeneratorsMap[sub.name] = sub.problemGenerators;
  }
}