/** @param {number} [size] @param {number} [fps] @param {HTMLCanvasElement} [canvas]  */
export default function SnakeGame2(size = 20, fps = 5, canvas = undefined) {

    /** @typedef {{x: number, y: number}} Point */
    /** @typedef {"LEFT" | "FORWARD" | "RIGHT"} Direction */
    /** @typedef {"VOID" | "DANGER" | "TARGET"} Collision */
    /** @typedef {[Point, Collision]} View */
    /** @typedef {Point & {respawn: () => void, setDirection: (direction: Direction) => void}} Respawnable */
    /** @typedef {Respawnable & {tail: Point[], view: View[], direction: Point, dead: boolean, fed: boolean}} Snake */

    /** @type {(max: number) => number} */
    const random = (max) => Math.floor(Math.random() * max);

    const snake = /** @type {Snake} */ ({
        respawn() {
            snake.x = random(size);
            snake.y = random(size);
            snake.tail = [];
            const direction = [{ x: -1, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }]
            snake.direction = direction[random(4)];
        },
        setDirection(direction) {
            if (direction == undefined || direction == "FORWARD") return;
            const left = { x: snake.direction.y, y: -snake.direction.x };
            const right = { x: -snake.direction.y, y: snake.direction.x };
            snake.direction = { "LEFT": left, "RIGHT": right }[direction];
        }
    });

    const target = /** @type {Respawnable} */({
        respawn() {
            target.x = random(size);
            target.y = random(size);
        }
    });

    /** @type {(point: Point) => Collision} */
    const checkCollision = ({ x, y }) => {
        const gridLimit = x < 0 || y < 0 || x > size - 1 || y > size - 1;
        const tailColliding = snake.tail.some(tail => tail.x == x && tail.y == y);
        const targetColliding = target.x == x && target.y == y;
        return tailColliding || gridLimit ? "DANGER" : targetColliding ? "TARGET" : "VOID";
    };

    const move = () => {
        snake.x += snake.direction.x;
        snake.y += snake.direction.y;
    };

    const updateStatus = () => {
        const snakeCollision = checkCollision(snake);
        snake.dead = snakeCollision == "DANGER";
        snake.fed = snakeCollision == "TARGET";
        if (snake.dead) snake.respawn();
        if (snake.fed) target.respawn();
    };

    const updateTail = () => {
        snake.tail.push({ x: snake.x, y: snake.y });
        if (snake.tail.length > 1 && !snake.fed)
            snake.tail.shift();
    };

    /** @param {number} viewLimit */
    const updateView = (viewLimit = 2) => {
        const { direction: { x: dx, y: dy }, x: sx, y: sy } = snake;
        const newView = /** @type {View[][]} */ ([[], [], []]);
        for (let i = 1; i <= viewLimit; i++) {
            const left = { x: sx + i * dy, y: sy - i * dx };
            const front = { x: sx + i * dx, y: sy + i * dy };
            const right = { x: sx - i * dy, y: sy + i * dx };
            newView[0].push([left, checkCollision(left)]);
            newView[1].push([front, checkCollision(front)]);
            newView[2].push([right, checkCollision(right)]);
        }
        snake.view = newView.flat();
    }

    const render = async () => {
        const context = canvas?.getContext('2d');
        if (!canvas || !context) return;
        const box = canvas.width / size;

        //draw background
        context.fillStyle = 'black';
        context.fillRect(0, 0, canvas.width, canvas.height);

        //draw view
        context.fillStyle = 'blue';
        for (var i = 0; i < snake.view.length; i++)
            context.fillRect(snake.view[i][0].x * box, snake.view[i][0].y * box, box, box);

        //draw snake
        context.fillStyle = 'lime';
        for (var i = 0; i < snake.tail.length; i++)
            context.fillRect(snake.tail[i].x * box, snake.tail[i].y * box, box, box);

        //draw target
        context.fillStyle = 'red';
        context.fillRect(target.x * box, target.y * box, box, box);
    };

    const useArrows = () => {
        /** @type {{[code: string]: Direction}} */
        const direction = { "ArrowLeft": "LEFT", "ArrowUp": "FORWARD", "ArrowRight": "RIGHT" };
        document.addEventListener("keydown", ({ code }) => snake.setDirection(direction[code]));
    };

    let timer = /** @type {number | undefined} */ (undefined);
    let paused = /** @type {Boolean} */ (false);;

    /** @param {(snake: Snake, target: Respawnable) => void} [onMove] */
    const start = (onMove) => {
        snake.respawn();
        target.respawn();
        timer = setInterval(() => {
            if (paused) return;
            move();
            updateStatus();
            updateTail();
            updateView();
            render();
            !!onMove && onMove(snake, target);
        }, 1000 / fps);
    };

    return { useArrows, start, stop: () => clearInterval(timer), pause: () => paused = !paused };
}
