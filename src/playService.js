class playService {
    #playedActionHandler;
    #actionsStack;
    #timeoutMs = 500;

    constructor(recordingSvc) {
        this.recordingSvc = recordingSvc;
    }


    // delegate
    DelegatePlayedActionHandler(playedActionHandler) {
        this.#playedActionHandler = playedActionHandler;
    }

    playRecording(actions) {
        this.#actionsStack = actions;
        this.playActionFromStack();
    }

    playActionFromStack() {
        const action = this.#actionsStack.pop();
        // play
        if(action.type !== "unload") {
            console.log(action.signature);
            console.log(this.#GetHtmlElemById(action.signature));
        }
        this.#playedActionHandler(action, this.#actionsStack.length);
        if (this.#actionsStack.length > 0)
            setTimeout(this.playActionFromStack.bind(this), this.#timeoutMs);
        else
            this.#playedActionHandler(action, -1);
    }

    #GetHtmlElemById(params) {
        const elList = document.getElementsByTagName(params.tagName);
        console.log(elList);
        if (Object.keys(params.attrMap).length === 0) {
            return elList[0];
        }

        let aaname = null;
        if (params.attrMap.hasOwnProperty('aaname')) {
            aaname = params.attrMap.aaname;
            delete params.attrMap.aaname;
        }

        // check if satisfy all conditions
        for (let i = 0; i < elList.length; i++) {
            let el = elList[i];
            if (aaname != null) {
                if (el.innerText === aaname || el.innerHTML === aaname) {
                    return el;
                }
            } else {
                let allCondAligned = true;
                Object.keys(params.attrMap).forEach(attr => {
                    const val = params.attrMap[attr];
                    if (el.getAttribute(attr) !== params.attrMap[attr]) {
                        allCondAligned = false;
                    }
                });
                if (allCondAligned) {
                    return el;
                }
            }
        }
    }

    #HtmlSelectedItems(elem, params) {
        for (let i = 0; i < elem.options.length; i++) {
            elem.options[i].selected = params.itemsToSelect.indexOf(elem.options[i].innerText) >= 0;
        }
    }

    #WriteTextHtmlElem(elem, params) {
        elem.value = params.text;
    }

    #ClickHtmlElem(elem, params) {
        elem.click();
    }

}
