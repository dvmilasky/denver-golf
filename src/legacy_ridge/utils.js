
function parse_tee_times(tee_times) {
    let message = "";
    if (Array.isArray(tee_times)) {
        for (const teeTime of tee_times) {
            const teeSheetId = teeTime.teeSheetId;
            const date = new Date(teeTime.startTime).toLocaleString();
            const holes = teeTime.is9HoleOnly ? 9 : 18;
            const availablePlayers = teeTime.maxPlayer;
            message += `ID: ${teeSheetId} Time: ${date}\nHoles: ${holes} Players: ${availablePlayers}\n\n`;
        }
    } else {
        message += "No Tee Times";
    }
    return message;
}

export {
    parse_tee_times
}