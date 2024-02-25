import Reinforce from "./lib/Reinforce.js";
import SnakeGame from "./lib/SnakeFunction.js";

/** @typedef {import("./lib/SnakeFunction.js").Direction} Direction */
/** @typedef {import("./lib/SnakeFunction.js").Collision} Collision */

const game = SnakeGame(10, 2, createCanvas());
const brain = new Reinforce(3);
game.useArrows();
const status = { score: 0, best: 0, deaths: 0, feds: 0 };

const paragraph = createParagraph();
brain.qTable = JSON.parse(localStorage[`S`] || "{}");

game.start((snake, target) => {

    /** @type {{[key in Collision]: 0 | 1 | 2}} */
    const inputMap = { "VOID": 0, "DANGER": 1, "TARGET": 2 };
    const inputs = snake.view.map(([a, b]) => inputMap[b]);

    const reward = snake.dead ? -1 : snake.fed ? +1 : 0;
    status.score = snake.fed ? status.score + 1 : snake.dead ? 0 : status.score;
    status.best = status.score > status.best ? status.score : status.best;
    status.deaths += snake.dead ? 1 : 0;
    status.feds += snake.fed ? 1 : 0;

    const nextState = inputs.join('');
    const nextAction = brain.selectAction(nextState, 0.001);
    /** @type {{[key in 0 | 1 | 2]: Direction}} */
    const actionMap = { 0: "LEFT", 1: "FORWARD", 2: "RIGHT" };
    // snake.setDirection(actionMap[nextAction]);
    // brain.update(nextState, nextAction, reward, snake.dead);

    (async () => {
        paragraph.innerText = JSON.stringify({
            best: status.best,
            states: brain.length,
            ratio: (status.feds / status.deaths).toFixed(2),
            // view: snake.view,
        });
    })();

});

// fetch("http://127.0.0.1:3000/src/data/i5-a3-01.json").then(i => i.text()).then(i => localStorage[`S`] = i);
// copyText(localStorage[`S`]);

const savebtn = createButton("save");
// savebtn.onclick = () => localStorage[`S`] = JSON.stringify(brain.qTable);
// setInterval(() => savebtn.click(), 30000);

function createCanvas() {
    const canvas = document.createElement('canvas');
    document.body.appendChild(canvas);
    canvas.width = 200;
    canvas.height = 200;
    return canvas;
}

function createParagraph() {
    const paragraph = document.createElement('p');
    document.body.appendChild(paragraph);
    return paragraph;
}

function createButton(text = "") {
    const button = document.createElement('button');
    document.body.appendChild(button);
    button.innerText = text;
    button.className = "button-simple";
    return button;
}

function copyText(text) {
    const input = document.createElement("input");
    document.body.appendChild(input);
    input.setAttribute("value", text);
    input.select();
    document.execCommand("copy");
    document.body.removeChild(input);
}

// /** @typedef {{x: number, y: number}} Point */
// /** @type {(a: Point, b: Point) => number} */
// function getDirection(a, b) {
//     const dx = b.x - a.x;
//     const dy = b.y - a.y;
//     let angle = Math.atan2(dy, dx) * 180 / Math.PI;
//     angle = (angle + 360) % 360;
//     angle = (angle + 90) % 360;
//     return angle;
// }
