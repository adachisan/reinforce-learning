
const arr = Array(6).fill(0).map((x, i) => i);
const method = [1, 1, 1, 2, 2, 2];
const steps = [1, 3, 5, 1, 3, 5];
const learning = arr.map(i => new Reinforce(3));
const rate = [0.1, 0.1, 0.1, 0.1, 0.1, 0.1];
const title = arr.map(i => `${steps[i]}-${method[i] > 1 ? 'S' : 'Q'}-${rate[i]}`);

for (let i = 0; i < arr.length; i++) {

    let canvas = document.createElement('canvas');
    document.body.appendChild(canvas);
    canvas.width = '200';
    canvas.height = '200';

    let p1 = document.createElement('p');
    let p2 = document.createElement('p');
    document.body.appendChild(p1);
    // document.body.appendChild(p2);

    if (localStorage[title[i]])
        learning[i].qTable = JSON.parse(localStorage[title[i]]);

    let game = new SnakeGame(10, 1000, canvas);
    let status = { score: 0, best: 0, episode: 0, earn: 0 };

    game.onMove = (snake, target) => {

        //calculates reward influenced by the last action
        let reward = snake.dead ? -10 : snake.fed ? 10 : 0;
        status.score = snake.fed ? status.score + 1 : snake.dead ? 0 : status.score;
        status.best = status.score > status.best ? status.score : status.best;
        status.episode += snake.dead ? 1 : 0;
        status.earn += snake.fed ? 1 : 0;

        //add distance information
        let inputs = [...snake.view];
        // let dist = (a, b) => Math.floor(Math.abs(a - b) / game.grid * 3);
        // inputs.push(dist(snake.x, target.x));
        // inputs.push(dist(snake.y, target.y));

        //gets next state-action
        let nextState = learning[i].selectState(inputs, 3);
        let nextAction = learning[i].selectAction(nextState, 0.00);
        //sets up next action
        game.snake.setRelativeDirection(nextAction);

        //updates last state-action using next state-action and resultant reward of the last action
        learning[i].rate = rate[i];
        learning[i].update(nextState, nextAction, reward, snake.dead, steps[i], method[i]);

        //log everything on screen
        p1.innerText = JSON.stringify({
            episode: status.episode,
            best: status.best,
            states: learning[i].length,
            ratio: (status.earn / status.episode).toFixed(2),
            name: title[i]
        });
        p2.innerText = JSON.stringify({ inputs, reward });
    }
}

let btn = document.createElement('button');
btn.style.width = '50px';
btn.style.height = '25px';
btn.innerText = 'save';
document.body.appendChild(btn);
btn.onclick = () => arr.forEach(i => localStorage[title[i]] = JSON.stringify(learning[i].qTable));
setInterval(() => btn.click(), 120000);

// function getDirection(a, b) {
//     let dx = b.x - a.x;
//     let dy = b.y - a.y;
//     let angle = Math.atan2(dy, dx) * 180 / Math.PI;
//     angle = (angle + 360) % 360;
//     angle = (angle + 90) % 360;
//     return angle;
// }
