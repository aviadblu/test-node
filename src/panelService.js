class panelService {
    #panelReady = false;
    #panelMode = 0;
    #recordingMode;

    constructor(stateSvc, ctrl) {
        this.stateSvc = stateSvc;
        this.ctrl = ctrl;

        this.stateSvc.subscribe("recording", this.newRecordingStateHandler.bind(this), true);

        this.stateSvc.subscribe("mode", this.newModeStateHandler.bind(this), true);

        this.createPanel();
    }

    dispose() {

    }

    newRecordingStateHandler(state) {
        this.#recordingMode = state;
    }

    newModeStateHandler(mode) {
        this.#panelMode = mode;
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
        this.setVisibilityByClass(".panel_mode_state_" + this.#panelMode, true);

        this.setVisibilityByClass(".recordingWrapper", false);
        this.setVisibilityByClass(".recording_state_" + this.#recordingMode.status, true);
    }

    setVisibilityByClass(className, visible) {
        document.querySelectorAll(className).forEach(node => {
            node.style.display = visible ? 'block' : 'none';
        });
    }

    startRecording() {
        this.ctrl.startRecording();
    }

    stopRecording() {
        this.ctrl.stopRecording();
    }

    createPanel() {
        let injectHTML = `
    <div id="injectedPanel">
        <style>
            #injectedPanel {
                height: 40px;
                line-height: 40px;
                padding-left: 10px;
                width: 300px;
                position: absolute;
                right: 0;
                left: 0;
                top:0;
                margin-right: auto;
                margin-left: auto;
                background-color: #FEB81C;
                font-family: Arial, Helvetica, sans-serif;
                font-size: 12px;
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
            
        </style>
        <div class="modeWrapper panel_mode_state_1" id="recordPanel">
                <div class="recordingWrapper recording_state_0">
                    ...
                </div>
                <div class="recordingWrapper recording_state_1">
                    <button onclick="panel.startRecording()">Start recording</button>
                </div>
                <div class="recordingWrapper recording_state_2">
                    <button onclick="panel.stopRecording()">Stop recording</button>
                </div>
        </div>
        
        <div class="modeWrapper panel_mode_state_2" id="playPanel">
               play...
        </div>
                
<!--        <div id="notPlayingContainer">-->
<!--            <img id="logo" src=""/>        -->
<!--            <button id="play" onclick="Play()">Play</button>-->
<!--            <input id="stepsWaitInterval" type="number" min="100" max="5000" />-->
<!--        </div>-->
<!--        <div id="playingContainer">-->
<!--            <img id="loadingIcon" src="">-->
<!--            Playing action <span id="currAction"></span> / <span id="currActionOutOf"></span>-->
<!--        </div>-->
    </div>
    `;

        document.body.innerHTML += injectHTML;

        this.initPanelAfterDomInjected();
    }

}


