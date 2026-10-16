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
  focus() {}
  get offsetWidth() { return 0; }
  set textContent(value) { this.children = []; this.text = value; }
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
  vm.runInNewContext(script, { document });
  return { document, elements };
}

function press(document, key, options = {}) {
  document.onkeydown({ key, target: {}, ...options });
}

test("A-D keys select their matching answer and preserve answer feedback behavior", () => {
  for (const [key, index] of [["a", 0], ["B", 1], ["c", 2], ["D", 3]]) {
    const { document, elements } = startQuiz();
    press(document, key);
    const answers = elements.get("answers").children;
    assert.equal(answers[index].disabled, true);
    assert.equal(elements.get("feedback").hidden, false);
    assert.equal(elements.get("next").disabled, false);
    assert.ok(answers[index].className.includes(index === 1 ? "correct" : "wrong"));
  }
});

test("answer shortcuts are ignored after answering, outside the quiz, and with modified keys", () => {
  let { document, elements } = startQuiz();
  press(document, "a");
  press(document, "d");
  assert.equal(elements.get("answers").children[3].className.includes("wrong"), false);

  ({ document, elements } = startQuiz());
  document.getElementById("quiz").hidden = true;
  press(document, "b");
  assert.equal(elements.get("answers").children.every((answer) => !answer.disabled), true);

  ({ document, elements } = startQuiz());
  press(document, "c", { ctrlKey: true });
  assert.equal(elements.get("answers").children.every((answer) => !answer.disabled), true);
});

test("answer shortcuts do not intercept typing or IME composition", () => {
  const { document, elements } = startQuiz();
  press(document, "a", { target: { tagName: "INPUT" } });
  press(document, "b", { target: { isContentEditable: true } });
  press(document, "c", { isComposing: true });
  assert.equal(elements.get("answers").children.every((answer) => !answer.disabled), true);
});
