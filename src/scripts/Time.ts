function constrain(val : number, low : number, high : number){
    if(val < low) return low;
    else if(val > high) return high;
    return val;
}

function lerp(val : number, low : number, high : number){
    return ((val - low) / (high - low));
}

const departure = new Date('2025-01-25 21:00:00');
const arrival = new Date('2025-01-26 00:00:00');
const current = new Date();

//console.log("---------------------------------------------");

console.log(departure.getTime());
console.log(current.getTime());
console.log(arrival.getTime());

const remainingTime = arrival.getTime() - current.getTime();
console.log("Minutes remaining: " + Math.trunc(remainingTime / 60000));

console.log(constrain(lerp(current.getTime(), departure.getTime(), arrival.getTime()), 0, 1));