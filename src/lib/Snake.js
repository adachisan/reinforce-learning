export default class SnakeGame {

    /** @typedef {{x: number, y: number}} Point */
    /** @typedef {"LEFT" | "FORWARD" | "RIGHT"} Direction */
    /** @typedef {"VOID" | "DANGER" | "TARGET"} Collision */
    /** @typedef {[Point, Collision]} View */
    /** @typedef {Point & {respawn: () => void}} Respawnable */
    /** @typedef {Respawnable & {tail: Point[], view: View[], direction: Point, dead: boolean, fed: boolean}} Snake */

    view = /** @type {number} */ (2);
    #fps = /** @type {number} */ (5);
    #size = /** @type {number} */ (20);
    canvas = /** @type {HTMLCanvasElement | undefined} */ (undefined);
    target =  /** @type {Respawnable} */({});
    snake =  /** @type {Snake} */({});

    /** @param {number} [size] @param {number} [fps] @param {HTMLCanvasElement} [canvas]  */
    constructor(size = 20, fps = 5, canvas) {
        this.#size = size;
        this.#fps = fps;
        this.canvas = canvas;

        /** @type {(max: number) => number} */
        const random = (max) => Math.floor(Math.random() * max);

        this.snake.respawn = () => {
            this.snake.x = random(size);
            this.snake.y = random(size);
            this.snake.tail = [];
            const direction = [{ x: -1, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }];
            this.snake.direction = direction[random(4)];
        };

        this.target.respawn = () => {
            this.target.x = random(size);
            this.target.y = random(size);
        };
    };

    /** @type {(point: Point) => Collision} */
    #checkCollision = ({ x, y }) => {
        const gridLimit = x < 0 || y < 0 || x > this.#size - 1 || y > this.#size - 1;
        const tailColliding = this.snake.tail.some(tail => tail.x == x && tail.y == y);
        const targetColliding = this.target.x == x && this.target.y == y;
        return tailColliding || gridLimit ? "DANGER" : targetColliding ? "TARGET" : "VOID";
    };

    #move = () => {
        this.snake.x += this.snake.direction.x;
        this.snake.y += this.snake.direction.y;
    };

    #updateStatus = () => {
        const snakeCollision = this.#checkCollision(this.snake);
        this.snake.dead = snakeCollision == "DANGER";
        this.snake.fed = snakeCollision == "TARGET";
        if (this.snake.dead) this.snake.respawn();
        if (this.snake.fed) this.target.respawn();
    };

    #updateTail = () => {
        this.snake.tail.push({ x: this.snake.x, y: this.snake.y });
        if (this.snake.tail.length > 1 && !this.snake.fed)
            this.snake.tail.shift();
    };

    #updateView = () => {
        const { direction: { x: dx, y: dy }, x: sx, y: sy } = this.snake;
        const newView = /** @type {View[][]} */ ([[], [], []]);
        for (let i = 1; i <= this.view; i++) {
            const left = { x: sx + i * dy, y: sy - i * dx };
            const front = { x: sx + i * dx, y: sy + i * dy };
            const right = { x: sx - i * dy, y: sy + i * dx };
            newView[0].push([left, this.#checkCollision(left)]);
            newView[1].push([front, this.#checkCollision(front)]);
            newView[2].push([right, this.#checkCollision(right)]);
        }
        this.snake.view = newView.flat();
    };

    #render = async () => {
        const canvas = this.canvas;
        const context = canvas?.getContext('2d');
        if (!canvas || !context) return;
        const box = canvas.width / this.#size;
        const { snake, target } = this;

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

    /** @param {Direction} [direction] */
    setDirection = (direction) => {
        if (direction == undefined || direction == "FORWARD") return;
        const left = { x: this.snake.direction.y, y: -this.snake.direction.x };
        const right = { x: -this.snake.direction.y, y: this.snake.direction.x };
        this.snake.direction = { "LEFT": left, "RIGHT": right }[direction];
    };

    useArrows = () => {
        /** @type {{[code: string]: Direction}} */
        const direction = { "ArrowLeft": "LEFT", "ArrowUp": "FORWARD", "ArrowRight": "RIGHT" };
        document.addEventListener("keydown", ({ code }) => this.setDirection(direction[code]));
    };

    /** @param {(snake: Snake, target: Respawnable) => void} [onMove] */
    start = (onMove) => {
        this.snake.respawn();
        this.target.respawn();
        setInterval(() => {
            this.#move();
            this.#updateStatus();
            this.#updateTail();
            this.#updateView();
            this.#render();
            !!onMove && onMove(this.snake, this.target);
        }, 1000 / this.#fps);
    };

    get size() {
        return this.#size;
    };

}
