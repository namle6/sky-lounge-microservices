import sqlite3
import time
import json
from datetime import datetime
from flask import Flask, render_template, request, redirect, url_for, jsonify, Response
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

DATABASE = "mydatabase.db"

# ------------------------------------------------------
# Global variables for SSE updates
# ------------------------------------------------------
latest_switch_state = None  # we'll detect changes in /events
latest_eta_update = {
    "seat_id": 31,
    "eta": 10,
}  # stores the most recent {"seat_id": X, "eta": Y}


# ------------------------------------------------------
#                    HELPER FUNCTIONS
# ------------------------------------------------------


def get_db_connection():
    """
    Returns a new SQLite connection (with row_factory as Row).
    """
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn


def get_switch_state():
    """
    Fetch the single row from SPECIAL table. If STATUS = '1', the switch is ON;
    if STATUS = '0', the switch is OFF. If not found, default to False.
    """
    conn = get_db_connection()
    row = conn.execute("SELECT STATUS FROM SPECIAL LIMIT 1").fetchone()
    conn.close()
    if row:
        return row["STATUS"] == "1"  # True if '1', else False
    return False


def set_switch_state(is_on):
    """
    Update the SPECIAL table so that STATUS = '1' if is_on is True,
    otherwise '0'.
    """
    new_status = "1" if is_on else "0"
    conn = get_db_connection()
    conn.execute("UPDATE SPECIAL SET STATUS = ?", (new_status,))
    conn.commit()
    conn.close()


def fetch_meals_data():
    """
    Joins ORDERS -> SEAT -> FOOD (for main meal)
                  -> FOOD (for addon_1) -> FOOD (for addon_2)
    and constructs a list of dictionaries that correspond
    to the "meal distribution" items.
    """
    conn = get_db_connection()

    query = """
        SELECT
            O.ORDER_ID,
            O.SEAT_ID,
            O.TIME_ORDERED,
            O.STATUS,

            S.FIRST_NAME,
            S.LAST_NAME,

            -- Main meal
            O.FOOD_ITEM_ID AS MAIN_FOOD_ID,
            F_MAIN.NAME    AS MAIN_FOOD_NAME,

            -- Add-ons
            O.ADDON_1_ID,
            F_ADD1.NAME AS ADDON_1_NAME,
            O.ADDON_2_ID,
            F_ADD2.NAME AS ADDON_2_NAME

        FROM ORDERS O
        JOIN SEAT S ON O.SEAT_ID = S.SEAT_ID
        LEFT JOIN FOOD F_MAIN ON O.FOOD_ITEM_ID = F_MAIN.ID
        LEFT JOIN FOOD F_ADD1 ON O.ADDON_1_ID  = F_ADD1.ID
        LEFT JOIN FOOD F_ADD2 ON O.ADDON_2_ID  = F_ADD2.ID
        ORDER BY O.ORDER_ID
    """
    rows = conn.execute(query).fetchall()
    conn.close()

    meals = []
    for row in rows:
        # Build "addons" list from any non-NULL add-on names
        addons_list = []
        if row["ADDON_1_NAME"] is not None:
            addons_list.append(row["ADDON_1_NAME"])
        if row["ADDON_2_NAME"] is not None:
            addons_list.append(row["ADDON_2_NAME"])

        # We'll interpret "given" = True if STATUS is "delivered" or "ready"
        is_given = row["STATUS"] in ("delivered", "ready")

        # Combine seat first/last name
        full_name = f"{row['FIRST_NAME']} {row['LAST_NAME']}"

        meals.append(
            {
                "id": row["ORDER_ID"],  # Our reference to the order
                "seat": f"Seat {row['SEAT_ID']}",
                "name": full_name.strip(),
                "meal": (
                    row["MAIN_FOOD_NAME"] if row["MAIN_FOOD_NAME"] else "Unknown Meal"
                ),
                "addons": addons_list,
                "given": is_given,
            }
        )
    return meals


def calculate_eta(seat_id):
    """
    Returns the estimated time (in minutes) remaining for the next undelivered
    order for the given seat. If no pending orders, returns 0.

    Logic:
      1) Find the earliest undelivered order for that seat.
      2) Sum up the PREPARE_TIME (main + add-ons).
      3) Subtract how many minutes have elapsed since TIME_ORDERED.
      4) If the result is negative, clamp to 0.
    """
    conn = get_db_connection()

    # Query earliest undelivered order for that seat
    sql = """
        SELECT
            O.ORDER_ID,
            O.TIME_ORDERED,
            IFNULL(F_MAIN.PREPARE_TIME, 0)  AS MAIN_PREP,
            IFNULL(F_ADD1.PREPARE_TIME, 0)  AS ADD1_PREP,
            IFNULL(F_ADD2.PREPARE_TIME, 0)  AS ADD2_PREP
        FROM ORDERS O
        LEFT JOIN FOOD F_MAIN ON O.FOOD_ITEM_ID = F_MAIN.ID
        LEFT JOIN FOOD F_ADD1 ON O.ADDON_1_ID   = F_ADD1.ID
        LEFT JOIN FOOD F_ADD2 ON O.ADDON_2_ID   = F_ADD2.ID
        WHERE O.SEAT_ID = 31
          AND O.STATUS != 'delivered'
        ORDER BY O.TIME_ORDERED
        LIMIT 1
    """
    row = conn.execute(sql).fetchone()
    conn.close()

    if not row:
        # No pending orders => no ETA
        return 0

    # Sum total preparation times
    total_prep = row["MAIN_PREP"] + row["ADD1_PREP"] + row["ADD2_PREP"]

    time_ordered_str = row["TIME_ORDERED"]
    try:
        time_ordered = datetime.strptime(str(time_ordered_str), "%Y-%m-%d %H:%M:%S")
    except ValueError:
        # If the format is different or missing, treat as if just now
        time_ordered = datetime.now()

    # Calculate how many minutes have elapsed
    minutes_elapsed = (datetime.now() - time_ordered).total_seconds() / 60.0
    remaining = total_prep - minutes_elapsed
    # Clamp to zero if negative
    if remaining < 0:
        remaining = 0

    return int(remaining)


###########################################################
#                    FLIGHT DATA                          #
###########################################################
@app.route("/flight_data", methods=["GET"])
def get_flight_data():
    """
    Gets the flight data from the database
    """
    conn = get_db_connection()
    flight = conn.execute("SELECT * FROM FLIGHT_DATA").fetchone()
    if not flight:
        conn.close()
        return jsonify({"Error retrieving flight data."}), 404

    flight_data = {
        "FLIGHT_NUMBER": flight["FLIGHT_NUMBER"],
        "DEPARTURE_CITY": flight["DEPARTURE_CITY"],
        "DEPARTURE_CODE": flight["DEPARTURE_CODE"],
        "DEPARTURE_TIME": flight["DEPARTURE_TIME"],
        "ARRIVAL_CITY": flight["ARRIVAL_CITY"],
        "ARRIVAL_CODE": flight["ARRIVAL_CODE"],
        "ARRIVAL_TIME": flight["ARRIVAL_TIME"],
    }

    return jsonify(flight_data)


# ------------------------------------------------------
#                    FLASK ROUTES
# ------------------------------------------------------


@app.route("/")
def index():
    """
    Show the list of orders that are NOT yet 'given'.
    Also show the switch's current on/off state.
    """
    all_meals = fetch_meals_data()
    # Filter out ones which are "given" == True
    pending_meals = [m for m in all_meals if not m["given"]]
    is_switch_on = get_switch_state()
    return render_template("index.html", meals=pending_meals, is_switch_on=is_switch_on)


@app.route("/give/<int:meal_id>", methods=["POST"])
def give_meal(meal_id):
    """
    Mark an order's status as 'delivered' so it's considered "given."
    Then compute the new ETA for that seat and store it for SSE.
    """
    conn = get_db_connection()

    # Fetch the seat ID for this meal
    seat_row = conn.execute(
        "SELECT SEAT_ID FROM ORDERS WHERE ORDER_ID = ?", (meal_id,)
    ).fetchone()
    if not seat_row:
        conn.close()
        return redirect(url_for("index"))
    seat_id = seat_row["SEAT_ID"]

    # Mark the order as delivered
    conn.execute(
        "UPDATE ORDERS SET STATUS = 'delivered' WHERE ORDER_ID = ?", (meal_id,)
    )
    conn.commit()
    conn.close()

    # Calculate new ETA for that seat (if any remaining orders)

    # Update global variable for SSE
    global latest_eta_update
    new_eta = latest_eta_update["eta"] - 1
    latest_eta_update = {"seat_id": seat_id, "eta": new_eta}

    return redirect(url_for("index"))


@app.route("/toggle_switch", methods=["POST"])
def toggle_switch():
    """
    Reads the checkbox from the form and updates the SPECIAL table's STATUS
    to '1' or '0'.
    """
    is_on = "is_switch_on" in request.form
    set_switch_state(is_on)
    return redirect(url_for("index"))


# ------------------------------------------------------
#               SEAT-SPECIFIC JSON ROUTE
# ------------------------------------------------------


@app.route("/seat/<int:seat_id>", methods=["GET"])
def get_seat_data(seat_id):
    """
    Returns JSON data for a single seat, including occupant info and any
    associated orders (with main meal + add-ons).
    """
    conn = get_db_connection()

    # Fetch the seat row
    seat_sql = """
        SELECT SEAT_ID, FIRST_NAME, LAST_NAME, CHILD_SEAT
        FROM SEAT
        WHERE SEAT_ID = ?
    """
    seat_row = conn.execute(seat_sql, (seat_id,)).fetchone()
    if not seat_row:
        conn.close()
        return jsonify({"error": f"Seat {seat_id} not found"}), 404

    # Fetch orders + add-ons
    orders_sql = """
        SELECT
            O.ORDER_ID,
            O.TIME_ORDERED,
            O.STATUS,
            F_MAIN.NAME  AS MAIN_FOOD_NAME,
            F_ADD1.NAME  AS ADDON_1_NAME,
            F_ADD2.NAME  AS ADDON_2_NAME
        FROM ORDERS O
        LEFT JOIN FOOD F_MAIN ON O.FOOD_ITEM_ID = F_MAIN.ID
        LEFT JOIN FOOD F_ADD1 ON O.ADDON_1_ID   = F_ADD1.ID
        LEFT JOIN FOOD F_ADD2 ON O.ADDON_2_ID   = F_ADD2.ID
        WHERE O.SEAT_ID = ?
    """
    orders_rows = conn.execute(orders_sql, (seat_id,)).fetchall()
    conn.close()

    seat_info = {
        "seat_id": seat_row["SEAT_ID"],
        "first_name": seat_row["FIRST_NAME"],
        "last_name": seat_row["LAST_NAME"],
        "child_seat": seat_row["CHILD_SEAT"],
        "orders": [],
    }

    for o in orders_rows:
        addons = []
        if o["ADDON_1_NAME"]:
            addons.append(o["ADDON_1_NAME"])
        if o["ADDON_2_NAME"]:
            addons.append(o["ADDON_2_NAME"])

        seat_info["orders"].append(
            {
                "order_id": o["ORDER_ID"],
                "time_ordered": o["TIME_ORDERED"],
                "status": o["STATUS"],
                "meal_name": o["MAIN_FOOD_NAME"] or "Unknown Meal",
                "addons": addons,
            }
        )

    return jsonify(seat_info)


# ------------------------------------------------------
#         MOVIES & GAMES JSON (SIMPLE EXAMPLES)
# ------------------------------------------------------


@app.route("/movies", methods=["GET"])
def get_movies():
    """
    Returns the entire MOVIES table as JSON.
    """
    conn = get_db_connection()
    rows = conn.execute("SELECT * FROM MOVIES").fetchall()
    conn.close()

    movies = []
    for row in rows:
        movies.append(
            {
                "id": row["ID"],
                "title": row["TITLE"],
                "thumbnail": row["THUMBNAIL"],
                "description": row["DESCRIPTION"],
                "rating": row["RATING"],
                "file_path": row["FILE_PATH"],
                "genre": row["GENRE"],
                "release_date": str(row["RELEASE_DATE"]),
                "duration": row["DURATION"],
                "director": row["DIRECTOR"],
            }
        )
    return jsonify(movies)


@app.route("/games", methods=["GET"])
def get_games():
    """
    Returns the entire GAMES table as JSON.
    """
    conn = get_db_connection()
    rows = conn.execute("SELECT * FROM GAMES").fetchall()
    conn.close()

    games = []
    for row in rows:
        games.append(
            {
                "id": row["ID"],
                "title": row["TITLE"],
                "thumbnail": row["THUMBNAIL"],
                "description": row["DESCRIPTION"],
                "file_path": row["FILE_PATH"],
            }
        )
    return jsonify(games)


@app.route("/foods", methods=["GET"])
def get_foods():
    """
    Returns the entire FOOD table as JSON.
    """
    conn = get_db_connection()
    rows = conn.execute("SELECT * FROM FOOD").fetchall()
    conn.close()

    foods = []
    for row in rows:
        foods.append(
            {
                "id": row["ID"],
                "title": row["NAME"],
                "type": row["TYPE"],
                "prepare_time": row["PREPARE_TIME"],
                "availability": row["AVAILABILITY"],
                "calories": row["CALORIES"],
                "description": row["DESCRIPTION"],
                "price": row["PRICE"],
            }
        )
    return jsonify(foods)


# ------------------------------------------------------
#                 SSE /events ENDPOINT
# ------------------------------------------------------


@app.route("/events", methods=["GET"])
def sse_events():
    """
    SSE endpoint that streams events to the client:
      1) Switch state changes (event: switch)
      2) ETA updates after an order is delivered (event: eta)

    Naive approach: poll every second, detect changes, yield SSE events.
    """

    def event_stream():
        global latest_switch_state
        global latest_eta_update

        # Local copies to track changes
        last_switch = get_switch_state()
        last_eta_info = None

        # Immediately send the current switch state on connect
        yield f"event: switch\ndata: {str(last_switch)}\n\n"

        while True:
            time.sleep(1)

            # 1) Check for switch state changes
            current_switch = get_switch_state()
            if current_switch != last_switch:
                last_switch = current_switch
                yield f"event: switch\ndata: {str(current_switch)}\n\n"

            # 2) Check if there's a new ETA update
            if latest_eta_update != last_eta_info:
                last_eta_info = latest_eta_update
                if last_eta_info:
                    # Send JSON as SSE data
                    yield f"event: eta\ndata: {json.dumps(last_eta_info)}\n\n"

    return Response(event_stream(), mimetype="text/event-stream")


# ------------------------------------------------------
#                   MAIN ENTRY POINT
# ------------------------------------------------------

if __name__ == "__main__":
    # Debug=True for development convenience
    # In production, use a real server (gunicorn, etc.) and debug=False
    app.run(debug=True, host="0.0.0.0")
