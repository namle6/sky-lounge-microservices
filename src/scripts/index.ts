export async function awaitAPI() {
    try {
        const response = await fetch('http://localhost:5000/update_flight_data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            // body: JSON.stringify({ key: 'value' }) // Replace with actual data
        });
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }
        // console.log(response.json());
    } catch (err) {
        console.error('Failed to fetch flight data.', err);
        if (err instanceof Error) {
            console.log(err.message);
        }
    } finally {
        console.log(false);
    }
}

// cron.schedule("* */1 * * * *", async () => {
//     console.log("Running a task every minute");
//     await awaitAPI();
// });
