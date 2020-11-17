const createRecordingFromModel = ({id, timestamp = Date.now(), status = 1, actionsCounter = 0}) => ({
    id,
    timestamp,
    status, // 0 for active, 1 for stopped
    actionsCounter
});
