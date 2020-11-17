class recordingsService {

    constructor(dal) {
        this.dal = dal;
    }


    sortRecordingsByTimestamp(recordings) {
        // last recording will be in place 0
        function compare(a, b) {
            if (a.timestamp < b.timestamp) {
                return -1;
            }
            if (a.timestamp > b.timestamp) {
                return 1;
            }
            return 0;
        }

        return recordings.sort(compare).reverse();
    }

    getActiveRecording() {
        return new Promise(resolve => {
            this.dal.readRecordings()
                .then(recordings => {
                    if (recordings.length > 0) {
                        const activeRecordings = this.sortRecordingsByTimestamp(recordings.filter(rec => rec.status > 0));
                        resolve(activeRecordings[0]);
                        if (recordings.length > 1) {
                            // fix old recordings status
                            activeRecordings.shift();
                            return Promise.all(activeRecordings.map(rec => {
                                rec.status = 0;
                                return this.dal.updateRecording(rec);
                            }));
                        }
                    } else {
                        resolve();
                    }
                });


        });

    }
}
