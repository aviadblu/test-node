const dal = new dalIndexDb();
const stateSvc = new stateService(dal);
const recordingSvc = new recordingsService(dal);
const DOMMapperSvc = new DOMMapperService();
const DOMRecorderSvc = new DOMRecorderService(DOMMapperSvc, ".no-listen");
const playSvc = new playService(recordingSvc);
const ctrl = new controller(dal, recordingSvc, DOMRecorderSvc, playSvc, stateSvc);
const panel = new panelService(stateSvc, ctrl);

panel.createPanel();


//ctrl.startNewRecording();

