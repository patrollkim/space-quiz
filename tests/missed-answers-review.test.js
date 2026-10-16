"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

class Element {
  constructor() {
    this.children = [];
    this.attributes = {};
    this.style = {};
    this.hidden = false;
    this.disabled = false;
    this.className = "";
    this.classList = {
      add: (name) => { this.className = `${this.className} ${name}`.trim(); },
      remove: (name) => { this.className = this.className.split(" ").filter((item) => item !== name).join(" "); }
    };
  }

  append(...items) { this.children.push(...items); }
  replaceChildren(...items) { this.children = items; }
  addEventListener(type, listener) { this[`on${type}`] = listener; }
  setAttribute(name, value) { this.attributes[name] = value; }
  getAttribute(name) { return this.attributes[name] ?? null; }
  focus() {}
  get offsetWidth() { return 0; }
  set textContent(value) { this.children = []; this.text = String(value); }
  get textContent() { return this.text ?? this.children.map((item) => item.textContent ?? item.text ?? "").join(""); }
}

function startQuiz() {
  const elements = new Map();
  const document = {
    getElementById(id) {
      if (!elements.has(id)) elements.set(id, new Element());
      return elements.get(id);
    },
    createElement: () => new Element(),
    createTextNode: (text) => ({ textContent: text }),
    addEventListener(type, listener) { this[`on${type}`] = listener; }
  };
  const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
  const script = html.match(/<script>\s*([\s\S]*?)\s*<\/script>/)[1];
  const sandbox = { document };
  vm.runInNewContext(`${script}\nObject.defineProperty(globalThis, "__missionQuestions", { get: () => missionQuestions });`, sandbox);
  return { elements, questions: () => sandbox.__missionQuestions };
}

test("missed-answer review shows selected and correct answers with the fact, without changing score", () => {
  const { elements, questions } = startQuiz();
  const mission = questions();
  mission.forEach((question, index) => {
    const selected = (question.correct + 1) % question.answers.length;
    elements.get("answers").children[selected].onclick();
    elements.get("next").onclick();
  });

  assert.equal(elements.get("score-label").textContent, "0 points");
  assert.equal(elements.get("wrong-count").textContent, String(mission.length));
  assert.equal(elements.get("review-missed").hidden, false);
  assert.equal(elements.get("review-list").children.length, mission.length);
  const firstReview = elements.get("review-list").children[0].textContent;
  assert.ok(firstReview.includes(mission[0].question));
  assert.ok(firstReview.includes(`Your answer: ${mission[0].answers[(mission[0].correct + 1) % mission[0].answers.length]}`));
  assert.ok(firstReview.includes(`Correct answer: ${mission[0].answers[mission[0].correct]}`));
  assert.ok(firstReview.includes(mission[0].fact));

  elements.get("review-missed").onclick();
  assert.equal(elements.get("missed-review").hidden, false);
  assert.equal(elements.get("review-missed").getAttribute("aria-expanded"), "true");
  assert.equal(elements.get("score-label").textContent, "0 points");
});

test("perfect scores hide review, and restarting clears prior answers", () => {
  const { elements, questions } = startQuiz();
  let mission = questions();
  mission.forEach((question) => {
    elements.get("answers").children[question.correct].onclick();
    elements.get("next").onclick();
  });

  assert.equal(elements.get("score-label").textContent, "10 points");
  assert.equal(elements.get("review-missed").hidden, true);

  elements.get("restart").onclick();
  mission = questions();
  mission.forEach((question, index) => {
    const selected = (question.correct + 1) % question.answers.length;
    elements.get("answers").children[selected].onclick();
    elements.get("next").onclick();
  });
  assert.equal(elements.get("score-label").textContent, "0 points");
  assert.equal(elements.get("review-list").children.length, mission.length);
});
