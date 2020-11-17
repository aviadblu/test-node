class controller {

    constructor(dal, recordingSvc, DOMRecorderSvc) {
        this.dal = dal;
        this.recordingSvc = recordingSvc;
        this.DOMRecorderSvc = DOMRecorderSvc;
        this.DOMRecorderSvc.DelegateNewActionHandler(this.newActionHandler.bind(this));
        this.initRecordings();

        this.updateState(this.state = {
            status: 0, // 0 not ready, 1 ready, 2 active recording
            recordingId: null,
            counter: 0,
        });
    }

    updateState(newState) {
        const stateChangedEvent = new CustomEvent('controllerStateChanged', {detail: newState});
        window.dispatchEvent(stateChangedEvent);
        this.state = newState;
    }

    initRecordings() {

        this.recordingSvc.getActiveRecording()
            .then(activeRecording => {
                if (activeRecording) {
                    this.updateState({
                        status: 2,
                        recordingId: activeRecording.id,
                        counter: activeRecording.actionsCounter,
                    });
                } else {
                    this.updateState({
                        status: 1,
                        recordingId: null,
                        counter: 0,
                    });
                }
            });
    }

    startNewRecording() {
        this.recordingId = this.uuidv4();
        this.dal.addNewRecording(createRecordingFromModel({id: this.recordingId}))
            .then(() => {
                this.DOMRecorderSvc.listen(document);
            });
    }

    newActionHandler(action) {
        action.recordingId = this.recordingId;

        console.log("newActionHandler", action);

        this.dal.saveAction(action)
            .then(() => {
                console.log("done!");
            });
    }

    uuidv4() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

}
