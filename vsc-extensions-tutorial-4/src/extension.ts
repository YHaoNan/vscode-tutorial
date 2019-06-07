import * as vscode from 'vscode';
import * as fs from 'fs';
import * as runner from './coderunner'
import * as ac from './autocomplete'

export function activate(context: vscode.ExtensionContext) {

	context.subscriptions.push(
		vscode.languages.registerCompletionItemProvider(
			{language:  'brainfuck', scheme: 'file'},
			new ac.BrainfuckCompletionItemProvider(),
			'+','-')
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('extension.runBrainfuck',async (path)=>{

			
			await vscode.window.showInputBox({prompt: 'Input some character'}).then(input=>{
				input = input?input:'';
				const outputChannel = vscode.window.createOutputChannel('BrainFuck Interpreter');
				outputChannel.show();
				try{ 
					const sourceCode = fs.readFileSync(path.path).toString();
					const output = runner.runCode(sourceCode,input,outputChannel);
				}catch(e){
					outputChannel.appendLine('Error:'+e.message);
				}
			});
		})
	);
}

export function deactivate() {}
