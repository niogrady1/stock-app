import { useState, useEffect } from 'react';

// Mock stock data (replace with real API in production)
const mockStocks = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 178.72, change: +1.23 },
  { symbol: 'MSFT', name: 'Microsoft Corporation', price: 329.56, change: -0.87 },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 141.18, change: +0.53 },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 178.15, change: -1.05 },
  { symbol: 'TSLA', name: 'Tesla, Inc.', price: 194.05, change: +3.21 },
  { symbol: 'META', name: 'Meta Platforms, Inc.', price: 474.32, change: +2.16 },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', price: 924.79, change: +10.25 },
];

// Main App Component
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [activeView, setActiveView] = useState('login');
  const [stocks, setStocks] = useState(mockStocks);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter stocks based on search term
  const filteredStocks = stocks.filter(stock => 
    stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) || 
    stock.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Simulates updating stock prices
  useEffect(() => {
    if (isLoggedIn) {
      const interval = setInterval(() => {
        setStocks(prevStocks => 
          prevStocks.map(stock => ({
            ...stock,
            price: parseFloat((stock.price + (Math.random() - 0.5) * 0.5).toFixed(2)),
            change: parseFloat((Math.random() - 0.5) * 2).toFixed(2)
          }))
        );
      }, 5000);
      
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

        {isLoggedIn && (
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
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Stock Dashboard</h2>
        <div className="w-1/3">
          <input
            type="text"
            placeholder="Search stocks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
        <p className="italic">Note: Stock prices are simulated and updated every 5 seconds. In a production environment, replace with real-time API data.</p>
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