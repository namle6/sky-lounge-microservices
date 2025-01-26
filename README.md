# TAMUHack 2025 - AAL In-Flight Entertainment
Created by Fawwaz Memon, Sebastian Silva, Hasala Heiyanthuduwa, and Nam Le.

## Tech Stack
### IFE Screen
Developed using Tauri for the application framework, TypeScript/React for the frontend, and a Python/SQLite Database backend.
### Flight Attendant Panel
Developed using Flask and Python.

## Inspiration
Fear of airplane travel is still a fairly common phobia among many folks to this day. Our team aimed to combat these fears by creating an in-flight entertainment service that makes air travel feel more relaxing.

## What it Does
Our software provides users with an easy-to-use interface to view flight data, watch movies, play games, and order food. It also helps flight attendants easily handle passenger requests and turn on a "standby" mode for important announcements.

## Challenges
Planes do not have the greatest internet connection, shockingly enough, so we have to limit the amount of American Airlines API calls we can make at a time. Taking this into consideration, we designed a lightweight local storage database to be held inside the airplane, allowing airplane statistics and food order queries to be seen and managed as quick as possible.

## What's Next
Luckily, thanks to our chosen frameworks, this project can scale quite easily. We could add as many movies as we could, implement whatever games we wanted, and add as much food items as we desired.
