class controller {
    #recordingId;
    #recordingCounter = 0;
    #recordingActive = false;

    constructor(dal, recordingSvc, DOMRecorderSvc, stateSvc) {
        this.dal = dal;
        this.recordingSvc = recordingSvc;
        this.DOMRecorderSvc = DOMRecorderSvc;
        this.stateSvc = stateSvc;
        this.DOMRecorderSvc.DelegateNewActionHandler(this.newActionHandler.bind(this));
        this.initRecordings();
    }

    initRecordings() {
        console.log("initRecordings");
        this.recordingSvc.getActiveRecording()
            .then(activeRecording => {
                if (activeRecording) {
                    this.#recordingId = activeRecording.id;
                    this.#recordingCounter = activeRecording.actionsCounter;
                    this.#recordingActive = true;
                    this.updateRecordingStatus();
                } else {
                    this.#recordingId = null;
                    this.#recordingCounter = 0;
                    this.#recordingActive = false;
                    this.updateRecordingStatus(false);
                }
            });
    }

    startRecording() {
        this.#recordingId = uuidv4();
        this.#recordingActive = true;
        this.updateRecordingStatus({
            status: 2, // 0 not ready, 1 ready, 2 active recording
            recordingId: this.#recordingId,
            counter: 0,
        });
        this.initRecorder(this.#recordingId);
    }

    initRecorder(recordingId) {
        this.dal.addNewRecording(createRecordingFromModel({id: this.recordingId}))
            .then(() => {
                this.DOMRecorderSvc.listen(document);
            });
    }


    newActionHandler(action) {
        if (!this.#recordingActive)
            return;

        action.recordingId = this.recordingId;
        this.dal.saveAction(action)
            .then(() => {
                console.log("step recorded");
                this.#recordingCounter++;
                this.updateRecordingStatus({
                    status: 2, // 0 not ready, 1 ready, 2 active recording
                    recordingId: this.recordingId,
                    counter: this.#recordingCounter,
                });
            });
    }

    stopRecording() {
        console.log("stopRecording");
        this.#recordingActive = false;
        this.updateRecordingStatus({
            status: 1, // 0 not ready, 1 ready, 2 active recording
            recordingId: this.recordingId,
            counter: 0,
        });
    }

    updateRecordingStatus(dbSync = true) {
        const recordingStatus = {
            status: this.#recordingActive ? 2 : 1, // 0 not ready, 1 ready, 2 active recording
            recordingId: this.#recordingId,
            counter: this.#recordingCounter,
        };
        this.stateSvc.updateState("recording", recordingStatus);
        console.log(recordingStatus);
        if(dbSync)
            this.dal.updateRecording(recordingStatus, this.#recordingId);
    }

}
