const cron = require("node-cron");
const express = require("express");

let app = express(); // Initializing app

async function awaitAPI(){
    try {
        const response = await fetch('http://192.168.253.26:5000/update_flight_data'); //change to localhost
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        } 
        console.log(response);
    } catch (err) {
        console.error('Failed to fetch flight data.', err);
        if (err instanceof Error) {
            console.log(err.message);
        }
    } finally {
        console.log(false);
    }
}

cron.schedule("* */5 * * * *", async () => {
    await awaitAPI();
});

