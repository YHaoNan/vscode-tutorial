import * as vscode from "vscode";
import {translate} from './request'


export class TranslateHoverProvider implements vscode.HoverProvider{
    async provideHover(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Hover> {
        const word = document.getText(document.getWordRangeAtPosition(position));
        try{
            let result = await translate(word);
            return new vscode.Hover(result);
        }catch(e){
            vscode.window.showErrorMessage('翻译器：'+e);
        }
        
    }
}