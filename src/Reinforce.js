class Reinforce {
    constructor(actions) {
        this.actions = Array(actions).fill();
        this.qTable = {};
        this.step = [];
        this.rate = 0.1;
        this.discount = 0.9;
    }

    selectState(inputs, inputRange = 3) {
        let state = inputs.map((input, i) => input * Math.pow(inputRange, i)).reduce((a, b) => a + b);
        if (!this.qTable[state]) this.qTable[state] = this.actions.map(q => Math.random() * 0.1);
        return state;
    }

    selectAction(state, exploration = 0.1) {
        let maxQ = Math.max(...this.qTable[state]);
        let maxAction = this.qTable[state].indexOf(maxQ);
        let randomAction = Math.floor(Math.random() * this.actions.length);
        return Math.random() < exploration ? randomAction : maxAction;
    }

    qLearning(lastState, lastAction, nextState, reward) {
        let lastQ = this.qTable[lastState][lastAction];
        let nextQ = this.qTable[nextState][this.selectAction(nextState, 0)];
        let targetQ = reward + this.discount * nextQ;
        let error = targetQ - lastQ;
        this.qTable[lastState][lastAction] += this.rate * error;
    }

    SARSA(lastState, lastAction, nextState, nextAction, reward) {
        let lastQ = this.qTable[lastState][lastAction];
        let nextQ = this.qTable[nextState][nextAction];
        let targetQ = reward + this.discount * nextQ;
        let error = targetQ - lastQ;
        this.qTable[lastState][lastAction] += this.rate * error;
    }

    update(state, action, reward, end = false, stepsAhead = 1, method = 1) {
        this.step.push({ state, action, reward });
        if (this.step.length < stepsAhead + 1) return;
        if (this.step.length > stepsAhead + 1) this.step.shift();
        reward = this.step.slice(1).map((x, i) => Math.pow(this.discount, i) * x.reward).reduce((a, b) => a + b);
        let first = this.step[0];
        if (method == 1) this.qLearning(first.state, first.action, state, reward);
        else this.SARSA(first.state, first.action, state, action, reward);
        this.step = end ? [] : this.step;
    }

    get length() {
        return Object.keys(this.qTable).length;
    }
}