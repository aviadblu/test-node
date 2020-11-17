const createActionFromModel = ({recordingId = null, url = window.location.href, type, signature, value}) => ({
    recordingId,
    url,
    type,
    signature,
    value
});
