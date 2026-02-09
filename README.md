# Observable Framework for Obsidian

An Obsidian plugin that integrates Observable Framework to create interactive dashboards, charts, reports, maps, and more from any data source within your vault(s) or from external APIs.

## Features

- 📊 **Interactive Visualizations**: Create dashboards with Observable Framework right inside Obsidian
- 🔄 **Data Loaders**: Process data using JavaScript, Python, R, or SQL
- 📁 **Vault Integration**: Load data from CSV, JSON, and other files in your vault
- 🌐 **External APIs**: Fetch and visualize data from external sources
- 🎨 **Customizable Themes**: Light and dark theme support for charts
- ⚡ **Auto-Refresh**: Automatically update dashboards at specified intervals

## Installation

### Manual Installation

1. Download the latest release from the [Releases](https://github.com/modster/plugin-template/releases) page
2. Extract the files into your vault's `.obsidian/plugins/observable-framework/` directory
3. Reload Obsidian
4. Enable the plugin in Settings → Community Plugins

### From Obsidian Community Plugins

(Coming soon after publication to the community plugins list)

## Quick Start

### 1. Create a Dashboard

Use the command palette (`Ctrl/Cmd + P`) and select **"Create new Observable dashboard"**. This will create a new markdown file with example Observable code blocks.

### 2. Write Observable Code

Add Observable code blocks to any markdown file using the `observable` language tag:

\`\`\`observable
// Simple data visualization
const data = [
  { category: "A", value: 10 },
  { category: "B", value: 20 },
  { category: "C", value: 15 }
];

display(data);
\`\`\`

### 3. View the Dashboard

Open the dashboard view with:
- Click the chart icon in the ribbon
- Use command: **"Open Observable dashboard"**
- Use command: **"Load current file as Observable dashboard"**

## Data Loaders

Data loaders allow you to process data in multiple languages before visualization.

### Creating a Data Loader

Use the command **"Create data loader template"** and select your preferred language:

#### JavaScript Data Loader

\`\`\`javascript
// data-loader.js
const response = await fetch('https://api.example.com/data');
const data = await response.json();

// Process data
const processed = data.map(item => ({
  name: item.name,
  value: item.value
}));

return processed;
\`\`\`

#### Python Data Loader

\`\`\`python
# data-loader.py
import pandas as pd
import json

df = pd.read_csv("data.csv")
result = df.groupby("category").agg({"value": "sum"}).reset_index()
print(json.dumps(result.to_dict(orient="records")))
\`\`\`

#### R Data Loader

\`\`\`r
# data-loader.R
library(jsonlite)

df <- read.csv("data.csv")
result <- aggregate(value ~ category, data=df, sum)
cat(toJSON(result, pretty=FALSE, auto_unbox=TRUE))
\`\`\`

#### SQL Data Loader

\`\`\`sql
-- data-loader.sql
SELECT category, SUM(value) as total_value
FROM data_table
GROUP BY category
ORDER BY total_value DESC;
\`\`\`

### Loading Data from Vault Files

\`\`\`observable
// Load JSON data from vault
const data = await FileAttachment("data/sales.json").json();
display(data);

// Load CSV data from vault
const csvData = await FileAttachment("data/metrics.csv").csv();
display(csvData);
\`\`\`

### Loading Data from External APIs

\`\`\`observable
// Fetch from external API
const apiData = await fetch('https://api.example.com/data')
  .then(response => response.json());

display(apiData);
\`\`\`

## Configuration

Access plugin settings via **Settings → Observable Framework**:

### Settings

- **Data Loader Path**: Folder for data loader scripts (default: `data-loaders`)
- **Enable Auto Refresh**: Automatically refresh dashboards
- **Refresh Interval**: Refresh frequency in seconds
- **Allow External APIs**: Enable/disable external API access
- **Default Chart Theme**: Choose light or dark theme for visualizations

## Use Cases

### 1. Personal Analytics Dashboard

Track your daily habits, notes, or productivity metrics from vault data.

\`\`\`observable
// Load daily notes metadata
const notes = await FileAttachment("daily-notes.json").json();

// Create visualization
display(notes);
\`\`\`

### 2. Project Management Dashboard

Visualize project progress, tasks, and milestones.

\`\`\`observable
const tasks = await FileAttachment("tasks.csv").csv();
const completed = tasks.filter(t => t.status === 'done').length;
const total = tasks.length;

display({ completed, total, percentage: (completed/total)*100 });
\`\`\`

### 3. Research Data Visualization

Analyze and visualize research data from external sources.

\`\`\`observable
const research = await fetch('https://api.research.org/papers?topic=ai')
  .then(r => r.json());

display(research);
\`\`\`

### 4. Financial Tracking

Monitor expenses, income, or investments.

\`\`\`observable
const expenses = await FileAttachment("finances/expenses.csv").csv();

// Group by category
const byCategory = expenses.reduce((acc, item) => {
  acc[item.category] = (acc[item.category] || 0) + parseFloat(item.amount);
  return acc;
}, {});

display(byCategory);
\`\`\`

## Commands

- **Open Observable dashboard**: Opens the dashboard view panel
- **Create new Observable dashboard**: Creates a new dashboard template
- **Create data loader template**: Creates a data loader in your preferred language
- **Load current file as Observable dashboard**: Loads the current markdown file in dashboard view

## Development

### Prerequisites

- Node.js 18+
- npm

### Setup

\`\`\`bash
npm install
npm run dev  # Development with watch mode
npm run build  # Production build
\`\`\`

### Project Structure

\`\`\`
src/
├── main.ts              # Plugin entry point
├── settings.ts          # Plugin settings
├── observable-view.ts   # Dashboard view component
└── data-loader.ts       # Data loader manager
\`\`\`

## Roadmap

- [ ] Full Observable Plot integration
- [ ] Live code execution in dashboards
- [ ] More data loader language support
- [ ] Chart export functionality
- [ ] Collaborative dashboards
- [ ] Template library

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

0-BSD

## Support

- [GitHub Issues](https://github.com/modster/plugin-template/issues)
- [Obsidian Forum](https://forum.obsidian.md/)

## Acknowledgments

This plugin integrates [Observable Framework](https://observablehq.com/framework/) for data visualization capabilities.

---

**Note**: This plugin is in active development. Some features are still being implemented. Full Observable Plot execution and advanced charting features are coming soon.

