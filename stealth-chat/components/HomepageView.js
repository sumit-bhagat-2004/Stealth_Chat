import { useState, useEffect } from 'react';
import { FLIPKART_CATEGORIES, FLIPKART_SAMPLE_PRODUCTS } from '../utils/constants';

export default function HomepageView({ onSearch, onHiddenAccess }) {
  const [inputValue, setInputValue] = useState('');
  const [currentProducts, setCurrentProducts] = useState([]);
  const [logoClickCount, setLogoClickCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [bannerLoaded, setBannerLoaded] = useState(false);
  const [categoryImagesLoaded, setCategoryImagesLoaded] = useState({});

  useEffect(() => {
    // Load products on mount and handle initial loading state
    setCurrentProducts(FLIPKART_SAMPLE_PRODUCTS);
    
    // Preload logo to prevent flickering
    const logoImg = new Image();
    logoImg.onload = () => setLogoLoaded(true);
    logoImg.onerror = () => setLogoLoaded(false);
    logoImg.src = "https://static-assets-web.flixcart.com/batman-returns/batman-returns/p/images/fkheaderlogo_exploreplus-44005d.svg";
    
    // Preload banner image
    const bannerImg = new Image();
    bannerImg.onload = () => setBannerLoaded(true);
    bannerImg.onerror = () => setBannerLoaded(false);
    bannerImg.src = "https://rukminim1.flixcart.com/fk-p-flap/1600/270/image/9124d3a021358c96.jpg";
    
    // Preload category images
    FLIPKART_CATEGORIES.forEach((category, index) => {
      const categoryImg = new Image();
      categoryImg.onload = () => {
        setCategoryImagesLoaded(prev => ({ ...prev, [index]: true }));
      };
      categoryImg.onerror = () => {
        setCategoryImagesLoaded(prev => ({ ...prev, [index]: false }));
      };
      categoryImg.src = category.img;
    });
    
    // Simulate initial load completion to prevent ghost texts
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300); // Increased timeout to allow image preloading

    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSearch(inputValue.trim());
      setInputValue('');
    }
  };

  const handleLogoClick = () => {
    setLogoClickCount(prev => {
      const newCount = prev + 1;
      if (newCount >= 5) {
        onHiddenAccess();
        return 0;
      }
      return newCount;
    });
  };

  // Prevent flash of unstyled content during initial load
  if (isLoading) {
    return (
      <div className="bg-gray-100 min-h-screen">
        <div className="animate-pulse">
          <div className="bg-flipkart-blue h-14"></div>
          <div className="h-32 bg-gray-200"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        {/* Top Blue Bar */}
        <div className="bg-flipkart-blue text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14">
              {/* Logo Section */}
              <div className="flex items-center cursor-pointer" onClick={handleLogoClick}>
                {/* Use local fallback instead of external image to prevent loading flicker */}
                <div className="h-5 mr-2 flex items-center">
                  {logoLoaded ? (
                    <img 
                      className="h-5" 
                      src="https://static-assets-web.flixcart.com/batman-returns/batman-returns/p/images/fkheaderlogo_exploreplus-44005d.svg" 
                      alt="Flipkart"
                      onLoad={() => setLogoLoaded(true)}
                      onError={() => setLogoLoaded(false)}
                    />
                  ) : (
                    <div className="h-5 w-20 bg-white rounded flex items-center justify-center">
                      <span className="text-flipkart-blue font-bold text-sm">Flipkart</span>
                    </div>
                  )}
                </div>
                <div className="hidden sm:block">
                  <p className="text-xs italic text-yellow-300">
                    Explore <span className="text-yellow-400">Plus</span>
                  </p>
                </div>
              </div>

              {/* Search Bar - Desktop */}
              <div className="hidden md:flex flex-1 max-w-2xl mx-8">
                <form onSubmit={handleSubmit} className="relative w-full">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Search for products, brands and more"
                    className="w-full px-4 py-2.5 text-sm text-gray-900 bg-white border-0 rounded-sm focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="absolute right-0 top-0 h-full px-4 bg-yellow-400 hover:bg-yellow-500 rounded-r-sm"
                  >
                    <svg className="w-4 h-4 text-blue-900" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </button>
                </form>
              </div>

              {/* Right Section */}
              <div className="flex items-center space-x-6">
                {/* Login Button */}
                <button className="bg-white text-flipkart-blue px-6 py-2 text-sm font-semibold hover:bg-gray-50 hover:shadow-md transition-all rounded border border-gray-200">
                  Login
                </button>

                {/* More Menu */}
                <div className="relative">
                  <button className="text-white text-sm font-medium hover:text-flipkart-yellow transition-colors flex items-center">
                    More 
                    <svg className="w-3 h-3 ml-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>

                {/* Cart */}
                <div className="flex items-center cursor-pointer text-white hover:text-flipkart-yellow transition-colors">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                  </svg>
                  <span className="text-sm font-medium">Cart</span>
                </div>

                {/* Mobile Menu Button */}
                <button 
                  className="md:hidden text-white"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden bg-white px-4 py-3 border-b">
          <form onSubmit={handleSubmit} className="relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Search for products, brands and more"
              className="w-full px-4 py-2.5 text-sm text-gray-900 bg-gray-100 border-0 rounded-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="absolute right-2 top-2 p-1.5 text-gray-500 hover:text-flipkart-blue"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </button>
          </form>
        </div>
      </header>

      {/* Categories Section */}
      <section className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between overflow-x-auto scrollbar-hide space-x-8 pb-2">
            {FLIPKART_CATEGORIES.map((category, index) => (
              <div
                key={category.name}
                className="flex-shrink-0 text-center cursor-pointer group"
                onClick={() => onSearch(category.name)}
              >
                <div className="w-16 h-16 mx-auto mb-2 group-hover:scale-110 transition-transform duration-200 bg-gray-100 rounded-lg flex items-center justify-center">
                  {categoryImagesLoaded[index] === false ? (
                    // Error state - show placeholder
                    <div className="w-8 h-8 bg-flipkart-blue rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {category.name.charAt(0)}
                    </div>
                  ) : categoryImagesLoaded[index] === true ? (
                    // Loaded state - show actual image
                    <img
                      src={category.img}
                      alt={category.name}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.target.src = `https://via.placeholder.com/64/3B82F6/FFFFFF?text=${category.name.charAt(0)}`;
                        setCategoryImagesLoaded(prev => ({ ...prev, [index]: false }));
                      }}
                    />
                  ) : (
                    // Loading state - show shimmer
                    <div className="w-full h-full bg-gray-200 animate-pulse rounded"></div>
                  )}
                </div>
                <p className="text-xs font-medium text-gray-700 group-hover:text-flipkart-blue transition-colors">
                  {category.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Banner Section */}
      <section className="bg-white mt-2">
        <div className="max-w-7xl mx-auto">
          <div className="relative h-48 sm:h-64 lg:h-80 overflow-hidden bg-gray-200">
            {bannerLoaded ? (
              <img
                src="https://rukminim1.flixcart.com/fk-p-flap/1600/270/image/9124d3a021358c96.jpg"
                alt="Banner"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/1600x270/2874F0/FFFFFF?text=Flipkart+Banner";
                }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-flipkart-blue to-flipkart-blue-dark flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="animate-pulse">
                    <div className="h-8 w-48 bg-white bg-opacity-20 rounded mx-auto mb-2"></div>
                    <div className="h-4 w-32 bg-white bg-opacity-20 rounded mx-auto"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Best Deals Section */}
      <section className="bg-white mt-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Best Deals for You</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="hidden sm:inline">Live</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {currentProducts.map((product, index) => (
              <div
                key={`${product.name}-${index}`}
                className="bg-white rounded-lg border hover:shadow-lg transition-all duration-200 cursor-pointer group overflow-hidden"
                onClick={() => onSearch(product.name)}
              >
                <div className="relative aspect-square bg-gray-50 p-2">
                  <img
                    src={product.img}
                    alt={product.name}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                    onError={(e) => {
                      e.target.src = `https://via.placeholder.com/300x300/E5E7EB/6B7280?text=${encodeURIComponent(product.name.split(' ')[0])}`;
                    }}
                  />
                  {product.discount && (
                    <div className="absolute top-2 left-2 bg-flipkart-green text-white text-xs px-1.5 py-0.5 rounded">
                      {product.discount}
                    </div>
                  )}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-5 h-5 text-gray-400 hover:text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                
                <div className="p-3">
                  <h3 className="text-sm font-medium text-gray-800 line-clamp-2 mb-2 group-hover:text-flipkart-blue transition-colors leading-tight">
                    {product.name}
                  </h3>
                  
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-lg font-bold text-gray-900">{product.price}</span>
                    {product.original && (
                      <span className="text-sm text-gray-500 line-through">{product.original}</span>
                    )}
                  </div>
                  
                  {product.rating && (
                    <div className="flex items-center space-x-1 mb-1">
                      <div className="flex items-center bg-flipkart-green text-white text-xs px-1.5 py-0.5 rounded">
                        <span>{product.rating}</span>
                        <svg className="w-3 h-3 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                        </svg>
                      </div>
                      {product.reviews && (
                        <span className="text-xs text-gray-500">({product.reviews})</span>
                      )}
                    </div>
                  )}
                  
                  <p className="text-xs text-flipkart-green font-medium">Free delivery</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Section */}
      <section className="bg-white mt-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">Trending Searches</h2>
          <div className="flex flex-wrap gap-2">
            {['iPhone 15', 'Samsung Galaxy', 'Laptop', 'Headphones', 'Smart Watch', 'Shoes', 'Clothing', 'Books'].map((term) => (
              <button
                key={term}
                onClick={() => onSearch(term)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-full transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold mb-4">ABOUT</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">About Us</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">HELP</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><a href="#" className="hover:text-white">Payments</a></li>
                <li><a href="#" className="hover:text-white">Shipping</a></li>
                <li><a href="#" className="hover:text-white">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">POLICY</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><a href="#" className="hover:text-white">Return Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms Of Use</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">SOCIAL</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><a href="#" className="hover:text-white">Facebook</a></li>
                <li><a href="#" className="hover:text-white">Twitter</a></li>
                <li><a href="#" className="hover:text-white">YouTube</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2007-2025 Flipkart.com</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
