import * as vscode from 'vscode';
import {MyTreeDataProvider, MyTreeItem} from './treedata'

export function activate(context: vscode.ExtensionContext) {
	
	const provider = new MyTreeDataProvider(vscode.workspace.rootPath as string);
	vscode.window.registerTreeDataProvider('treeItems',provider)
	vscode.commands.registerCommand('tree.delete',(node: MyTreeItem) => provider.delete(node))
	vscode.commands.registerCommand('tree.open',(node: MyTreeItem)=> provider.open(node))
}

export function deactivate() {}
