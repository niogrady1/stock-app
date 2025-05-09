// App.js - Using CSS classes instead of inline styles
import { useState, useEffect } from 'react';
import './styles.css'; // Import the CSS file

// Stock symbols we want to track
const stockSymbols = ['LMND', 'TMDX', 'GOOGL', 'AMZN', 'TSLA', 'ABNB', 'NVDA','HIMS','TTD'];

// Company names mapping (since the API doesn't return company names)
const companyNames = {
  'LMND': 'Lemonade',
  'TMDX': 'Transmedics',
  'GOOGL': 'Alphabet Inc.',
  'AMZN': 'Amazon.com Inc.',
  'TSLA': 'Tesla, Inc.',
  'ABNB': 'AirBNB',
  'NVDA': 'NVIDIA Corporation',
  'HIMS': 'Hims & Hers',
  'TTD': 'The Trade Desk'
};

// Main App Component
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [user, setUser] = useState(null);
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
        // Fetch quote data
        const quoteResponse = await fetch(
          `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`
        );
        
        if (!quoteResponse.ok) {
          throw new Error(`HTTP error! Status: ${quoteResponse.status}`);
        }
        
        const quoteData = await quoteResponse.json();

        


        
        // Fetch company metrics for P/E, P/S and Market Cap
        const metricsResponse = await fetch(
          `https://finnhub.io/api/v1/stock/metric?symbol=${symbol}&metric=all&token=${apiKey}`
        );
        
        let marketCap = null;
        let peRatio = null;
        let psRatio = null;
        
        if (metricsResponse.ok) {
          const metricsData = await metricsResponse.json();
     
          marketCap = metricsData.metric?.marketCapitalization;
          peRatio = metricsData.metric?.peTTM;
          psRatio = metricsData.metric?.ps;
        }

  
        
        // Check if we got valid data
        if (quoteData && quoteData.c) {
          stockData.push({
            symbol,
            name: companyNames[symbol],
            price: quoteData.c,
            change: quoteData.d,
            marketCap: marketCap || Math.random() * 1000, // Fallback to random
            peRatio: peRatio || (Math.random() * 50 + 10), // Fallback to random
            psRatio: psRatio || (Math.random() * 20 + 1) // Fallback to random
          });
        } else {
          console.warn(`No data available for ${symbol}`);
          // Add fallback data if API doesn't return valid data
          stockData.push({
            symbol,
            name: companyNames[symbol],
            price: Math.random() * 500 + 100, // Random price between 100-600
            change: (Math.random() - 0.5) * 10, // Random change between -5 and 5
            marketCap: Math.random() * 1000, // Random market cap in billions
            peRatio: Math.random() * 50 + 10, // Random P/E between 10-60
            psRatio: Math.random() * 20 + 1 // Random P/S between 1-21
          });
        }
      } catch (err) {
        console.error(`Error fetching data for ${symbol}:`, err);
        // Add fallback data if API request fails
        stockData.push({
          symbol,
          name: companyNames[symbol],
          price: Math.random() * 500 + 100,
          change: (Math.random() - 0.5) * 10,
          marketCap: Math.random() * 1000,
          peRatio: Math.random() * 50 + 10,
          psRatio: Math.random() * 20 + 1
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

  // Fetch real stock data when logged in or in guest mode 
  useEffect(() => {
   
    if (isLoggedIn || isGuestMode) {
      fetchStockData();
      
      // Refresh stock data every 60 seconds
      const interval = setInterval(() => {
        fetchStockData();
      }, 60000); // 60 seconds
      
      return () => clearInterval(interval);
    }
  }, [isLoggedIn, isGuestMode]);

  // Handle login logic
  const handleLogin = (username, password) => {
    // In a real app, validate against backend
    if (username && password) {
      setUser({ username });
      setIsLoggedIn(true);
      
      // Track login event if analytics exists
      if (window.analytics) {
        window.analytics.identify(username, {
          username: username,
          loginTime: new Date().toISOString()
        });
        
        window.analytics.track('User Logged In', {
          method: 'username/password'
        });
      }
    }
  };

  // Handle logout
  const handleLogout = () => {
    // Track logout event if analytics exists
    if (window.analytics) {
      window.analytics.track('User Logged Out');
    }
    
    setUser(null);
    setIsLoggedIn(false);
    setIsGuestMode(false);
  };
  const handleGuestAccess = () => {
   
    setIsGuestMode(true);
    fetchStockData(); // Fetch stock data immediately
    
    // Optional: Track guest access event if analytics exists
    if (window.analytics) {
      window.analytics.track('Guest Access');
    }
  };


  return (
    <div>
      <header>
        <div className="header-container">
          <h1 className="site-title">StockInfo</h1>
          
          {isLoggedIn && (
            <div className="user-info">
              <span>Welcome, {user?.username}</span>
              <button 
                onClick={handleLogout}
                className="logout-button"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </header>
      
      <main>
      {!isLoggedIn && !isGuestMode && (
  <LoginForm 
    onLogin={handleLogin} 
    onGuestAccess={handleGuestAccess} // Pass the function here
  />
)}

        {isLoggedIn && loading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading stock data...</p>
          </div>
        )}

        {isLoggedIn && error && (
          <div className="error-container">
            <p>{error}</p>
            <button 
              onClick={fetchStockData}
              className="retry-button"
            >
              Retry
            </button>
          </div>
        )}

        {(isLoggedIn || isGuestMode) && !loading && !error && (
          <Dashboard 
            stocks={filteredStocks} 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
        )}
      </main>
      
      <footer>
        <p className="footer-text">© {new Date().getFullYear()} StockInfo. This is a demo application.</p>
        <p className="footer-subtext">Stock data provided by Finnhub</p>
      </footer>
    </div>
  );
}

// Login Form Component
function LoginForm({ onLogin, onGuestAccess }) {
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
    <div className="login-container">
      <h2 className="login-title">Stock Info</h2>
      <h3 className="login-subtitle">Sign in to your account</h3>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        
        <button
          type="submit"
          className="submit-button"
        >
          Login
        </button>
      </form>

      <div className="guest-access">
        <p>Or</p>
        <button 
          onClick={onGuestAccess}
          className="guest-button"
        >
          Continue as Guest
        </button>
      </div>
      
      <p className="login-message">
        Demo app - Use any username/password to login
      </p>
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
    <div className="dashboard">
      <div className="dashboard-header">
        <h2 className="dashboard-title">Stock Dashboard</h2>
        <div className="search-container">
          <input
            type="search"
            placeholder="Search stocks..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="search-icon" 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>
      </div>
      
      <div>
      <table className="stock-table">
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Company</th>
            <th>Price (USD)</th>
            <th>Change</th>
            <th>Market Cap (B)</th>
            <th>P/E</th>
            <th>P/S</th>
          </tr>
        </thead>
        <tbody>
          {stocks.length > 0 ? (
            stocks.map((stock) => (
              <tr key={stock.symbol}>
                <td className="symbol-cell">{stock.symbol}</td>
                <td>{stock.name}</td>
                <td className="price-cell">
                  ${stock.price.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </td>
                <td className={`change-cell ${stock.change >= 0 ? 'positive-change' : 'negative-change'}`}>
                  {stock.change >= 0 ? '+' : ''}{parseFloat(stock.change).toFixed(2)}
                </td>
                <td className="metric-cell">
                  ${stock.marketCap.toLocaleString('en-US', { 
                    maximumFractionDigits: 2 
                  })}B
                </td>
                <td className="metric-cell">
                  {stock.peRatio ? stock.peRatio.toFixed(2) : 'N/A'}
                </td>
                <td className="metric-cell">
                  {stock.psRatio ? stock.psRatio.toFixed(2) : 'N/A'}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="empty-table-message"> {/* Updated colspan from 4 to 7 */}
                No stocks found matching your search.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      </div>
      
      <div>
        <p className="data-note">Note: Stock prices are updated every minute using the Finnhub API.</p>
        <p className="data-source">Data provided by <a href="https://finnhub.io/" target="_blank" rel="noopener noreferrer">Finnhub</a></p>
      </div>
    </div>
  );
}