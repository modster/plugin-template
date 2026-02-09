import {App, Editor, MarkdownView, Modal, Notice, Plugin, TFile} from 'obsidian';
import {DEFAULT_SETTINGS, ObservableFrameworkSettings, ObservableSettingTab} from "./settings";
import {ObservableView, VIEW_TYPE_OBSERVABLE} from "./observable-view";
import {DataLoaderManager} from "./data-loader";

export default class ObservableFrameworkPlugin extends Plugin {
	settings: ObservableFrameworkSettings;
	dataLoaderManager: DataLoaderManager;

	async onload() {
		await this.loadSettings();

		// Initialize data loader manager
		this.dataLoaderManager = new DataLoaderManager(this);

		// Register the Observable view
		this.registerView(
			VIEW_TYPE_OBSERVABLE,
			(leaf) => new ObservableView(leaf, this)
		);

		// Add ribbon icon
		this.addRibbonIcon('line-chart', 'Open Observable dashboard', async (evt: MouseEvent) => {
			await this.activateObservableView();
		});

		// Command: Open Observable Dashboard
		this.addCommand({
			id: 'open-observable-dashboard',
			name: 'Open Observable dashboard',
			callback: async () => {
				await this.activateObservableView();
			}
		});

		// Command: Create new Observable dashboard
		this.addCommand({
			id: 'create-observable-dashboard',
			name: 'Create new Observable dashboard',
			callback: async () => {
				await this.createNewDashboard();
			}
		});

		// Command: Create data loader template
		this.addCommand({
			id: 'create-data-loader',
			name: 'Create data loader template',
			callback: () => {
				new DataLoaderModal(this.app, this).open();
			}
		});

		// Command: Load current file as dashboard
		this.addCommand({
			id: 'load-as-dashboard',
			name: 'Load current file as Observable dashboard',
			editorCallback: async (editor: Editor, view: MarkdownView) => {
				const file = view.file;
				if (file) {
					void this.loadDashboard(file);
				}
			}
		});

		// Add settings tab
		this.addSettingTab(new ObservableSettingTab(this.app, this));
	}

	onunload() {
		// Clean up
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData() as Partial<ObservableFrameworkSettings>);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async activateObservableView() {
		const { workspace } = this.app;

		let leaf = workspace.getLeavesOfType(VIEW_TYPE_OBSERVABLE)[0];
		
		if (!leaf) {
			// Create new leaf if it doesn't exist
			const rightLeaf = workspace.getRightLeaf(false);
			if (rightLeaf) {
				leaf = rightLeaf;
				await leaf.setViewState({
					type: VIEW_TYPE_OBSERVABLE,
					active: true
				});
			}
		}

		if (leaf) {
			workspace.revealLeaf(leaf);
		}
	}

	async createNewDashboard() {
		const fileName = `Observable Dashboard ${Date.now()}.md`;
		const template = this.getDashboardTemplate();
		
		try {
			const file = await this.app.vault.create(fileName, template);
			await this.app.workspace.getLeaf().openFile(file);
			new Notice(`Created new Observable dashboard: ${fileName}`);
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			new Notice(`Failed to create dashboard: ${message}`);
		}
	}

	getDashboardTemplate(): string {
		return `# Observable Dashboard

## Data Visualization

This dashboard demonstrates Observable Framework integration with Obsidian.

\`\`\`observable
// Simple data visualization example
const data = [
	{ category: "A", value: 10 },
	{ category: "B", value: 20 },
	{ category: "C", value: 15 },
	{ category: "D", value: 25 }
];

// Display the data
display(data);
\`\`\`

## Chart Example

\`\`\`observable
// Create a simple chart
// Note: Full Observable Plot integration coming soon
const chartData = [
	{ month: "Jan", sales: 100 },
	{ month: "Feb", sales: 120 },
	{ month: "Mar", sales: 150 },
	{ month: "Apr", sales: 130 }
];

display(chartData);
\`\`\`

## Data from Vault

\`\`\`observable
// Load data from a vault file
// Example: FileAttachment("data.json").json()
const vaultData = { message: "Data from vault coming soon" };
display(vaultData);
\`\`\`

## External API Example

\`\`\`observable
// Fetch data from an external API
// const apiData = await fetch('https://api.example.com/data').then(r => r.json());
const apiData = { message: "API integration ready" };
display(apiData);
\`\`\`
`;
	}

	async loadDashboard(file: TFile) {
		const { workspace } = this.app;
		
		let leaf = workspace.getLeavesOfType(VIEW_TYPE_OBSERVABLE)[0];
		
		if (!leaf) {
			const rightLeaf = workspace.getRightLeaf(false);
			if (rightLeaf) {
				leaf = rightLeaf;
				await leaf.setViewState({
					type: VIEW_TYPE_OBSERVABLE,
					active: true
				});
			}
		}

		if (leaf) {
			const view = leaf.view;
			if (view instanceof ObservableView) {
				await view.renderObservableContent(file);
				workspace.revealLeaf(leaf);
			}
		}
	}
}

class DataLoaderModal extends Modal {
	plugin: ObservableFrameworkPlugin;

	constructor(app: App, plugin: ObservableFrameworkPlugin) {
		super(app);
		this.plugin = plugin;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		contentEl.createEl('h2', { text: 'Create data loader template' });
		contentEl.createEl('p', { text: 'Select the type of data loader to create:' });

		const loaderTypes = [
			{ name: 'JavaScript', value: 'javascript', desc: 'Use JavaScript to process and load data' },
			{ name: 'Python', value: 'python', desc: 'Use Python with pandas for data processing' },
			{ name: 'R', value: 'r', desc: 'Use R for statistical analysis' },
			{ name: 'SQL', value: 'sql', desc: 'Use SQL queries for database operations' }
		];

		const buttonContainer = contentEl.createEl('div', { cls: 'loader-button-container' });

		loaderTypes.forEach(type => {
			const button = buttonContainer.createEl('button', { 
				text: type.name,
				cls: 'mod-cta'
			});
			
			button.addEventListener('click', () => {
				void this.createLoader(type.value as 'javascript' | 'python' | 'r' | 'sql');
				this.close();
			});

			buttonContainer.createEl('p', { 
				text: type.desc,
				cls: 'setting-item-description'
			});
		});
	}

	async createLoader(type: 'javascript' | 'python' | 'r' | 'sql') {
		const extension = type === 'javascript' ? 'js' : type === 'sql' ? 'sql' : type;
		const fileName = `${this.plugin.settings.dataLoaderPath}/data-loader.${extension}`;
		const template = this.plugin.dataLoaderManager.createLoaderTemplate(type);

		try {
			// Create data loader folder if it doesn't exist
			const folderPath = this.plugin.settings.dataLoaderPath;
			if (!this.app.vault.getAbstractFileByPath(folderPath)) {
				await this.app.vault.createFolder(folderPath);
			}

			// Create the loader file
			const file = await this.app.vault.create(fileName, template);
			await this.app.workspace.getLeaf().openFile(file);
			new Notice(`Created ${type} data loader: ${fileName}`);
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			new Notice(`Failed to create data loader: ${message}`);
		}
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

