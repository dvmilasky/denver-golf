import axios from "axios";
import config from 'config';

const legacyRidgeConfig = config.get("legacy_ridge")

async function get_api_key() {
    const endpoint_url = legacyRidgeConfig.base_url + legacyRidgeConfig.api_resource_endpoint;

    const res = await axios.get(endpoint_url);
    return res.data.apiKey;
}


console.log(await get_api_key())