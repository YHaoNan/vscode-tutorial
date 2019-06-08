import * as vscode from 'vscode'
import { disconnect } from 'cluster';
import * as util from './util';


export class BrainfuckHoverProvider implements vscode.HoverProvider{
    provideHover(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Hover> {
        const opt = document.lineAt(position.line).text.charAt(position.character);
        const wordRange = document.getWordRangeAtPosition(position,new RegExp('\\'+opt+'+'));

        if((opt=='+' || opt=='-')&&vscode.workspace.getConfiguration().get<boolean>('bf.openOptCounter'))
            return wordRange?new vscode.Hover(new vscode.MarkdownString('### BF Opt Counter  \n\n * **Opt: `'+opt+'`**\n\n* **Length: `'+(wordRange.end.character-wordRange.start.character)+'`**')):null;
        else if((opt=='[' || opt==']')&&vscode.workspace.getConfiguration().get<boolean>('bf.openLoopJump')){
            const map = util.getLoopOptPairMap(document);
            const target = util.getMatchedOpt(map,position);
            if(target)
                return wordRange?new vscode.Hover(new vscode.MarkdownString('### Loop Opt Pair\n\n* **Matched: `'+target.character+'`**, press ctrl and click to jump here.')):null;
        }
    }

}

