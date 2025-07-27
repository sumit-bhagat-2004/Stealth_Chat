import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { q: query } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    // Simulate Flipkart search results
    // In a real implementation, you might scrape Flipkart or use their API
    const mockResults = await simulateFlipkartSearch(query);

    res.status(200).json({
      success: true,
      query,
      results: mockResults
    });
  } catch (error) {
    console.error('Flipkart search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
}

// Simulate Flipkart search results
const simulateFlipkartSearch = async (query) => {
  const categories = [
    'Electronics', 'Clothing', 'Home & Kitchen', 'Books', 'Sports',
    'Beauty', 'Automotive', 'Toys', 'Health', 'Grocery'
  ];

  const brands = [
    'Samsung', 'Apple', 'Mi', 'OnePlus', 'Sony', 'LG', 'HP', 'Dell',
    'Nike', 'Adidas', 'Puma', 'Levi\'s', 'Zara', 'H&M'
  ];

  const results = [];
  const numResults = Math.floor(Math.random() * 20) + 10; // 10-30 results

  for (let i = 0; i < numResults; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const brand = brands[Math.floor(Math.random() * brands.length)];
    const price = Math.floor(Math.random() * 50000) + 500;
    const originalPrice = price + Math.floor(Math.random() * 10000) + 1000;
    const discount = Math.floor(((originalPrice - price) / originalPrice) * 100);

    results.push({
      id: `product_${i + 1}`,
      title: `${brand} ${query} ${category}`,
      price: `₹${price.toLocaleString()}`,
      originalPrice: `₹${originalPrice.toLocaleString()}`,
      discount: `${discount}% off`,
      rating: (Math.random() * 2 + 3).toFixed(1), // 3.0 - 5.0
      reviews: Math.floor(Math.random() * 10000) + 100,
      image: `https://via.placeholder.com/300x400/${Math.floor(Math.random()*16777215).toString(16)}/FFFFFF?text=${encodeURIComponent(brand)}`,
      delivery: Math.random() > 0.5 ? 'Free Delivery' : 'Fast Delivery',
      seller: `${brand} Official Store`,
      features: [
        `${query} compatible`,
        'High quality',
        '1 year warranty',
        'Easy returns'
      ]
    });
  }

  return results;
};

// Real Flipkart scraping function (use with caution - respect robots.txt)
const scrapeFlipkartSearch = async (query) => {
  try {
    const searchUrl = `https://www.flipkart.com/search?q=${encodeURIComponent(query)}`;
    
    // Note: This would require proper headers and may be blocked
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch search results');
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const results = [];

    // Extract product information (selectors may change)
    $('._1AtVbE').each((index, element) => {
      const $element = $(element);
      const title = $element.find('._4rR01T').text().trim();
      const price = $element.find('._30jeq3').text().trim();
      const originalPrice = $element.find('._3I9_wc').text().trim();
      const discount = $element.find('._3Ay6Sb').text().trim();
      const rating = $element.find('._3LWZlK').text().trim();
      const reviews = $element.find('._2_R_DZ').text().trim();
      const image = $element.find('._396cs4 img').attr('src');

      if (title && price) {
        results.push({
          title,
          price,
          originalPrice: originalPrice || null,
          discount: discount || null,
          rating: rating || null,
          reviews: reviews || null,
          image: image || null
        });
      }
    });

    return results;
  } catch (error) {
    console.error('Scraping error:', error);
    // Fallback to mock data
    return simulateFlipkartSearch(query);
  }
};
