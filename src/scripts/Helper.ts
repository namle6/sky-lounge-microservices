export function constrain(val : number, low : number, high : number){
    if(val < low) return low;
    else if(val > high) return high;
    return val;
}

export function lerp(val : number, low : number, high : number){
    return ((val - low) / (high - low));
}

export function calculateRemainingMinutes(end : Date){
    const currentDate : Date = new Date();
    return Math.trunc((end.getTime() - currentDate.getTime()) / 60000);
}

export type flight_data_structure = {
    FLIGHT_NUMBER: string,
    DEPARTURE_CITY: string,
    DEPARTURE_CODE: string,
    DEPARTURE_TIME: Date,
    ARRIVAL_CITY: string,
    ARRIVAL_CODE: string,
    ARRIVAL_TIME: Date,
}

export type flight_extra_structure = {
    altitude: number, // in feet
    outsideTemp: number, // in degrees Fahrenheit
    remainingTime: number, // in minutes
    flightProgress: number, // 0.0 to 1.0
}

export function getFlightData(flightStats : flight_data_structure, extraStats : flight_extra_structure, data : flight_data_structure){
    flightStats.FLIGHT_NUMBER = data.FLIGHT_NUMBER;
    flightStats.DEPARTURE_CITY = data.DEPARTURE_CITY;
    flightStats.DEPARTURE_CODE = data.DEPARTURE_CODE;
    flightStats.DEPARTURE_TIME = data.DEPARTURE_TIME;
    flightStats.ARRIVAL_CITY = data.ARRIVAL_CITY;
    flightStats.ARRIVAL_CODE = data.ARRIVAL_CODE;
    flightStats.ARRIVAL_TIME = data.ARRIVAL_TIME;
    extraStats.remainingTime = constrain(calculateRemainingMinutes(flightStats.ARRIVAL_TIME), 0, 10000);
    extraStats.flightProgress = constrain(
        lerp(new Date().getTime(), flightStats.ARRIVAL_TIME.getTime(), flightStats.ARRIVAL_TIME.getTime()), 0, 1);
}

