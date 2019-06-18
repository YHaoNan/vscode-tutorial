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
			let isHasTranslatedSelection = false;
			editor.selections.forEach(async(selection)=>{
				if(!selection.isEmpty){
					let source = editor.document.getText(selection);
					translateAndShow(outputChannel,source);
					isHasTranslatedSelection = true;
				}
			});
			if(!isHasTranslatedSelection){
				translateAndShow(outputChannel,editor.document.getText());
			}
		})
	);
	context.subscriptions.push(
		vscode.commands.registerTextEditorCommand('ns.translateComment', async(editor)=>{
			let outputChannel = vscode.window.createOutputChannel('Translate Result');
			for(let i=0;i<editor.document.lineCount;i++){
				let lineText = editor.document.lineAt(i).text;
				let commentMatch = lineText.match('(\/\/|#)(.*)');
				if(commentMatch){
					let result = await translate(commentMatch[2]);
					let start = lineText.indexOf(commentMatch[2]);
					let end = start + commentMatch[2].length;
					editor.edit(editorEdit=>{
						editorEdit.replace(new vscode.Range(new vscode.Position(i,start),new vscode.Position(i,end)),result);
					})
			}
		}})
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

这个字体应该非常清晰了吧。。。。～～～～～
还是不够清晰，啊哈哈哈哈这回很清晰了把～～～