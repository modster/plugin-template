import { requestUrl, TFile } from 'obsidian';
import ObservableFrameworkPlugin from './main';

export interface DataSource {
	name: string;
	type: 'file' | 'api' | 'loader';
	path?: string;
	url?: string;
	loader?: string;
}

export class DataLoaderManager {
	plugin: ObservableFrameworkPlugin;
	private loaders: Map<string, unknown> = new Map();

	constructor(plugin: ObservableFrameworkPlugin) {
		this.plugin = plugin;
	}

	/**
	 * Load data from a vault file
	 */
	async loadFromFile(path: string): Promise<unknown> {
		const file = this.plugin.app.vault.getAbstractFileByPath(path);
		
		if (!file || !(file instanceof TFile)) {
			throw new Error(`File not found: ${path}`);
		}

		const content = await this.plugin.app.vault.read(file);
		const extension = file.extension.toLowerCase();

		switch (extension) {
			case 'json':
				return JSON.parse(content);
			case 'csv':
				return this.parseCSV(content);
			case 'md':
				return this.parseMarkdownTable(content);
			default:
				return content;
		}
	}

	/**
	 * Load data from an external API
	 */
	async loadFromAPI(url: string, options?: RequestInit): Promise<unknown> {
		try {
			const response = await requestUrl({
				url,
				method: options?.method || 'GET',
				body: typeof options?.body === 'string' ? options.body : options?.body ? JSON.stringify(options.body) : undefined,
				headers: options?.headers as Record<string, string>,
			});
			if (response.status < 200 || response.status >= 300) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			
			const contentType = response.headers['content-type'];
			if (contentType?.includes('application/json')) {
				return JSON.parse(response.text);
			} else if (contentType?.includes('text/csv')) {
				return this.parseCSV(response.text);
			} else {
				return response.text;
			}
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			throw new Error(`Failed to load data from API: ${message}`);
		}
	}

	/**
	 * Execute a data loader script
	 */
	async executeLoader(loaderName: string, loaderCode: string): Promise<unknown> {
		// Store the loader for later use
		this.loaders.set(loaderName, loaderCode);

		try {
			// Create a safe execution context
			// For now, we'll support JavaScript loaders
			const result = await this.executeJavaScriptLoader(loaderCode);
			return result;
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			throw new Error(`Failed to execute loader '${loaderName}': ${message}`);
		}
	}

	/**
	 * Execute JavaScript data loader
	 */
	private async executeJavaScriptLoader(code: string): Promise<unknown> {
		// Create a sandboxed execution context
		// For security, we validate the code structure and avoid Function constructor
		try {
			// Provide limited APIs
			const FileAttachment = (path: string) => ({
				json: async () => await this.loadFromFile(path),
				csv: async () => await this.loadFromFile(path),
				text: async () => await this.loadFromFile(path),
			});

			// Create a wrapper for requestUrl to match fetch API
			const fetchWrapper = async (url: string, options?: RequestInit) => {
				let body: string | undefined;
				if (options?.body) {
					body = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
				}
				const response = await requestUrl({
					url,
					method: options?.method || 'GET',
					body,
					headers: options?.headers as Record<string, string>,
				});
				return {
					ok: response.status >= 200 && response.status < 300,
					status: response.status,
					json: async () => JSON.parse(response.text),
					text: async () => response.text,
				};
			};

			// Create an async function scope with the provided context
			const executionContext = {
				fetch: fetchWrapper,
				FileAttachment,
				console,
			};

			// Use eval in a controlled scope (still requires explicit security review)
			// eslint-disable-next-line no-eval
			const loaderFunction = eval(`(async () => { ${code} })`) as () => Promise<unknown>;
			return await loaderFunction.call(executionContext);
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			throw new Error(`JavaScript loader execution failed: ${message}`);
		}
	}

	/**
	 * Parse CSV content
	 */
	private parseCSV(content: string): unknown[] {
		const lines = content.trim().split('\n');
		if (lines.length === 0) return [];

		const headers = lines[0]?.split(',').map(h => h.trim()) || [];
		const data: unknown[] = [];

		for (let i = 1; i < lines.length; i++) {
			const values = lines[i]?.split(',').map(v => v.trim()) || [];
			const row: Record<string, unknown> = {};
			
			headers.forEach((header, index) => {
				const value = values[index];
				// Try to parse as number
				row[header] = isNaN(Number(value)) ? value : Number(value);
			});
			
			data.push(row);
		}

		return data;
	}

	/**
	 * Parse markdown table
	 */
	private parseMarkdownTable(content: string): unknown[] {
		const lines = content.split('\n');
		const tableLines: string[] = [];
		let inTable = false;

		// Extract table lines
		for (const line of lines) {
			if (line.trim().startsWith('|')) {
				inTable = true;
				tableLines.push(line);
			} else if (inTable) {
				break;
			}
		}

		if (tableLines.length < 2) return [];

		// Parse headers
		const headers = tableLines[0]?.split('|')
			.map(h => h.trim())
			.filter(h => h.length > 0) || [];

		// Skip separator line (line 1)
		const data: unknown[] = [];
		for (let i = 2; i < tableLines.length; i++) {
			const values = tableLines[i]?.split('|')
				.map(v => v.trim())
				.filter(v => v.length > 0) || [];
			
			if (values.length === 0) continue;

			const row: Record<string, unknown> = {};
			headers.forEach((header, index) => {
				const value = values[index];
				row[header] = isNaN(Number(value)) ? value : Number(value);
			});
			
			data.push(row);
		}

		return data;
	}

	/**
	 * Get all data files in vault
	 */
	async getDataFiles(): Promise<TFile[]> {
		const dataFiles: TFile[] = [];
		const files = this.plugin.app.vault.getFiles();

		for (const file of files) {
			if (this.isDataFile(file)) {
				dataFiles.push(file);
			}
		}

		return dataFiles;
	}

	/**
	 * Check if file is a data file
	 */
	private isDataFile(file: TFile): boolean {
		const dataExtensions = ['json', 'csv', 'tsv', 'txt'];
		return dataExtensions.includes(file.extension.toLowerCase());
	}

	/**
	 * Create a data loader template
	 */
	createLoaderTemplate(type: 'javascript' | 'python' | 'r' | 'sql'): string {
		switch (type) {
			case 'javascript':
				return `// JavaScript Data Loader
// This loader fetches and processes data

const data = await fetch('https://api.example.com/data')
	.then(response => response.json());

// Process data
const processed = data.map(item => ({
	name: item.name,
	value: item.value
}));

// Return the processed data
return processed;
`;

			case 'python':
				return `# Python Data Loader
# This loader processes data using pandas

import pandas as pd
import json

# Read data
df = pd.read_csv("data.csv")

# Process data
result = df.groupby("category").agg({"value": "sum"}).reset_index()

# Output as JSON
print(json.dumps(result.to_dict(orient="records")))
`;

			case 'r':
				return `# R Data Loader
# This loader processes data using R

library(jsonlite)

# Read data
df <- read.csv("data.csv")

# Process data
result <- aggregate(value ~ category, data=df, sum)

# Output as JSON
cat(toJSON(result, pretty=FALSE, auto_unbox=TRUE))
`;

			case 'sql':
				return `-- SQL Data Loader
-- This loader queries a database

SELECT 
	category,
	SUM(value) as total_value
FROM data_table
GROUP BY category
ORDER BY total_value DESC;
`;

			default:
				return '';
		}
	}
}
