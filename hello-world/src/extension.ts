import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "hello-world" is now active!');

	let disposable = vscode.commands.registerCommand('extension.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World!');
	});

	let disposable2 = vscode.commands.registerCommand('extension.shadiao', ()=>{
		vscode.window.showInformationMessage('无论我变成什么亚子，都鱼女无瓜！');
	});
	context.subscriptions.push(disposable);
	context.subscriptions.push(disposable2);
}

export function deactivate() {}