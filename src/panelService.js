class panelService {
    #panelInjected = false;
    #panelReady = false;

    constructor(stateSvc, ctrl) {
        this.stateSvc = stateSvc;
        this.ctrl = ctrl;
        this.stateSvc.subscribe("mode", this.newModeStateHandler.bind(this), true);
        this.stateSvc.subscribe("recording", this.newRecordingStateHandler.bind(this), true);
        this.stateSvc.subscribe("playing", this.newRecordingStateHandler.bind(this), true);

    }

    dispose() {

    }

    newModeStateHandler() {
        this.updateDom();
    }

    newRecordingStateHandler() {
        this.updateDom();
    }

    newPlayingStateHandler() {
        this.updateDom();
    }

    initPanelAfterDomInjected() {
        this.#panelReady = true;
        this.updateDom();
    }

    updateDom() {
        if (!this.#panelReady)
            return;

        this.setVisibilityByClass(".modeWrapper", false);
        this.setVisibilityByClass(".panel_mode_btn", false);
        this.setVisibilityByClass(".panel_mode_state_" + this.stateSvc.state.mode, true);
        this.setVisibilityByClass(".recordingWrapper", false);
        this.setVisibilityByClass(".recording_state_" + this.stateSvc.state.recording.status, true);
        this.setVisibilityByClass(".playingWrapper", false);
        this.setVisibilityByClass(".playing_state_" + this.stateSvc.state.playing.status, true);
        document.getElementById("recordingCounter").innerHTML = this.stateSvc.state.recording.counter;

        document.getElementById("playingCurrent").innerHTML = this.stateSvc.state.playing.playCounter;
        document.getElementById("playingOutOf").innerHTML = this.stateSvc.state.playing.totalActionsInRecording;

        this.buildRecordingSComboBox();

    }

    buildRecordingSComboBox() {
        const comboBox = document.getElementById("recordingsCB");
        comboBox.innerHTML = "";
        if (this.stateSvc.state.playing.recordingList) {
            this.stateSvc.state.playing.recordingList.forEach(recording => {
                const opt = document.createElement('option');
                opt.value = recording.id;
                opt.innerHTML = `${formatTimestamp(recording.timestamp)} (${recording.actionsCounter} actions)`;
                comboBox.appendChild(opt);
            });
        }
    }

    setVisibilityByClass(className, visible) {
        document.querySelectorAll(className).forEach(node => {
            node.style.display = visible ? 'block' : 'none';
        });
    }

    switchMode() {
        this.stateSvc.updateState("mode", this.stateSvc.state.mode === 1 ? 2 : 1);
    }

    startRecording() {
        this.ctrl.startRecording();
    }

    stopRecording() {
        this.ctrl.stopRecording();
    }

    playRec() {
        const comboBox = document.getElementById("recordingsCB");
        this.ctrl.playRecording(comboBox.value);
    }

    downloadRec() {

    }

    deleteRec() {

    }

    createPanel() {

        if (this.#panelInjected)
            return;

        let injectHTML = `
    <div id="injectedPanel" class="no-listen">
        <style>
            #injectedPanel {
                height: 40px;
                line-height: 40px;
                padding: 0;
                width: 450px;
                position: absolute;
                right: 0;
                left: 0;
                top: 0;
                margin-right: auto;
                margin-left: auto;
                font-family: Arial, Helvetica, sans-serif;
                font-size: 12px;
                display: flex;
                border: 2px solid aquamarine;
            }
            
            #panelMainArea {
                flex: 8;
                background-color: aliceblue;
                padding-left: 10px;
                
            }
            
            #panelSideArea {
                text-align: center;
                flex: 1;
                border: 1px solid aliceblue;
                background-color: aquamarine;
                cursor: pointer;
            }
            
            .panel_mode_btn {
                display: none;
            }
            
            #logo {
                height: 40px;
                float: right;
            }
            
            #stepsWaitInterval {
                width: 50px;
            }
            
            #notPlayingContainer {
                display: none;
            }
            
            #playingContainer {
                display: none;
            }
            
            #loadingIcon {
                height: 40px;
                float:left;
                margin-right: 10px;
            }
            
            .modeWrapper {
                display: none;
            }
            
            .recordingWrapper {
                display: none;
            }
            
            .floatingLeftDiv {
                display: inline-block;
            }
            
            .playingWrapper {
                display: none;
            }
            
        </style>
        <div id="panelMainArea">
            <div class="modeWrapper panel_mode_state_1" id="recordPanel">
                    <div class="recordingWrapper recording_state_0">
                        ...
                    </div>
                    <div class="recordingWrapper recording_state_1">
                        <button onclick="panel.startRecording()">Start recording</button>
                    </div>
                    <div class="recordingWrapper recording_state_2">
                        <button onclick="panel.stopRecording()">Stop recording</button>
                        Actions: <div class="floatingLeftDiv" id="recordingCounter">0</div>
                    </div>
            </div>
            
            <div class="modeWrapper panel_mode_state_2" id="playPanel">
                <div class="playingWrapper playing_state_0">
                       ...
                </div> 
                <div class="playingWrapper playing_state_1">
                       <select id="recordingsCB"></select>
                       <button onclick="panel.playRec()">play</button>
                       <button onclick="panel.downloadRec()">download</button>
                       <button onclick="panel.deleteRec()">delete</button>
                </div>
                <div class="playingWrapper playing_state_2">
                    Playing action <span id="playingCurrent">0</span> out of <span id="playingOutOf">0</span>
                </div>
            </div>
        </div>
        <div id="panelSideArea" onclick="panel.switchMode()">
            <span class="panel_mode_btn panel_mode_state_1">R</span>
            <span class="panel_mode_btn panel_mode_state_2">P</span>
        </div>
    </div>
    `;
        const panel = new DOMParser().parseFromString(injectHTML, "text/html");
        document.body.prepend(panel.documentElement.childNodes[1].childNodes[0]);
        this.initPanelAfterDomInjected();
        this.#panelInjected = true;
    }

}


