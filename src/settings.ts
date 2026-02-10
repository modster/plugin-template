import {App, PluginSettingTab, Setting} from "obsidian";
import ObservableFrameworkPlugin from "./main";

export interface ObservableFrameworkSettings {
	dataLoaderPath: string;
	enableAutoRefresh: boolean;
	refreshInterval: number;
	allowExternalAPIs: boolean;
	defaultChartTheme: string;
}

export const DEFAULT_SETTINGS: ObservableFrameworkSettings = {
	dataLoaderPath: 'data-loaders',
	enableAutoRefresh: false,
	refreshInterval: 60,
	allowExternalAPIs: true,
	defaultChartTheme: 'light'
}

export class ObservableSettingTab extends PluginSettingTab {
	plugin: ObservableFrameworkPlugin;

	constructor(app: App, plugin: ObservableFrameworkPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Observable Obsidian')
			.setHeading();

		// Data Loader Path
		new Setting(containerEl)
			.setName('Data loader path')
			.setDesc('Folder path for data loader scripts relative to vault root')
			.addText(text => text
				.setPlaceholder('Data Loaders')
				.setValue(this.plugin.settings.dataLoaderPath)
				.onChange(async (value) => {
					this.plugin.settings.dataLoaderPath = value;
					await this.plugin.saveSettings();
				}));

		// Enable Auto Refresh
		new Setting(containerEl)
			.setName('Enable auto refresh')
			.setDesc('Automatically refresh dashboards at specified intervals')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.enableAutoRefresh)
				.onChange(async (value) => {
					this.plugin.settings.enableAutoRefresh = value;
					await this.plugin.saveSettings();
				}));

		// Refresh Interval
		new Setting(containerEl)
			.setName('Refresh interval')
			.setDesc('Interval in seconds for auto-refresh (requires auto-refresh enabled)')
			.addText(text => text
				.setPlaceholder('60')
				.setValue(String(this.plugin.settings.refreshInterval))
				.onChange(async (value) => {
					const numValue = parseInt(value);
					if (!isNaN(numValue) && numValue > 0) {
						this.plugin.settings.refreshInterval = numValue;
						await this.plugin.saveSettings();
					}
				}));

		// Allow External APIs
		new Setting(containerEl)
			.setName('Allow external APIs')
			.setDesc('Allow data loaders to fetch data from external APIs')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.allowExternalAPIs)
				.onChange(async (value) => {
					this.plugin.settings.allowExternalAPIs = value;
					await this.plugin.saveSettings();
				}));

		// Default Chart Theme
		new Setting(containerEl)
			.setName('Default chart theme')
			.setDesc('Default theme for Observable charts and visualizations')
			.addDropdown(dropdown => dropdown
				.addOption('light', 'Light')
				.addOption('dark', 'Dark')
				.setValue(this.plugin.settings.defaultChartTheme)
				.onChange(async (value) => {
					this.plugin.settings.defaultChartTheme = value;
					await this.plugin.saveSettings();
				}));

		// Information section
		new Setting(containerEl)
			.setName('Getting started')
			.setHeading();
			
		containerEl.createEl('p', { 
			text: 'Observable framework allows you to create interactive dashboards with data from your vault or external sources.' 
		});
		
		const list = containerEl.createEl('ul');
		list.createEl('li', { text: 'Create markdown files with ```observable code blocks' });
		list.createEl('li', { text: 'Use data loaders to process data in JavaScript, Python, R, or SQL' });
		list.createEl('li', { text: 'Open dashboards with the "Open Observable dashboard" command' });
	}
}
