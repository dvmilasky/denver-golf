import axios from "axios";
import config from 'config';
import { book_tee_time, get_tee_times, get_saturday_tee_times } from "../legacy_ridge/legacy_ridge.js";
import { parse_tee_times_to_text, build_tee_time_text } from "../legacy_ridge/utils.js";

const groupmeConfig = config.get("groupme")
const bot_id = process.env.GROUPME_BOT_ID;

async function post_message(text) {
    const endpoint = groupmeConfig.post_message_endpoint;
    do {
        let chunk = text.slice(0, groupmeConfig.max_message_length);
        console.log(`CH: ${chunk}`);
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
        const msg = parse_tee_times_to_text(teeTimes);
        post_message(msg);
    }
    else if (cmd == "book") {
        const msg = await book_tee_time(args[1], args[2], args[3], args[4]);
        post_message(msg);
    }
    else if (cmd == "saturday") {
        const tee_times = await get_saturday_tee_times(args[1], args[2], args[3]);
        if (tee_times.length > 0) {
            const tee_time = tee_times.pop();
            const msg = await book_tee_time(tee_time.teeSheetId);
            post_message(`***********SATURDAY TEE TIME BOOKED***************\n${build_tee_time_text(tee_time)}\n${msg}`);
        } else {
            post_message("Unable to book Saturday Tee Time - Try with less golfers or adjusted time window");
        }
    }
}

await parse_message("saturday 8 13 4 18");

export {
    parse_message
}