
function parse_tee_times_to_text(tee_times) {
    let message = "";
    if (tee_times.length > 0) {
        for (const teeTime of tee_times) {
            const text = build_tee_time_text(teeTime);
            message += text;
        }
    } else {
        message += "No Tee Times";
    }
    return message;
}

function build_tee_time_text(teeTime) {
    const teeSheetId = teeTime.teeSheetId;
    const date = new Date(teeTime.startTime).toLocaleString();
    const holes = teeTime.is9HoleOnly ? 9 : 18;
    const availablePlayers = teeTime.maxPlayer;
    const text = `ID: ${teeSheetId} Time: ${date}\nHoles: ${holes} Players: ${availablePlayers}\n\n`;
    return message;
}

export {
    parse_tee_times_to_text,
    build_tee_time_text
}