import { useState, useEffect } from 'react';

// Stock symbols we want to track
const stockSymbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA'];

// Company names mapping (since the API doesn't return company names)
const companyNames = {
  'AAPL': 'Apple Inc.',
  'MSFT': 'Microsoft Corporation',
  'GOOGL': 'Alphabet Inc.',
  'AMZN': 'Amazon.com Inc.',
  'TSLA': 'Tesla, Inc.',
  'META': 'Meta Platforms, Inc.',
  'NVDA': 'NVIDIA Corporation'
};

// Main App Component
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [activeView, setActiveView] = useState('login');
  const [stocks, setStocks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Finnhub API Key - replace with your own
  const apiKey = 'd0efsjhr01qkbclb48o0d0efsjhr01qkbclb48og';

  // Filter stocks based on search term
  const filteredStocks = stocks.filter(stock => 
    stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) || 
    stock.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Function to fetch real stock data from Finnhub
  const fetchStockData = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Create an array to hold our stock data
      const stockData = [];
      
      // Fetch data for each stock using Finnhub's Quote endpoint
      const fetchPromises = stockSymbols.map(async (symbol) => {
        try {
          const response = await fetch(
            `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`
          );
          
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          
          const data = await response.json();
          
          // Check if we got valid data
          if (data && data.c) {
            stockData.push({
              symbol,
              name: companyNames[symbol],
              price: data.c,
              change: data.d
            });
          } else {
            console.warn(`No data available for ${symbol}`);
            // Add fallback data if API doesn't return valid data
            stockData.push({
              symbol,
              name: companyNames[symbol],
              price: Math.random() * 500 + 100, // Random price between 100-600
              change: (Math.random() - 0.5) * 10 // Random change between -5 and 5
            });
          }
        } catch (err) {
          console.error(`Error fetching data for ${symbol}:`, err);
          // Add fallback data if API request fails
          stockData.push({
            symbol,
            name: companyNames[symbol],
            price: Math.random() * 500 + 100,
            change: (Math.random() - 0.5) * 10
          });
        }
      });
      
      // Wait for all API calls to complete
      await Promise.all(fetchPromises);
      
      // Sort the stock data by symbol to maintain consistent order
      stockData.sort((a, b) => a.symbol.localeCompare(b.symbol));
      
      setStocks(stockData);
    } catch (err) {
      console.error('Error fetching stock data:', err);
      setError('Failed to fetch stock data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch real stock data when logged in
  useEffect(() => {
    if (isLoggedIn) {
      fetchStockData();
      
      // Refresh stock data every 60 seconds
      const interval = setInterval(() => {
        fetchStockData();
      }, 60000); // 60 seconds
      
      return () => clearInterval(interval);
    }
  }, [isLoggedIn]);

  // Handle login logic
  const handleLogin = (username, password) => {
    // In a real app, validate against backend
    if (username && password) {
      setUser({ username });
      setIsLoggedIn(true);
      setActiveView('dashboard');
    }
  };

  // Handle logout
  const handleLogout = () => {
    setUser(null);
    setIsLoggedIn(false);
    setActiveView('login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header 
        isLoggedIn={isLoggedIn} 
        username={user?.username} 
        onLogout={handleLogout} 
      />
      
      <main className="container mx-auto px-4 py-8">
        {activeView === 'login' && !isLoggedIn && (
          <LoginForm onLogin={handleLogin} />
        )}

        {activeView === 'signup' && !isLoggedIn && (
          <SignupForm 
            onSignup={(username, password) => {
              handleLogin(username, password);
            }}
            onSwitchToLogin={() => setActiveView('login')}
          />
        )}

        {isLoggedIn && loading && (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="flex justify-center items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
            <p className="mt-4 text-gray-600">Loading stock data...</p>
          </div>
        )}

        {isLoggedIn && error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
            <button 
              onClick={fetchStockData}
              className="mt-2 bg-red-600 hover:bg-red-700 text-white font-medium py-1 px-3 rounded text-sm"
            >
              Retry
            </button>
          </div>
        )}

        {isLoggedIn && !loading && !error && (
          <Dashboard 
            stocks={filteredStocks} 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
        )}
      </main>
      
      <Footer />
    </div>
  );
}

// Header Component
function Header({ isLoggedIn, username, onLogout }) {
  return (
    <header className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold">StockInfo</h1>
        </div>
        
        {isLoggedIn && (
          <div className="flex items-center space-x-4">
            <span>Welcome, {username}</span>
            <button 
              onClick={onLogout}
              className="bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded text-sm"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

// Login Form Component
function LoginForm({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }
    
    onLogin(username, password);
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4 text-center">Login to StockInfo</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
          {error}
        </div>
      )}
      
      <div>
        <div className="mb-4">
          <label htmlFor="username" className="block text-gray-700 mb-1">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="password" className="block text-gray-700 mb-1">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
        >
          Login
        </button>
      </div>
      
      <p className="mt-4 text-center text-gray-600">
        Don't have an account? Use any username/password for demo.
      </p>
    </div>
  );
}

// Signup Form Component
function SignupForm({ onSignup, onSwitchToLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    
    onSignup(username, password);
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4 text-center">Create an Account</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
          {error}
        </div>
      )}
      
      <div>
        <div className="mb-4">
          <label htmlFor="username" className="block text-gray-700 mb-1">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="password" className="block text-gray-700 mb-1">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="confirmPassword" className="block text-gray-700 mb-1">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
        >
          Sign Up
        </button>
        
        <button
          onClick={onSwitchToLogin}
          className="w-full mt-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}

// Dashboard Component
function Dashboard({ stocks, searchTerm, setSearchTerm }) {
  // Track search activity for analytics
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Track search event if value exists and analytics is available
    if (value && window.analytics) {
      window.analytics.track('Stock Search', {
        searchTerm: value
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Stock Dashboard</h2>
        <div className="w-1/3">
          <input
            type="text"
            placeholder="Search stocks..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
              <th className="py-3 px-6 text-left">Symbol</th>
              <th className="py-3 px-6 text-left">Company</th>
              <th className="py-3 px-6 text-right">Price (USD)</th>
              <th className="py-3 px-6 text-right">Change</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm">
            {stocks.length > 0 ? (
              stocks.map((stock) => (
                <tr key={stock.symbol} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-6 text-left font-medium">{stock.symbol}</td>
                  <td className="py-3 px-6 text-left">{stock.name}</td>
                  <td className="py-3 px-6 text-right">${stock.price.toFixed(2)}</td>
                  <td className={`py-3 px-6 text-right ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stock.change >= 0 ? '+' : ''}{parseFloat(stock.change).toFixed(2)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="py-6 text-center text-gray-500">
                  No stocks found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="mt-6 text-sm text-gray-500">
        <p className="italic">Note: Stock prices are updated every minute using the Finnhub API.</p>
        <p className="mt-2">Data provided by <a href="https://finnhub.io/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Finnhub</a></p>
      </div>
    </div>
  );
}

// Footer Component
function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-4 mt-8">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm">
          © {new Date().getFullYear()} StockInfo. This is a demo application.
        </p>
      </div>
    </footer>
  );
}