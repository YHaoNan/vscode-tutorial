import * as vscode from 'vscode';
import {TranslateHoverProvider} from './hover'
import {translate} from './request'
export function activate(context: vscode.ExtensionContext) {

	context.subscriptions.push(
		vscode.languages.registerHoverProvider('*',new TranslateHoverProvider())
	);

	context.subscriptions.push(
		vscode.commands.registerTextEditorCommand('ns.translateSelection', async(editor)=>{
			let outputChannel = vscode.window.createOutputChannel('Translate Result');
			editor.selections.forEach(async(selection)=>{
				if(!selection.isEmpty){
					let source = editor.document.getText(new vscode.Range(selection.start,selection.end));
					translateAndShow(outputChannel,source);
				}
			});
		})
	);
}

async function translateAndShow(outputChannel:vscode.OutputChannel,source:string){
	try{
		let result = await translate(source);
		outputChannel.appendLine(result);
		outputChannel.show();	
	}catch(e){
		vscode.window.showErrorMessage('翻译器：'+e);
	}
}
export function deactivate() {}
