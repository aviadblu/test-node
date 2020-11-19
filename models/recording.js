const createRecordingFromModel = ({id, timestamp = Date.now(), status = 1, actionsCounter = 0}) => ({
    id,
    timestamp,
    status, // 0 not ready, 1 inactive, 2 active recording
    actionsCounter
});
