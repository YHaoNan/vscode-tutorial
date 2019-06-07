import * as vscode from "vscode";

export function getMatchedOpt(map:Map<string,vscode.Position>,position:vscode.Position):vscode.Position | undefined{
    return map.get(convertPositionToString(position))
}

export function getLoopOptPairMap(document: vscode.TextDocument):Map<string,vscode.Position>{
    const loopMap:Map<string,vscode.Position> = new Map();
    const stack:Array<vscode.Position> = new Array();
    for(var l=0;l<document.lineCount;l++){
        const lineText = document.lineAt(l).text;
        for(var i=0;i<lineText.length;i++){
            if(lineText.charAt(i)=='['){
                stack.push(new vscode.Position(l,i));
            }else if(lineText.charAt(i)==']'){
                const _position = stack.pop();
                if(_position)
                    loopMap.set(convertPositionToString(_position),new vscode.Position(l,i))
            }
        }
    }


    for(let key of loopMap.keys()){
        const lineAndPos = key.split('##');
        const target = loopMap.get(key);
        if(target)
            loopMap.set(convertPositionToString(target),new vscode.Position(parseInt(lineAndPos[0]),parseInt(lineAndPos[1])));
    }
    return loopMap;
}

function convertPositionToString(position:vscode.Position){
    return position.line+'##'+position.character;
}