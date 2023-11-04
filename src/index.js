import Reinforce from "./lib/Reinforce.js";
import SnakeGame from "./lib/Snake2.js";

/** @type {{brain: Reinforce, method: 0 | 1, rate: number}[]} */
const configs = [
    { brain: new Reinforce(3), method: 0, rate: 0.3 },
    { brain: new Reinforce(3), method: 1, rate: 0.3 },
];

const titles = configs.map(i => `${i.method > 0 ? 'S' : 'Q'}-${i.rate}`);

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

for (const [i, config] of configs.entries()) {

    if (localStorage[titles[i]])
        config.brain.qTable = JSON.parse(localStorage[titles[i]]);

    const game = SnakeGame(20, 1000, createCanvas());
    const status = { score: 0, best: 0, episode: 0, earn: 0 };
    const paragraph = createParagraph();

    game.start((snake, target) => {

        /** @type {(a: number, b: number) => number} */
        const dist = (a, b) => Math.floor(Math.abs(a - b) / 20 * 3);
        const totalDist = Math.floor((dist(snake.x, target.x) + dist(snake.y, target.y)));
        const inputs = [...snake.view.map(([a, b]) => b == "DANGER" ? 1 : b == "TARGET" ? 2 : 0), totalDist];

        const reward = snake.dead ? -1 : snake.fed ? +1 : 0;
        status.score = snake.fed ? status.score + 1 : snake.dead ? 0 : status.score;
        status.best = status.score > status.best ? status.score : status.best;
        status.episode += snake.dead ? 1 : 0;
        status.earn += snake.fed ? 1 : 0;

        const nextState = inputs.join('');
        const nextAction = config.brain.selectAction(nextState, 0.01);
        const actionMap = { 0: "LEFT", 1: "FORWARD", 2: "RIGHT" };
        snake.setDirection(actionMap[nextAction]);

        config.brain.rate = config.rate;
        config.brain.update(nextState, nextAction, reward, config.method, snake.dead);

        (async () => {
            const data = {
                episode: status.episode,
                best: status.best,
                states: config.brain.length,
                ratio: (status.earn / status.episode).toFixed(2),
                name: titles[i],
                dist: totalDist,
                inputs: nextState,
            };
            paragraph.innerText = JSON.stringify(data);
        })();
    });
}

const btn = document.createElement('button');
btn.style.width = '50px';
btn.style.height = '25px';
btn.innerText = 'save';
document.body.appendChild(btn);
btn.onclick = () => configs.forEach(({ brain }, i) => localStorage[titles[i]] = JSON.stringify(brain.qTable));
setInterval(() => btn.click(), 60000);

// function getDirection(a, b) {
//     let dx = b.x - a.x;
//     let dy = b.y - a.y;
//     let angle = Math.atan2(dy, dx) * 180 / Math.PI;
//     angle = (angle + 360) % 360;
//     angle = (angle + 90) % 360;
//     return angle;
// }
