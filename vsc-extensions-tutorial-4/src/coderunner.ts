
import * as vscode from 'vscode';
import * as bf from './brainfuck'
export function runCode(code: string,input:string,outputChannel: vscode.OutputChannel){
    var counter = 0;
    bf.compileBrainfuckToFunction(code)(()=>{
        if(counter<input.length)
            return input.charCodeAt(counter++);
        return 0;
    },(byte:number)=>{
        outputChannel.append(String.fromCharCode(byte));
    });
}