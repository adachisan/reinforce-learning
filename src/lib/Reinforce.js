export default class Reinforce {

    qTable = /** @type {{[state: string]: number[]}} */ ({});
    rate = /** @type {number} */ (0.1);
    discount = /** @type {number} */ (0.9);
    #actions = /** @type {number[]} */ ([]);
    #steps = /** @type {{state: string, action: number}[]} */ ([]);

    /** @param {number} actions */
    constructor(actions) {
        this.#actions = Array(actions).fill(0);
    }

    /** @type {(state: string, exploration?: number) => number} */
    selectAction(state, exploration = 0.01) {
        this.qTable[state] ??= this.#actions.map(_ => Math.random() * 0.1);
        const maxQ = Math.max(...this.qTable[state]);
        const maxAction = this.qTable[state].indexOf(maxQ);
        const randomAction = Math.floor(Math.random() * this.#actions.length);
        return Math.random() < exploration ? randomAction : maxAction;
    }

    /** @type {(lastState: string, lastAction: number, nextState: string, reward: number) => void} */
    #maxq(lastState, lastAction, nextState, reward) {
        const lastQ = this.qTable[lastState][lastAction];
        const nextQ = this.qTable[nextState][this.selectAction(nextState, 0)];
        const targetQ = reward + this.discount * nextQ;
        const error = targetQ - lastQ;
        this.qTable[lastState][lastAction] += this.rate * error;
    }

    /** @type {(lastState: string, lastAction: number, nextState: string, nextAction: number, reward: number) => void} */
    #sarsa(lastState, lastAction, nextState, nextAction, reward) {
        const lastQ = this.qTable[lastState][lastAction];
        const nextQ = this.qTable[nextState][nextAction];
        const targetQ = reward + this.discount * nextQ;
        const error = targetQ - lastQ;
        this.qTable[lastState][lastAction] += this.rate * error;
    }

    /** @type {(state: string, action: number, reward: number, method: 0 | 1, end?: boolean) => void} */
    update(state, action, reward, method, end = false) {
        this.#steps.push({ state, action });
        if (this.#steps.length <= 1) return;
        if (this.#steps.length > 2) this.#steps.shift();
        const last = this.#steps[0];
        if (method == 0) this.#maxq(last.state, last.action, state, reward);
        else this.#sarsa(last.state, last.action, state, action, reward);
        this.#steps = end ? [] : this.#steps;
    }

    normalize() {
        for (const key in this.qTable) {
            const actions = this.qTable[key];
            const max = Math.max(...actions);
            const min = Math.min(...actions);
            this.qTable[key] = actions.map(q => {
                const normalized = (q - min) / (max - min);
                return parseFloat(normalized.toFixed(4));
            });
        }
    }

    get length() {
        return Object.keys(this.qTable).length;
    }

}
