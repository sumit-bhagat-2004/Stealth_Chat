export default function SearchResultsView({ searchTerm, onGoHome }) {
    return (
        <div className="bg-gray-100 min-h-screen">
            <header className="bg-white shadow-md sticky top-0 z-50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex-shrink-0 cursor-pointer" onClick={onGoHome}>
                            <img className="h-8 w-auto" src="https://static-assets-web.flixcart.com/batman-returns/batman-returns/p/images/logo-FmHeBw.svg" alt="Go Home" />
                        </div>
                        <div className="flex-1 max-w-2xl mx-4">
                            <p className="text-center text-gray-600">This is a mock search results page.</p>
                        </div>
                        <div className="hidden md:flex items-center space-x-8 text-transparent">
                            <span className="font-medium">Become a Seller</span>
                        </div>
                    </div>
                </div>
            </header>
            <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                <div className="bg-white p-4 rounded-lg shadow">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">
                        Search Results for "<span className="text-blue-600">{searchTerm}</span>"
                    </h2>
                    <p className="text-gray-600">
                        This is a simulated search result page. The primary function of this app is hidden.
                        Try a different "search" term on the homepage.
                    </p>
                </div>
            </main>
        </div>
    );
}
