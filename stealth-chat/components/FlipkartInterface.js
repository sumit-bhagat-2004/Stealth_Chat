import { useState, useEffect } from 'react';

export default function FlipkartInterface({ searchQuery, onBackToHome }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchProducts();
  }, [searchQuery, currentPage]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/flipkart/search?q=${encodeURIComponent(searchQuery)}&page=${currentPage}`);
      const data = await response.json();
      
      if (data.success) {
        setProducts(data.results);
        setTotalPages(Math.ceil(data.results.length / 12)); // Simulate pagination
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (product) => {
    // Open in new tab to maintain stealth
    window.open(`https://www.flipkart.com/search?q=${encodeURIComponent(product.title)}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-flipkart-grey">
        <FlipkartHeader searchQuery={searchQuery} onBackToHome={onBackToHome} />
        <div className="flex justify-center items-center h-96">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 border-4 border-flipkart-blue border-t-transparent rounded-full animate-spin"></div>
            <span className="text-lg">Loading products...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-flipkart-grey">
      <FlipkartHeader searchQuery={searchQuery} onBackToHome={onBackToHome} />
      
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <p className="text-lg">
            Showing results for <span className="font-semibold">"{searchQuery}"</span>
          </p>
          <p className="text-sm text-gray-600">{products.length} products found</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {products.map((product, index) => (
            <div
              key={product.id}
              onClick={() => handleProductClick(product)}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer overflow-hidden animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="aspect-square relative">
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {product.discount && (
                  <div className="absolute top-2 left-2 bg-flipkart-green text-white text-xs px-2 py-1 rounded">
                    {product.discount}
                  </div>
                )}
              </div>
              
              <div className="p-3">
                <h3 className="text-sm font-medium text-gray-800 line-clamp-2 mb-2">
                  {product.title}
                </h3>
                
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg font-bold text-gray-900">{product.price}</span>
                  {product.originalPrice && (
                    <span className="text-sm text-gray-500 line-through">{product.originalPrice}</span>
                  )}
                </div>
                
                {product.rating && (
                  <div className="flex items-center gap-1 mb-2">
                    <div className="flex items-center bg-flipkart-green text-white px-2 py-1 rounded text-xs">
                      <span>{product.rating}</span>
                      <svg className="w-3 h-3 ml-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                      </svg>
                    </div>
                    <span className="text-xs text-gray-500">({product.reviews})</span>
                  </div>
                )}
                
                <p className="text-xs text-flipkart-green font-medium">{product.delivery}</p>
              </div>
            </div>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">No products found</h3>
            <p className="text-gray-600">Try searching with different keywords</p>
          </div>
        )}
      </div>
    </div>
  );
}

function FlipkartHeader({ searchQuery, onBackToHome }) {
  const [inputValue, setInputValue] = useState(searchQuery);

  const handleSearch = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      window.location.href = `/?q=${encodeURIComponent(inputValue.trim())}`;
    }
  };

  return (
    <header className="bg-flipkart-blue text-white sticky top-0 z-50 px-4 py-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBackToHome}
            className="text-white hover:text-gray-200 transition-colors"
            title="Back to homepage"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <img 
            className="h-7" 
            src="https://static-assets-web.flixcart.com/batman-returns/batman-returns/p/images/fkheaderlogo_exploreplus-44005d.svg" 
            alt="Flipkart" 
          />
        </div>

        <form onSubmit={handleSearch} className="flex-grow max-w-2xl">
          <div className="relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Search for products, brands and more"
              className="w-full px-4 py-2 text-gray-900 bg-white rounded-sm focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button
              type="submit"
              className="absolute right-0 top-0 h-full px-4 bg-flipkart-yellow text-flipkart-blue rounded-r-sm hover:bg-yellow-400 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </form>

        <div className="flex items-center gap-4">
          <button className="text-white hover:text-gray-200 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </button>
          <button className="text-white hover:text-gray-200 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5M17 13l2.5 5" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
