class SnakeGame {
    static direction = { left: { x: -1, y: 0 }, right: { x: 1, y: 0 }, up: { x: 0, y: 1 }, down: { x: 0, y: -1 } }
    static keys = { left: 0, foward: 1, right: 2 }

    constructor(grid = 20, fps = 10, canvas = null) {
        const rnd = (max) => Math.floor(Math.random() * max);
        this.grid = grid;
        this.box = canvas != null ? canvas.width / this.grid : 1;
        this.snake = {
            respawn: () => {
                this.snake.size = 1;
                this.snake.tail = [];
                this.snake.x = rnd(this.grid);
                this.snake.y = rnd(this.grid);
                this.snake.direction = Object.values(SnakeGame.direction)[rnd(4)];
            },
            setDirection: (direction) => {
                if (Math.abs(direction.x) - this.snake.direction.x == 0) return;
                if (Math.abs(direction.y) - this.snake.direction.y == 0) return;
                this.snake.direction = direction;
            },
            setRelativeDirection: (keys) => {
                let leftDirection = { x: this.snake.direction.y, y: -this.snake.direction.x };
                let rightDirection = { x: -this.snake.direction.y, y: this.snake.direction.x };
                let newDirection = keys == 0 ? leftDirection : keys == 2 ? rightDirection : this.snake.direction;
                this.snake.direction = newDirection;
            },
            checkCollision: (point = this.snake) => {
                let snakeTail = this.snake.tail.some(t => t.x == point.x && t.y == point.y);
                let gridLimit = point.x < 0 || point.y < 0 || point.x > this.grid - 1 || point.y > this.grid - 1;
                let target = this.target.x == point.x && this.target.y == point.y;
                return snakeTail || gridLimit ? 1 : target ? 2 : 0;
            },
            move: () => {
                this.snake.x += this.snake.direction.x;
                this.snake.y += this.snake.direction.y;
            },
            updateStatus: () => {
                let snakeCollision = this.snake.checkCollision();
                this.snake.dead = snakeCollision == 1;
                this.snake.fed = snakeCollision == 2;
                if (this.snake.dead) this.snake.respawn();
                if (this.snake.fed) this.target.respawn();
            },
            updateTail: () => {
                this.snake.size += this.snake.fed ? 1 : 0;
                this.snake.tail.push({ x: this.snake.x, y: this.snake.y });
                while (this.snake.tail.length > this.snake.size)
                    this.snake.tail.shift();
            },
            updateView: (range = 1) => {
                this.snake.view = [];
                this.snake.draw = [];

                const { direction: { x: dx, y: dy } } = this.snake;
                const { x: sx, y: sy } = this.snake;

                let pos = [];
                for (let i = 1; i <= range; i++) {
                    let leftPos = { x: sx + i * dy, y: sy - i * dx };
                    let frontPos = { x: sx + i * dx, y: sy + i * dy };
                    let rightPos = { x: sx - i * dy, y: sy + i * dx };
                    pos.push({ leftPos, frontPos, rightPos });
                }

                this.snake.draw.push(...pos.map(x => x.leftPos));
                this.snake.draw.push(...pos.map(x => x.frontPos));
                this.snake.draw.push(...pos.map(x => x.rightPos));
                this.snake.view.push(...pos.map(x => this.snake.checkCollision(x.leftPos)));
                this.snake.view.push(...pos.map(x => this.snake.checkCollision(x.frontPos)));
                this.snake.view.push(...pos.map(x => this.snake.checkCollision(x.rightPos)));
            }
        };
        this.target = {
            respawn: () => {
                let samePosition = () => {
                    let snake = this.target.x == this.snake.x && this.target.y == this.snake.x;
                    let snakeTail = this.snake.tail.some(t => t.x == this.target.x && t.y == this.target.y);
                    return snake || snakeTail;
                }
                do {
                    this.target.x = rnd(this.grid);
                    this.target.y = rnd(this.grid);
                } while (samePosition());
            }
        };
        this.#update(fps, canvas);
    }

    #update = (fps, canvas) => {
        //create snake and target
        this.snake.respawn();
        this.target.respawn();

        setInterval(() => {

            //move snake to next direction
            this.snake.move();

            //update snake's status
            this.snake.updateStatus();

            //update snake's tail
            this.snake.updateTail();

            //update snake's view space
            this.snake.updateView(2);

            //render everything on canvas
            this.#render(canvas);

            //callback function that updates each move
            this.onMove(this.snake, this.target);

        }, 1000 / fps);
    }

    #render = (canvas) => {
        if (!canvas) return;

        let context = canvas.getContext('2d');

        //draw background
        context.fillStyle = 'black';
        context.fillRect(0, 0, canvas.width, canvas.height);

        //draw view
        // context.fillStyle = 'blue';
        // for (var i = 0; i < this.snake.draw.length; i++)
        //     context.fillRect(this.snake.draw[i].x * this.box, this.snake.draw[i].y * this.box, this.box, this.box);

        //draw snake
        context.fillStyle = 'lime';
        for (var i = 0; i < this.snake.tail.length; i++)
            context.fillRect(this.snake.tail[i].x * this.box, this.snake.tail[i].y * this.box, this.box, this.box);

        //draw target
        context.fillStyle = 'red';
        context.fillRect(this.target.x * this.box, this.target.y * this.box, this.box, this.box);
    }

    useArrows = () => {
        // let direction = {
        //     37: SnakeGame.keys.left,
        //     39: SnakeGame.keys.right,
        //     40: SnakeGame.keys.foward
        // };
        // document.addEventListener("keydown", (e) => this.snake.setRelativeDirection(direction[e.keyCode]));
        let direction = {
            37: SnakeGame.direction.left,
            38: SnakeGame.direction.down,
            39: SnakeGame.direction.right,
            40: SnakeGame.direction.up
        };
        document.addEventListener("keydown", (e) => this.snake.setDirection(direction[e.keyCode]));
    }

}