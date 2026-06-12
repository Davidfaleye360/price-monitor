import os
import unittest
from unittest.mock import patch, MagicMock
import main
import database

# Mock HTML containing selectors matching the scraper
MOCK_HTML = """
<html>
    <body>
        <h1 id="productTitle">Premium Wireless Headphones</h1>
        <span class="price">$149.99</span>
    </body>
</html>
"""

class TestPriceMonitor(unittest.TestCase):
    @patch('requests.get')
    def test_pipeline_execution(self, mock_get):
        # 1. Setup mock HTTP response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.content = MOCK_HTML.encode('utf-8')
        mock_get.return_value = mock_response

        # 2. Configure mock environment variables
        os.environ["TARGET_PROD_URL"] = "https://mockstore.com/headphones"
        os.environ["PRICE_THRESHOLD"] = "199.99"
        
        # We omit email credentials to skip email dispatch, 
        # but the pipeline will still execute and log.
        if "ALERT_EMAIL_USER" in os.environ:
            del os.environ["ALERT_EMAIL_USER"]

        # Clean old test files if present
        if os.path.exists(database.DB_FILE):
            os.remove(database.DB_FILE)

        print("\n--- Running Pipeline Test ---")
        try:
            main.run_pipeline()
        except SystemExit as e:
            self.assertEqual(e.code, 0)

        # 3. Verify price history CSV was created and logged properly
        self.assertTrue(os.path.isfile(database.DB_FILE), "CSV file was not created.")
        with open(database.DB_FILE, "r", encoding="utf-8") as f:
            lines = f.readlines()
            print("\nLogged CSV Output:")
            for line in lines:
                print(f"  {line.strip()}")
            
            # Assert header and data row exist
            self.assertEqual(len(lines), 2)
            self.assertIn("Premium Wireless Headphones", lines[1])
            self.assertIn("149.9", lines[1])
            
        print("--- Test Successful! ---\n")

if __name__ == "__main__":
    unittest.main()
