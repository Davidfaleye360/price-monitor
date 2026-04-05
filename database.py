import csv
import os
from datetime import datetime

DB_FILE = "price_history.csv"

def log_price(product_title, price):
    """Logs scraped price trends into a CSV file with a timestamp."""
    file_exists = os.path.isfile(DB_FILE)

    try:
        with open(DB_FILE, mode="a", newline="", encoding="utf-8") as file:
            writer = csv.writer(file)
            if not file_exists:
                writer.writerow(["Timestamp", "Product Title", "Price"])

            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            writer.writerow([timestamp, product_title, price])
            print(f"Successfully logged: ${price} at {timestamp}")
    except IOError as e:
        print(f"Database Logging Error: {e}")
