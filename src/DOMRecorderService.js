class DOMRecorderService {
    #DOMEventsRegistered = false;

    constructor(domMapper) {
        this.newActionHandler = null;
        this.mapper = domMapper;
    }

    // delegate
    DelegateNewActionHandler(newActionHandler) {
        this.newActionHandler = newActionHandler;
    }

    listen() {
        if (this.#DOMEventsRegistered)
            return;
        this.registerDOMEvents();
        this.#DOMEventsRegistered = true;
    }

    registerDOMEvents() {
        document.addEventListener('click', this.handleClickEvent.bind(this), true);
        document.addEventListener('change', this.handleChangeEvent.bind(this), true);
        window.addEventListener('beforeunload', this.handleUnloadEvent.bind(this), true);
    }

    unregisterDOMEvents() {
        // this function in not working, function pointer is not the same
        // need to fix
        console.log('unregisterDOMEvents');
        document.removeEventListener('click', this.handleClickEvent, true);
        document.removeEventListener('change', this.handleChangeEvent, true);
        window.removeEventListener('beforeunload', this.handleUnloadEvent, true);
    }

    handleClickEvent(event) {
        if(event.target.closest(".no-listen")) {
            return;
        }

        this.saveAction(createActionFromModel({
            type: "click",
            signature: this.mapper.ExtractDOMElementSignature(event.target)
        }));
    }

    handleChangeEvent(event) {
        this.saveAction(createActionFromModel({
                type: "change",
                signature: this.mapper.ExtractDOMElementSignature(event.target),
                value: event.target.value
            }
        ));
    }

    handleUnloadEvent(event) {
        this.saveAction(createActionFromModel({
                type: "unload"
            }
        ));
    }

    saveAction(action) {
        this.newActionHandler(action);
    }
}
