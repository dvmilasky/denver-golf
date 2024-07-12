import axios from "axios";
import config from 'config';
import { book_tee_time, get_tee_times } from "../legacy_ridge/legacy_ridge.js";
import { parse_tee_times } from "../legacy_ridge/utils.js";

const groupmeConfig = config.get("groupme")
const bot_id = process.env.GROUPME_BOT_ID;

async function post_message(text) {
    const endpoint = groupmeConfig.post_message_endpoint;
    do {
        let chunk = text.slice(groupmeConfig.max_message_length);
        const body = {
            "bot_id": bot_id,
            "text": chunk
        }
        const res = await axios.post(endpoint, body).catch(function (error) {
            if (error.response) {
                console.log(error.response.data);
            }
        });
        text = text.slice(groupmeConfig.max_message_length);
    } while (text.length > 0)
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
        const msg = parse_tee_times(teeTimes);
        post_message(msg);
    }
    else if (cmd == "book") {
        const msg = await book_tee_time(args[1], args[2], args[3]);
        post_message(`Confirmation Code: ${msg.reservationId}`);
    }
}

export {
    parse_message
}