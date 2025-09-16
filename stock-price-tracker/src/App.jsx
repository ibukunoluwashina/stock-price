import { useState, useEffect } from "react";

function StockRow({ ticker, onRemove }) {
  const [stockData, setStockData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStockPrice = async () => {
      try {
        setLoading(true);
        // I USED Mock data for development (since API has 25 requests/day limit
        const mockData = {
          AAPL: {
            symbol: "AAPL",
            price: "175.43",
            change: "2.15",
            changePercent: "1.24",
          },
          GOOGL: {
            symbol: "GOOGL",
            price: "142.56",
            change: "-1.23",
            changePercent: "-0.86",
          },
          MSFT: {
            symbol: "MSFT",
            price: "378.85",
            change: "3.42",
            changePercent: "0.91",
          },
          TSLA: {
            symbol: "TSLA",
            price: "248.50",
            change: "-5.20",
            changePercent: "-2.05",
          },
          AMZN: {
            symbol: "AMZN",
            price: "155.20",
            change: "1.85",
            changePercent: "1.21",
          },
          NVDA: {
            symbol: "NVDA",
            price: "875.30",
            change: "12.45",
            changePercent: "1.44",
          },
          META: {
            symbol: "META",
            price: "485.20",
            change: "-2.10",
            changePercent: "-0.43",
          },
          NFLX: {
            symbol: "NFLX",
            price: "612.15",
            change: "8.30",
            changePercent: "1.37",
          },
        };

        // Use mock data for development
        if (mockData[ticker]) {
          console.log(`Using mock data for ${ticker}`);
          const data = mockData[ticker];
          setStockData(data);
          setError(null);
          setLoading(false);
          return;
        }

        // If no mock data, try real API (but warn about rate limits)
        const apiKey = "QEK9W75WZ06DQP0E";
        console.log(`⚠️ Using real API for ${ticker} (25 requests/day limit)`);

        const response = await fetch(
          `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${apiKey}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        console.log(`API Response for ${ticker}:`, data);

        if (data["Note"]) {
          setError(`API Rate Limit: ${data["Note"]}`);
          setStockData(null);
        } else if (data["Error Message"]) {
          setError(`API Error: ${data["Error Message"]}`);
          setStockData(null);
        } else if (data["Global Quote"] && data["Global Quote"]["05. price"]) {
          const quote = data["Global Quote"];
          setStockData({
            symbol: quote["01. symbol"],
            price: parseFloat(quote["05. price"]).toFixed(2),
            change: parseFloat(quote["09. change"]).toFixed(2),
            changePercent: quote["10. change percent"].replace("%", ""),
          });
          setError(null);
        } else {
          setError(
            "No data available. Try a popular ticker like AAPL, GOOGL, MSFT"
          );
          setStockData(null);
        }
      } catch (e) {
        setError(`Error fetching data: ${e.message}`);
        setStockData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStockPrice();
  }, [ticker]);

  if (loading) {
    return (
      <tr className="border-b border-gray-200">
        <td className="px-6 py-4 font-medium text-gray-900">{ticker}</td>
        <td className="px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="inline-block size-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></span>
            <span className="text-blue-500 text-sm">Loading...</span>
          </div>
        </td>
        <td className="px-6 py-4">-</td>
        <td className="px-6 py-4">-</td>
        <td className="px-6 py-4">
          <button
            className="text-red-500 hover:text-red-700 text-sm font-medium"
            onClick={() => onRemove(ticker)}
          >
            Remove
          </button>
        </td>
      </tr>
    );
  }

  if (error) {
    return (
      <tr className="border-b border-gray-200">
        <td className="px-6 py-4 font-medium text-gray-900">{ticker}</td>
        <td className="px-6 py-4 text-red-500 text-sm">{error}</td>
        <td className="px-6 py-4">-</td>
        <td className="px-6 py-4">-</td>
        <td className="px-6 py-4">
          <button
            className="text-red-500 hover:text-red-700 text-sm font-medium"
            onClick={() => onRemove(ticker)}
          >
            Remove
          </button>
        </td>
      </tr>
    );
  }

  if (!stockData) {
    return (
      <tr className="border-b border-gray-200">
        <td className="px-6 py-4 font-medium text-gray-900">{ticker}</td>
        <td className="px-6 py-4 text-gray-500">No data available</td>
        <td className="px-6 py-4">-</td>
        <td className="px-6 py-4">-</td>
        <td className="px-6 py-4">
          <button
            className="text-red-500 hover:text-red-700 text-sm font-medium"
            onClick={() => onRemove(ticker)}
          >
            Remove
          </button>
        </td>
      </tr>
    );
  }

  const isPositive = parseFloat(stockData.change) >= 0;
  const changeColor = isPositive ? "text-green-600" : "text-red-600";
  const changeBgColor = isPositive ? "bg-green-50" : "bg-red-50";

  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50">
      <td className="px-6 py-4 font-medium text-gray-900">
        {stockData.symbol}
      </td>
      <td className="px-6 py-4 text-lg font-semibold text-gray-900">
        ${stockData.price}
      </td>
      <td className={`px-6 py-4 ${changeColor} font-medium`}>
        {isPositive ? "+" : ""}
        {stockData.change}
      </td>
      <td className={`px-6 py-4 ${changeColor} font-medium`}>
        <span className={`px-2 py-1 rounded-full text-xs ${changeBgColor}`}>
          {isPositive ? "+" : ""}
          {stockData.changePercent}%
        </span>
      </td>
      <td className="px-6 py-4">
        <button
          className="text-red-500 hover:text-red-700 text-sm font-medium"
          onClick={() => {
            if (
              window.confirm(`Remove ${stockData.symbol} from the dashboard?`)
            ) {
              onRemove(ticker);
            }
          }}
        >
          Remove
        </button>
      </td>
    </tr>
  );
}

function App() {
  const [tickers, setTickers] = useState(["AAPL", "GOOGL", "MSFT"]);
  const [input, setInput] = useState("");
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  const addTicker = () => {
    const value = input.trim().toUpperCase();
    if (value && !tickers.includes(value)) {
      setTickers([...tickers, value]);
      setInput("");
    }
  };

  const removeTicker = (tickerToRemove) => {
    setTickers(tickers.filter((ticker) => ticker !== tickerToRemove));
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-extrabold mb-8 text-gray-800 text-center">
          Stock Price Dashboard
        </h1>

        <div className="flex mb-8 w-full max-w-md mx-auto">
          <input
            className="flex-grow border border-gray-300 rounded-l px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Add ticker (AAPL, GOOGL, MSFT, TSLA, etc.)"
            onKeyPress={(e) => e.key === "Enter" && addTicker()}
          />
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer"
            onClick={addTicker}
          >
            Add
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("symbol")}
                  >
                    <div className="flex items-center gap-2">
                      Symbol
                      {sortField === "symbol" && (
                        <span className="text-blue-500">
                          {sortDirection === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("price")}
                  >
                    <div className="flex items-center gap-2">
                      Price
                      {sortField === "price" && (
                        <span className="text-blue-500">
                          {sortDirection === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("change")}
                  >
                    <div className="flex items-center gap-2">
                      Change
                      {sortField === "change" && (
                        <span className="text-blue-500">
                          {sortDirection === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("changePercent")}
                  >
                    <div className="flex items-center gap-2">
                      Change %
                      {sortField === "changePercent" && (
                        <span className="text-blue-500">
                          {sortDirection === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tickers.map((ticker) => (
                  <StockRow
                    key={ticker}
                    ticker={ticker}
                    onRemove={removeTicker}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {tickers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No stocks added yet. Add a ticker symbol above to get started!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
