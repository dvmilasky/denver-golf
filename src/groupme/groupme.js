import axios from "axios";
import config from 'config';

const groupmeConfig = config.get("groupme")
const bot_id = process.env.GROUPME_BOT_ID;

async function post_message(text) {
    const endpoint = groupmeConfig.post_message_endpoint;
    const body = {
        "bot_id": bot_id,
        "text": text
    }
    const res = await axios.post(endpoint, body)
    return res;
}

console.log(post_message());