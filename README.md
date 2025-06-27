# TAMUHack 2025 - AAL In-Flight Entertainment Microservices  
Created by Fawwaz Memon, Sebastian Silva, Hasala Heiyanthuduwa, and Nam Le.

This is my effort to break down the game services into microservices and add CI/CD to the project.

## Tech Stack

Developed using Tauri for the application framework, TypeScript/React for the frontend, and a Python/SQLite backend at the start.

The game services were originally hard-coded directly into React. I broke down the game logic into containers and deployed them on Kubernetes with the help of Google Kubernetes Engine (GKE).

I'm using GitHub Actions for CI/CD, integrated with GKE.

## What it Does

The software provides users with an easy-to-use interface to view flight data, watch movies, play games, and order food. It also helps flight attendants easily handle passenger requests and turn on a "standby" mode for important announcements.

Thanks to containerization, the application can scale and handle more load easily.

## Challenges

Migrating from a monolith to microservices was a huge task. I had to investigate and break down many small parts to achieve scalability.
