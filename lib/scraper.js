export async function scrapeProductData(url) {
  try {
    // Construct Microlink API URL with custom data extraction rules for price
    // We try multiple common selectors for price and fall back to standard metadata
    const queryParams = new URLSearchParams({
      url: url,
      'data.price.selector': '.a-price-whole, .price, [itemprop="price"], meta[property="og:price:amount"], .price-value, #priceblock_ourprice, .product-price, .current-price',
      'data.price.type': 'text'
    });

    const apiUrl = `https://api.microlink.io?${queryParams.toString()}`;
    const headers = {};

    if (process.env.MICROLINK_API_KEY) {
      headers['x-api-key'] = process.env.MICROLINK_API_KEY;
    }

    const response = await fetch(apiUrl, { headers, timeout: 15000 });
    if (!response.ok) {
      throw new Error(`Microlink API responded with status ${response.status}`);
    }

    const json = await response.json();
    if (json.status !== 'success') {
      throw new Error(json.message || 'Failed to extract metadata.');
    }

    const data = json.data;
    const title = data.title || 'Unknown Product';
    const imageUrl = data.image?.url || null;
    
    // Parse and sanitize the price
    let price = null;
    if (data.price) {
      // Clean non-numeric characters except decimals
      const cleaned = data.price.replace(/[^0-9.]/g, '');
      const parsed = parseFloat(cleaned);
      if (!isNaN(parsed)) {
        price = parsed;
      }
    }

    // Fallback: if custom price selector failed, try extracting from standard description
    if (price === null && data.description) {
      const match = data.description.match(/\$[0-9]+(?:\.[0-9]{2})?/);
      if (match) {
        price = parseFloat(match[0].replace('$', ''));
      }
    }

    // Default fallback to 0.0 if not found, to keep database record valid
    if (price === null) {
      price = 0.0;
    }

    return {
      title,
      imageUrl,
      price
    };
  } catch (error) {
    console.error('Scraping Helper Error:', error);
    return null;
  }
}
