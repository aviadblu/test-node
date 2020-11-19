const emptyState = {
    mode: 0, // 0 not ready, 1 record, 2 play
    recording: {
        status: 0, // 0 not ready, 1 ready, 2 active recording
        recordingId: null,
        counter: 0,
    }
};

class stateService {
    #state = {};
    #subscribers = {};

    constructor(dal) {
        this.dal = dal;
        this.#state = JSON.parse(JSON.stringify(emptyState));
        this.loadStateFromDB();
    }

    loadStateFromDB() {
        this.dal.getGlobalObject("state")
            .then(stateData => {
                if (!stateData.hasOwnProperty("mode")) {
                    this.updateGlobalState(JSON.parse(JSON.stringify(emptyState)));
                    this.updateState("mode", 1);
                }
                else {
                    this.updateGlobalState(stateData);
                }
            })
            .catch(err => {
                console.error(err);
            })
    }

    updateStateInDB() {
        this.dal.updateGlobalObject("state", this.#state)
            .catch(err => {
                console.error(err);
            });
    }

    updateGlobalState(newState) {
        this.#state = newState;
        Object.keys(this.#subscribers).forEach(sbKey => {
            const sb = this.#subscribers[sbKey];
            if (sb.branch === "root") {
                sb.DelegateFunc(this.#state);
            } else {
                sb.DelegateFunc(this.#state[sb.branch]);
            }
        });
        this.updateStateInDB();
    }

    updateState(branch, newState) {
        this.#state[branch] = newState;

        Object.keys(this.#subscribers).forEach(sbKey => {
            const sb = this.#subscribers[sbKey];
            if (sb.branch === branch && this.#state.hasOwnProperty(branch)) {
                sb.DelegateFunc(this.#state[branch]);
            } else if (sb.branch === "root") {
                sb.DelegateFunc(this.#state);
            }
        });
        this.updateStateInDB();
    }

    get state() {
        return this.#state;
    }

    subscribe(branch, DelegateFunc, getCurrentValueImmediately = false) {
        this.#subscribers[HashString(branch + DelegateFunc.toString())] = {
            branch,
            DelegateFunc
        };
        if (getCurrentValueImmediately && this.#state.hasOwnProperty(branch)) {
            DelegateFunc(this.#state[branch]);
        }
    }

    unsubscribe(DelegateFunc) {
        const fSign = HashString(DelegateFunc.toString());
        if (this.#subscribers.hasOwnProperty(fSign)) {
            delete this.#subscribers[fSign];
        }
    }

}