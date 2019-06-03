import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.commands.registerCommand('ext.getCurrentPath',()=>{
			vscode.commands.executeCommand('copyFilePath');
			vscode.commands.executeCommand('editor.action.clipboardPasteAction');
			vscode.window.showInformationMessage('Done...');
		})
	);

	
	
	context.subscriptions.push(
		vscode.commands.registerCommand('ext.getCurrentPathWithoutBuiltInCommand',()=>{
			const currentEditor = vscode.window.activeTextEditor;
			if(currentEditor){
				const path = currentEditor.document.uri.path;
				vscode.env.clipboard.writeText(path);
				currentEditor.insertSnippet(new vscode.SnippetString(path));
				vscode.window.showInformationMessage('Done...');
			}
		})
	);
}

export function deactivate() {}
