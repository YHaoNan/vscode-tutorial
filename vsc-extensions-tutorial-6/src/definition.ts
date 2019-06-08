import * as vscode from 'vscode';
import * as util from './util';


export class BrainfuckDefinitionProvider implements vscode.DefinitionProvider{
    provideDefinition(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Location | vscode.Location[] | vscode.LocationLink[]> {
        if(vscode.workspace.getConfiguration().get<boolean>('bf.openLoopJump')){
            const char = document.lineAt(position.line).text.charAt(position.character);
            console.log(char);
            if(char != '[' && char != ']')return null;
            const map = util.getLoopOptPairMap(document);
            const target = util.getMatchedOpt(map,position);
            if(target)
                return new vscode.Location(document.uri,target);
        }
    }

}