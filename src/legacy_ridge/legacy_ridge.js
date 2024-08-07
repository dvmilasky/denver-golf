import axios from "axios";
import config from 'config';

import teeTimePayload from './data/TeeTimePayload.json' assert { type: "json" };
import golferPaylod from './data/GolferPayload.json' assert { type: "json" };

const legacyRidgeConfig = config.get("legacy_ridge")
const username = process.env.LEGACY_RIDGE_USERNAME;
const password = process.env.LEGACY_RIDGE_PASSWORD;
const card_token = process.env.LEGACY_RIDGE_CARD_TOKEN;

const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

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
    }).catch(function (error) {
        console.log("Error: " + error.message);
    });

    return res.data.access_token;
}

async function get_api_key() {
    const endpoint_url = legacyRidgeConfig.base_url + legacyRidgeConfig.api_resource_endpoint;

    const res = await axios.get(endpoint_url).catch(function (error) {
        console.log("Error: " + error.message);
    });
    return res.data.apiKey;
}

async function get_website_id(api_key) {
    const endpoint_url = legacyRidgeConfig.base_url + legacyRidgeConfig.website_id_endpoint;

    const res = await axios.get(endpoint_url, {
        headers: build_basic_headers(api_key)
    }).catch(function (error) {
        console.log("Error: " + error.message);
    });
    return res.data.webSiteId;
}


function build_tee_times_search_params(date, num_golfers, holes) {
    const params = {
        "courseIds": legacyRidgeConfig.course_id,
        "searchDate": date,
        "holes": holes,
        "numberOfPlayer": num_golfers,
        "teeOffTimeMin": 0,
        "teeOffTimeMax": 23
    };

    return params;
}

function build_basic_headers(api_key, website_id) {
    const headers = {
        "x-apikey": api_key,
        "x-componentid": "1",
        "x-websiteid": website_id
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

async function get_saturday_tee_times(earliest_hour, latest_hour, num_golfers, holes) {
    let advanced_date = new Date(new Date().toLocaleString("en-US", {timeZone: 'America/Denver'}));
    advanced_date.setDate(advanced_date.getDate() + legacyRidgeConfig.max_advance_booking_days); // 2 Weeks is legacy ridge max advanced booking time
    const booking_date = `${monthNames[advanced_date.getMonth()]} ${advanced_date.getDate()}`
    let tee_times = await get_tee_times(booking_date, num_golfers, holes);
    
    return tee_times.filter((teeTime) => {
        let startTime = new Date(teeTime.startTime).getHours();
        return (startTime <= latest_hour && startTime >= earliest_hour && num_golfers == teeTime.participants && holes == teeTime.holes);
    });
}

async function get_tee_times(date, num_golfers=0, holes=0) {
    const endpoint_url = legacyRidgeConfig.base_url + legacyRidgeConfig.get_tee_times_endpoint;
    const api_key = await get_api_key();
    const website_id = await get_website_id(api_key);
    const res = await axios.get(endpoint_url, {
        headers: build_basic_headers(api_key, website_id),
        params: build_tee_times_search_params(date, num_golfers, holes),
    }).catch(function (error) {
        if (error.response) {
            console.error(error.response.data);
        }
    });
    if (Array.isArray(res.data)) {
        return res.data;
    }
    return [];
}

async function book_tee_time(tee_sheet_id, num_golfers, holes) {
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
    }).catch(function (error) {
        console.error("Error: " + error.message);
    });
    if (res.data) {
        return `Confirmation ID: ${res.data.reservationId}`;
    }
    return `Error Booking Tee Sheet ID: ${tee_sheet_id}`
}

export {
    get_tee_times,
    book_tee_time,
    get_saturday_tee_times
}