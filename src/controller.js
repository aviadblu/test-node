class controller {

    constructor(dal, recordingSvc, DOMRecorderSvc, playSvc, stateSvc) {
        this.dal = dal;
        this.recordingSvc = recordingSvc;
        this.DOMRecorderSvc = DOMRecorderSvc;
        this.playSvc = playSvc;
        this.stateSvc = stateSvc;

        this.DOMRecorderSvc.DelegateNewActionHandler(this.newActionHandler.bind(this));
        this.initRecordings();

        this.playSvc.DelegatePlayedActionHandler(this.actionPlayedHandler.bind(this));

        this.stateSvc.subscribe("recording", (newState) => {
            // save in DB
            this.syncRecordingStateToDB(newState.id, newState.status, newState.counter);
        });
    }

    initRecordings() {
        this.recordingSvc.getActiveRecording()
            .then(activeRecording => {
                if (activeRecording) {
                    this.updateRecordingState(activeRecording.id, 2, activeRecording.actionsCounter);
                    this.DOMRecorderSvc.listen(document);
                } else {
                    this.updateRecordingState(null, 1, 0);
                }

                this.recordingSvc.getRecordingsFromDB()
                    .then(recordings => {
                        this.stateSvc.updateState("playing", {
                            recordingList: recordings,
                            status: 1,
                            activeRecording: null,
                            playCounter: 0
                        });
                    });
            });
    }

    startRecording() {
        this.updateRecordingState(uuidv4(), 2, 0);
        this.DOMRecorderSvc.listen(document);
    }

    newActionHandler(action) {
        if (!(this.stateSvc.state.recording.status === 2))
            return;

        action.recordingId = this.stateSvc.state.recording.id;
        this.dal.saveAction(action)
            .then(() => {
                this.updateRecordingState(this.stateSvc.state.recording.id, 2, this.stateSvc.state.recording.counter + 1);
                console.log("action recorded", this.stateSvc.state.recording.counter);
            });
    }

    stopRecording() {
        this.updateRecordingState(this.stateSvc.state.recording.id, 1, this.stateSvc.state.recording.counter);
        this.updateRecordingState(null, 1, 0);
    }

    updateRecordingState(id, status, counter) {
        const recordingStatus = deepClone({
            id: id,
            status: status, // 0 not ready, 1 ready, 2 active recording
            counter: counter,
        });
        this.stateSvc.updateState("recording", recordingStatus);
    }

    syncRecordingStateToDB(id, status, counter) {
        if (id) {
            this.dal.updateRecording(createRecordingFromModel({
                id: id,
                status: status,
                actionsCounter: counter
            }), id)
                .then(() => {

                });
        }
    }

    playRecording(recordingId) {
        this.dal.readActions(recordingId)
            .then(actions => {
                this.stateSvc.updateState("playing", {
                    recordingList: this.stateSvc.state.playing.recordingList,
                    status: 2,
                    activeRecording: recordingId,
                    totalActionsInRecording: actions.length,
                    playCounter: 0
                });
                this.playSvc.playRecording(actions);
            });
    }

    actionPlayedHandler(action, actionsLeft) {
        const recLength = this.stateSvc.state.playing.totalActionsInRecording;

        this.stateSvc.updateState("playing", {
            recordingList: this.stateSvc.state.playing.recordingList,
            status: actionsLeft > -1 ? 2 : 1,
            activeRecording: this.stateSvc.state.playing.activeRecording,
            totalActionsInRecording: recLength,
            playCounter: (recLength - actionsLeft)
        });
    }

}
