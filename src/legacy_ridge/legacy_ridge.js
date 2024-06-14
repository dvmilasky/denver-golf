import axios from "axios";
import config from 'config';

import teeTimePayload from './data/TeeTimePayload.json' assert { type: "json" };
import golferPaylod from './data/GolferPayload.json' assert { type: "json" };


const legacyRidgeConfig = config.get("legacy_ridge")
const username = process.env.LEGACY_RIDGE_USERNAME;
const password = process.env.LEGACY_RIDGE_PASSWORD;
const card_token = process.env.LEGACY_RIDGE_CARD_TOKEN;

async function login(username, password) {
    const endpoint_url = legacyRidgeConfig.base_url + legacyRidgeConfig.login_endpoint;
    const login_data = {
        "grant_type": "password",
        "scope": "openid profile onlinereservation sale inventory sh customer email recommend references",
        "username": username,
        "password": password,
        "client_id": "js1", // Client and secret of the frontend website -- may need to be periodically updated
        "client_secret": "v4secret"
    };
    const headers = {
        "content-type": "application/x-www-form-urlencoded"
    };
    const res = await axios.post(endpoint_url, login_data, {
        headers: headers
    });

    return res.data.access_token;
}

async function get_api_key() {
    const endpoint_url = legacyRidgeConfig.base_url + legacyRidgeConfig.api_resource_endpoint;

    const res = await axios.get(endpoint_url);
    return res.data.apiKey;
}

async function get_website_id(api_key) {
    const endpoint_url = legacyRidgeConfig.base_url + legacyRidgeConfig.website_id_endpoint;

    const res = await axios.get(endpoint_url, {
        headers: build_basic_headers(api_key)
    });
    return res.data.webSiteId;
}


function build_tee_times_search_params(date, holes, players) {
    const params = {
        "courseIds": legacyRidgeConfig.course_id,
        "searchDate": date,
        "holes": holes,
        "players": players
    };

    return params;
}

function build_basic_headers(api_key) {
    const headers = {
        "x-apikey": api_key,
        "x-componentid": "1"
    };

    return headers;
}

function build_book_tee_times_headers(api_key, website_id, login_token) {
    const headers = {
        "x-apikey": api_key,
        "x-componentid": "1",
        "x-websiteid": website_id,
        "x-terminalid": "1",
        "Authorization": `Bearer ${login_token}`
    };

    return headers;
}


async function get_tee_times() {
    const endpoint_url = legacyRidgeConfig.base_url + legacyRidgeConfig.get_tee_times_endpoint;
    const api_key = await get_api_key();
    const res = await axios.get(endpoint_url, {
        headers: build_basic_headers(api_key),
        params: build_tee_times_search_params("Fri June 14 2024", "18", "4"),
    });
    return res.data;
}

async function reserve_tee_time(tee_sheet_id, num_golfers, holes) {
    const endpoint_url = legacyRidgeConfig.base_url + legacyRidgeConfig.book_tee_time_endpoint;
    const api_key = await get_api_key();
    const website_id = await get_website_id(api_key);

    const login_token = await login(username, password);

    const payload = teeTimePayload;
    payload.finalizeSaleModel.creditCardInfo.cardToken = card_token

    payload.bookingList[0].teeSheetId = tee_sheet_id; // Set tee time for my own golfer
    payload.bookingList[0].holes = holes; // Set num holes for my own golfer
    for (let i = 2; i <= num_golfers; i++) {
        const golfer = structuredClone(golferPaylod);
        golfer.holes = holes;
        golfer.teeSheetId = tee_sheet_id;
        golfer.participantNo = i;
        
        payload.bookingList.push(golfer);
    }


    const res = await axios.post(endpoint_url, payload, {
        headers: build_book_tee_times_headers(api_key, website_id, login_token),
    });
    return res.data;
}

//console.log(await get_tee_times())
console.log(await reserve_tee_time(373748, 4, 18));