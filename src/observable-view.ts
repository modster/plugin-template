import { ItemView, WorkspaceLeaf, TFile } from 'obsidian';
import ObservableFrameworkPlugin from './main';

export const VIEW_TYPE_OBSERVABLE = 'observable-framework-view';

export class ObservableView extends ItemView {
	plugin: ObservableFrameworkPlugin;
	private contentContainer: HTMLElement;

	constructor(leaf: WorkspaceLeaf, plugin: ObservableFrameworkPlugin) {
		super(leaf);
		this.plugin = plugin;
	}

	getViewType(): string {
		return VIEW_TYPE_OBSERVABLE;
	}

	getDisplayText(): string {
		return 'Observable dashboard';
	}

	getIcon(): string {
		return 'line-chart';
	}

	async onOpen(): Promise<void> {
		const container = this.containerEl.children[1];
		if (!container) return;
		
		container.empty();
		container.addClass('observable-framework-container');

		// Create header
		const header = container.createEl('div', { cls: 'observable-header' });
		header.createEl('h3', { text: 'Observable framework dashboard' });

		// Create content container
		this.contentContainer = container.createEl('div', { cls: 'observable-content' });
		
		// Display initial content
		this.renderWelcome();
	}

	async onClose(): Promise<void> {
		// Clean up
	}

	renderWelcome(): void {
		this.contentContainer.empty();
		
		const welcome = this.contentContainer.createEl('div', { cls: 'observable-welcome' });
		welcome.createEl('h2', { text: 'Welcome to Observable framework' });
		welcome.createEl('p', { text: 'Create interactive dashboards, charts, reports, and maps from your vault data or external APIs.' });
		
		const features = welcome.createEl('ul');
		features.createEl('li', { text: 'Data loaders in JavaScript, Python, R, SQL' });
		features.createEl('li', { text: 'Interactive charts with Observable Plot' });
		features.createEl('li', { text: 'Real-time data visualization' });
		features.createEl('li', { text: 'Connect to vault files or external APIs' });
		
		const instructions = welcome.createEl('div', { cls: 'observable-instructions' });
		instructions.createEl('p', { text: 'To get started:' });
		const steps = instructions.createEl('ol');
		steps.createEl('li', { text: 'Create a markdown file with Observable code blocks' });
		steps.createEl('li', { text: 'Use the "Open Observable dashboard" command' });
		steps.createEl('li', { text: 'Configure data loaders in settings' });
	}

	async renderObservableContent(file: TFile): Promise<void> {
		this.contentContainer.empty();
		
		try {
			const content = await this.app.vault.read(file);
			const dashboardContainer = this.contentContainer.createEl('div', { cls: 'observable-dashboard' });
			
			// Parse and render Observable markdown
			await this.parseAndRenderObservable(content, dashboardContainer);
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			this.contentContainer.createEl('div', { 
				cls: 'observable-error',
				text: `Error loading dashboard: ${message}` 
			});
		}
	}

	private async parseAndRenderObservable(content: string, container: HTMLElement): Promise<void> {
		// Extract Observable code blocks
		const observableBlocks = this.extractObservableBlocks(content);
		
		if (observableBlocks.length === 0) {
			container.createEl('p', { text: 'No Observable code blocks found. Add code blocks with "observable" language tag.' });
			return;
		}

		// Render each block
		for (const block of observableBlocks) {
			await this.renderCodeBlock(block, container);
		}
	}

	private extractObservableBlocks(content: string): string[] {
		const blocks: string[] = [];
		const regex = /```observable\s*\n([\s\S]*?)```/g;
		let match;

		while ((match = regex.exec(content)) !== null) {
			blocks.push(match[1]?.trim() || '');
		}

		return blocks;
	}

	private async renderCodeBlock(code: string, container: HTMLElement): Promise<void> {
		const blockContainer = container.createEl('div', { cls: 'observable-block' });
		
		try {
			// Create a sandboxed container for the code execution
			const outputContainer = blockContainer.createEl('div', { cls: 'observable-output' });
			
			// For now, display the code and a message about execution
			const codeDisplay = blockContainer.createEl('pre');
			codeDisplay.createEl('code', { text: code });
			
			outputContainer.createEl('p', { 
				cls: 'observable-info',
				text: '📊 Observable code block detected - full execution support coming soon' 
			});
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			blockContainer.createEl('div', { 
				cls: 'observable-error',
				text: `Error rendering block: ${message}` 
			});
		}
	}
}
