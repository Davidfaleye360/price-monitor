import os
import sys
from scraper import fetch_product_data
from database import log_price
from notifier import send_price_alert

# Hardcoded fallback target configurations for showcase purposes
TARGET_URL = os.environ.get("TARGET_PROD_URL", "https://example.com/product")
PRICE_THRESHOLD = float(os.environ.get("PRICE_THRESHOLD", "199.99"))

def run_pipeline():
    print("Starting automated system check...")
    data = fetch_product_data(TARGET_URL)

    if not data:
        print("Execution halted: Parsing failed.")
        sys.exit(1)

    title = data["title"]
    price = data["price"]

    # Persist data
    log_price(title, price)

    # Evaluate thresholds
    if price <= PRICE_THRESHOLD:
        print(f"Target matching triggered! ${price} <= ${PRICE_THRESHOLD}")
        send_price_alert(title, price, PRICE_THRESHOLD, TARGET_URL)
    else:
        print(f"Analysis complete. Current price (${price}) remains above boundary.")

if __name__ == "__main__":
    run_pipeline()
