const cron = require("node-cron");
const express = require("express");
import * as helper from './Helper';

let app = express(); // Initializing app

const es = new EventSource('http://localhost/flight_data');

type flight_data_structure = {
    FLIGHT_NUMBER: string,
    DEPARTURE_CITY: string,
    DEPARTURE_CODE: string,
    DEPARTURE_TIME: Date,
    ARRIVAL_CITY: string,
    ARRIVAL_CODE: string,
    ARRIVAL_TIME: Date,
  }

cron.schedule("* */5 * * * *", function() {
    console.log("ok!");
    //helper.updateFlightData();
});

