import config from 'config'
const groupmeConfig = config.get("groupme")

function *parse_tee_times(tee_times) {
    let message = "";
    if (Array.isArray(tee_times)) {
        for (const teeTime of tee_times) {
            const teeSheetId = teeTime.teeSheetId;
            const date = new Date(teeTime.startTime).toLocaleString();
            const holes = teeTime.is9HoleOnly ? 9 : 18;
            const availablePlayers = teeTime.maxPlayer;
            message += `ID: ${teeSheetId} Time: ${date}\nHoles: ${holes} Players: ${availablePlayers}\n\n`;
            if (message.length > groupmeConfig.max_message_length) {
                yield message
            }
        }
    } else {
        return "No Tee Times";
    }
}

export {
    parse_tee_times
}