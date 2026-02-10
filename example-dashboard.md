# Example Observable Dashboard

This is a sample dashboard demonstrating Observable Framework integration.

## Sample Data

```observable
// Define sample sales data
const salesData = [
  { month: "January", sales: 12500, expenses: 8000 },
  { month: "February", sales: 15000, expenses: 9000 },
  { month: "March", sales: 18000, expenses: 9500 },
  { month: "April", sales: 16500, expenses: 8800 },
  { month: "May", sales: 20000, expenses: 10000 },
  { month: "June", sales: 22000, expenses: 11000 }
];

// Display the data
display(salesData);
```

## Calculated Metrics

```observable
// Calculate total sales and profit
const totalSales = salesData.reduce((sum, item) => sum + item.sales, 0);
const totalExpenses = salesData.reduce((sum, item) => sum + item.expenses, 0);
const totalProfit = totalSales - totalExpenses;

const metrics = {
  totalSales: totalSales,
  totalExpenses: totalExpenses,
  totalProfit: totalProfit,
  profitMargin: ((totalProfit / totalSales) * 100).toFixed(2) + '%'
};

display(metrics);
```

## Data from External API (Example)

```observable
// Example: Fetch cryptocurrency prices
// Uncomment to use with real API (requires external API enabled in settings)

/*
const cryptoData = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd')
  .then(response => response.json());

display(cryptoData);
*/

// Sample mock data for demonstration
const mockCryptoData = {
  bitcoin: { usd: 45000 },
  ethereum: { usd: 3200 }
};

display(mockCryptoData);
```

## Notes

This dashboard demonstrates:
- Basic data visualization with Observable code blocks
- Data aggregation and calculations
- Integration with external APIs (when enabled)
- Markdown and code block mixing

To view this dashboard:
1. Use the command "Open Observable dashboard"
2. Or use "Load current file as Observable dashboard"
