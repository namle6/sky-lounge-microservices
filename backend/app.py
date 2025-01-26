import sqlite3
import time
from flask import Flask, render_template, request, redirect, url_for, jsonify, Response
from flask_cors import CORS


app = Flask(__name__)
CORS(app)

# Path to your SQLite database file
DATABASE = "mydatabase.db"

# Global variable for switch state
# IS_SWITCH_ON = False

###########################################################
#                    HELPER FUNCTIONS                     #
###########################################################


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
    if STATUS = '0', the switch is OFF.
    """
    conn = get_db_connection()
    row = conn.execute("SELECT STATUS FROM SPECIAL LIMIT 1").fetchone()
    conn.close()
    if row:
        return row["STATUS"] == "1"  # True if '1', else False
    # If no row found, default to False/off
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
                "seat": f"Seat {row['SEAT_ID']}",  # Or a seat label if you have it
                "name": full_name.strip(),
                "meal": (
                    row["MAIN_FOOD_NAME"] if row["MAIN_FOOD_NAME"] else "Unknown Meal"
                ),
                "addons": addons_list,
                "given": is_given,
            }
        )
    return meals


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
        "DEPARTURE_DATE": flight["DEPARTURE_DATE"],
        "ARRIVAL_CITY": flight["ARRIVAL_CITY"],
        "ARRIVAL_CODE": flight["ARRIVAL_CODE"],
        "ARRIVAL_DATE": flight["ARRIVAL_DATE"]
    }
    
    return jsonify(flight)
    

    


###########################################################
#                    FLASK ROUTES                         #
###########################################################


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
    """
    conn = get_db_connection()
    conn.execute(
        "UPDATE ORDERS SET STATUS = 'delivered' WHERE ORDER_ID = ?", (meal_id,)
    )
    conn.commit()
    conn.close()
    return redirect(url_for("index"))


@app.route("/toggle_switch", methods=["POST"])
def toggle_switch():
    """
    Reads the checkbox from the form and updates the SPECIAL table's STATUS
    to '1' or '0'.
    """
    # The form includes <input type="checkbox" name="is_switch_on">,
    # so it's present if and only if the checkbox was checked.
    is_on = "is_switch_on" in request.form
    set_switch_state(is_on)
    return redirect(url_for("index"))


###########################################################
#               SEAT-SPECIFIC JSON ROUTE                  #
###########################################################


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

    # Build JSON
    seat_info = {
        "seat_id": seat_row["SEAT_ID"],
        "first_name": seat_row["FIRST_NAME"],
        "last_name": seat_row["LAST_NAME"],
        "child_seat": seat_row["CHILD_SEAT"],  # or convert to boolean
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


###########################################################
#         MOVIES & GAMES JSON (SIMPLE EXAMPLES)           #
###########################################################


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


@app.route("/events", methods=["GET"])
def sse_events():
    """
    SSE endpoint that streams the switch state whenever it changes.
    A naive approach: poll the DB every second, yield an event if changed.
    """

    def event_stream():
        last_status = get_switch_state()
        # Immediately send the current status on first connect:
        yield f"data: {last_status}\n\n"

        while True:
            time.sleep(1)  # Sleep 1 second between checks (tweak as needed)
            current_status = get_switch_state()
            if current_status != last_status:
                last_status = current_status
                # SSE sends events as: data: <some_string>\n\n
                yield f"data: {current_status}\n\n"

    return Response(event_stream(), mimetype="text/event-stream")


###########################################################
#                   MAIN ENTRY POINT                      #
###########################################################

if __name__ == "__main__":
    # Debug=True is convenient during development.
    # For production, use a real server (gunicorn, etc.) and debug=False.
    app.run(debug=True, host="0.0.0.0")
