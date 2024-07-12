import axios from "axios";
import config from 'config';
import { book_tee_time, get_tee_times } from "../legacy_ridge/legacy_ridge.js";
import { parse_tee_times } from "../legacy_ridge/utils.js";

const groupmeConfig = config.get("groupme")
const bot_id = process.env.GROUPME_BOT_ID;

async function post_message(text) {
    const endpoint = groupmeConfig.post_message_endpoint;
    const body = {
        "bot_id": bot_id,
        "text": text
    }
    const res = await axios.post(endpoint, body).catch(function (error) {
        if (error.response) {
            console.log(error.response.data);
        }
    });
    return res;
}

async function parse_message(text) {
    const args = text.split(" ");
    const cmd = args[0];
    if (cmd == "help") {
        const msg = `To get tee times on a date: teetimes <month> <day> <number of players> <number of holes>\n\nTo book a tee time: book <teeSheetId> <number of players> <number of holes>`
        post_message(msg);
    } 
    else if (cmd == "teetimes") {
        const teeTimes = await get_tee_times(args[1] + " " + args[2], args[3], args[4]); // TODO: Validate input
        done = false
        msg = ""
        do {
            msg, done = parse_tee_times(teeTimes).next();
            post_message(msg);
        } while (!done)
    }
    else if (cmd == "book") {
        const msg = await book_tee_time(args[1], args[2], args[3]);
        post_message(`Confirmation Code: ${msg.reservationId}`);
    }
}

export {
    parse_message
}