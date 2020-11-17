const dal = new dalIndexDb();
const recordingSvc = new recordingsService(dal);
const DOMMapperSvc = new DOMMapperService();
const DOMRecorderSvc = new DOMRecorderService(DOMMapperSvc);

const ctrl = new controller(dal, recordingSvc, DOMRecorderSvc);
//ctrl.startNewRecording();
CreatePanel();

