import * as vscode from "vscode";

export function getMatchedOpt(map:Map<string,vscode.Position>,position:vscode.Position):vscode.Position | undefined{
    return map.get(convertPositionToString(position))
}

export function getLoopOptPairMap(document: vscode.TextDocument):Map<string,vscode.Position>{
    let loopMap:Map<string,vscode.Position> = new Map();
    let stack:Array<vscode.Position> = new Array();
    for(let l=0;l<document.lineCount;l++){
        let lineText = document.lineAt(l).text;
        for(let i=0;i<lineText.length;i++){
            if(lineText.charAt(i)=='['){
                stack.push(new vscode.Position(l,i));
            }else if(lineText.charAt(i)==']'){
                let _position = stack.pop();
                loopMap.set(convertPositionToString(_position as vscode.Position),new vscode.Position(l,i))
            }
        }
    }


    for(let key of loopMap.keys()){
        let lineAndPos = key.split('##');
        let target = loopMap.get(key);
        loopMap.set(convertPositionToString(target as vscode.Position),new vscode.Position(parseInt(lineAndPos[0]),parseInt(lineAndPos[1])));
    }
    return loopMap;
}

function convertPositionToString(position:vscode.Position){
    return position.line+'##'+position.character;
}