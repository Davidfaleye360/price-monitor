import requests
from bs4 import BeautifulSoup

def fetch_product_data(url):
    """Fetches raw HTML and extracts product title and price."""
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, "html.parser")

        # Placeholder selectors - to be adjusted per target site
        title_element = soup.find(id="productTitle") or soup.find("h1")
        price_element = soup.find(class_="a-price-whole") or soup.find(class_="price")

        if not title_element or not price_element:
            raise ValueError("Could not parse title or price from target elements.")

        title = title_element.get_text().strip()
        price_raw = price_element.get_text().strip()

        # Sanitize price string to float
        price = float(price_raw.replace("$", "").replace(",", ""))
        return {"title": title, "price": price}
    except Exception as e:
        print(f"Scraping Error: {e}")
        return None

if __name__ == "__main__":
    # Test with a dummy test market or log statement
    print("Scraper module initialized.")
