
class Reinforce {
    #steps;

    /** @param {number} actions */
    constructor(actions) {
        /** @type {number[]} */
        this.actions = Array(actions).fill(0);
        /** @type {object} */
        this.qTable = {};
        /** @type {number} */
        this.rate = 0.1;
        /** @type {number} */
        this.discount = 0.9;
        /** @type {object[]} */
        this.#steps = [];
    }

    /**
     * @param {string} state 
     * @param {number} [exploration] 
     */
    selectAction(state, exploration = 0.1) {
        this.qTable[state] ??= this.actions.map(_ => Math.random() * 0.1);
        let maxQ = Math.max(...this.qTable[state]);
        let maxAction = this.qTable[state].indexOf(maxQ);
        let randomAction = Math.floor(Math.random() * this.actions.length);
        return Math.random() < exploration ? randomAction : maxAction;
    }

    /**
     * @param {string} lastState 
     * @param {number} lastAction 
     * @param {string} nextState 
     * @param {number} reward 
     */
    #maxq(lastState, lastAction, nextState, reward) {
        let lastQ = this.qTable[lastState][lastAction];
        let nextQ = this.qTable[nextState][this.selectAction(nextState, 0)];
        let targetQ = reward + this.discount * nextQ;
        let error = targetQ - lastQ;
        this.qTable[lastState][lastAction] += this.rate * error;
    }

    /**
     * @param {string} lastState 
     * @param {number} lastAction 
     * @param {string} nextState 
     * @param {number} nextAction 
     * @param {number} reward 
     */
    #sarsa(lastState, lastAction, nextState, nextAction, reward) {
        let lastQ = this.qTable[lastState][lastAction];
        let nextQ = this.qTable[nextState][nextAction];
        let targetQ = reward + this.discount * nextQ;
        let error = targetQ - lastQ;
        this.qTable[lastState][lastAction] += this.rate * error;
    }

    /**
     * @param {string} state 
     * @param {number} action 
     * @param {number} reward 
     * @param {1 | 2} method 
     * @param {boolean} [end] 
     */
    update(state, action, reward, method, end = false) {
        this.#steps.push({ state, action });
        if (this.#steps.length <= 1) return;
        if (this.#steps.length > 2) this.#steps.shift();

        const last = this.#steps[0];
        if (method == 1) this.#maxq(last.state, last.action, state, reward);
        else this.#sarsa(last.state, last.action, state, action, reward);

        this.#steps = end ? [] : this.#steps;
    }

    /** @returns {number} */
    get length() {
        return Object.keys(this.qTable).length;
    }
}