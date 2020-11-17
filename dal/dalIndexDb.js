const DB_NAME = "ActionsCacheDB";
const DB_RECORDINGS_OBJECT = "recordings";
const DB_ACTIONS_OBJECT = "actions";
const DB_VERSION = 1;

class dalIndexDb {
    constructor() {
        this.db = {};
        this.ready = false;
        this.readyEvent = new Event('dalIndexDbReady');
        this.initDb();
    }

    initDb() {
        const request = window.indexedDB.open(DB_NAME, DB_VERSION);
        request.onerror = (event) => {
            console.error('The database is opened failed');
        };

        request.onsuccess = () => {
            this.db = request.result;
            window.dispatchEvent(this.readyEvent);
            this.ready = true;
        };

        request.onupgradeneeded = (event) => {
            console.log("onupgradeneeded");
            this.db = event.target.result;
            let objectStore;

            if (!this.db.objectStoreNames.contains(DB_RECORDINGS_OBJECT)) {
                objectStore = this.db.createObjectStore(
                    DB_RECORDINGS_OBJECT,
                    {keyPath: 'id'}
                );
            }

            if (!this.db.objectStoreNames.contains(DB_ACTIONS_OBJECT)) {
                objectStore = this.db.createObjectStore(
                    DB_ACTIONS_OBJECT,
                    {autoIncrement: true}
                );
                objectStore.createIndex('recordingId', 'recordingId', {unique: false});
            }

        }
    }

    readyPromise() {
        return new Promise(resolve => {
            if (this.ready) {
                resolve();
            } else {
                window.addEventListener('dalIndexDbReady', () => {
                    resolve();
                })
            }
        });
    }

    saveAction(action) {
        return this.readyPromise().then(() => {
            return new Promise((resolve, reject) => {
                const request = this.db.transaction([DB_ACTIONS_OBJECT], 'readwrite')
                    .objectStore(DB_ACTIONS_OBJECT)
                    .add(action);

                request.onsuccess = function (event) {
                    resolve();
                };

                request.onerror = function (event) {
                    reject(event);
                };
            });
        });
    }

    readRecordings() {
        return this.readyPromise().then(() => {
            return new Promise((resolve, reject) => {
                let response = [];
                const objectStore = this.db.transaction(DB_RECORDINGS_OBJECT).objectStore(DB_RECORDINGS_OBJECT);
                objectStore.openCursor().onsuccess = function (event) {
                    const cursor = event.target.result;
                    if (cursor) {
                        response.push(cursor.value);
                        cursor.continue();
                    } else {
                        resolve(response);
                    }
                };
            });
        });
    }

    addNewRecording(recording) {
        return this.readyPromise().then(() => {
            return new Promise((resolve, reject) => {
                const request = this.db.transaction([DB_RECORDINGS_OBJECT], 'readwrite')
                    .objectStore(DB_RECORDINGS_OBJECT)
                    .add(recording);

                request.onsuccess = function (event) {
                    resolve();
                };

                request.onerror = function (event) {
                    reject(event);
                };
            })
        });
    }


    updateRecording(recording) {
        return this.readyPromise().then(() => {
            return new Promise((resolve, reject) => {
                const request = this.db.transaction([DB_RECORDINGS_OBJECT], 'readwrite')
                    .objectStore(DB_RECORDINGS_OBJECT)
                    .put(recording);

                request.onsuccess = function (event) {
                    resolve();
                };

                request.onerror = function (event) {
                    reject(event);
                };
            })
        });
    }

    readActions() {
        return this.readyPromise().then(() => {
            return new Promise((resolve, reject) => {
                let response = [];
                const objectStore = this.db.transaction(DB_ACTIONS_OBJECT).objectStore(DB_ACTIONS_OBJECT);
                objectStore.openCursor().onsuccess = function (event) {
                    const cursor = event.target.result;
                    if (cursor) {
                        response.push(cursor.value);
                        cursor.continue();
                    } else {
                        resolve(response);
                    }
                };
            });
        });
    }
}
