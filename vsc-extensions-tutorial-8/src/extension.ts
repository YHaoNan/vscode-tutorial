import * as vscode from 'vscode';
import {handle} from './img_upload'
export function activate(context: vscode.ExtensionContext) {
	const options = {
        filters: {'Images': ['png','jpg','gif']},
        canSelectMany: false,
        openLabel: '确定'
    };
	context.subscriptions.push(
		vscode.commands.registerTextEditorCommand('lilpig.pickandupload',(editor=>{
			vscode.window.showOpenDialog(options).then(uris=>{
				if(uris&&uris.length>0){
					vscode.window.showInputBox({prompt:'压缩等级1-99',value:'50'}).then(str=>{
						handle(uris[0].fsPath,parseInt(str as string),(err,data)=>{
							if(err){
								vscode.window.showErrorMessage(err);
							}else{
								editor.insertSnippet(new vscode.SnippetString('![${1:图片}]('+data+')'));
							}
						})
					})
				}
			})
		}))
	);
}

export function deactivate() {}
