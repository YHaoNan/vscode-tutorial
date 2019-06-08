/**
 * A brainfuck interpreter in TypeScript written by tobiasholler
 * Repo: https://github.com/tobiasholler/brnfck
 * Overwrite by LILPIG
 */


import { TextDecoder } from "util";
import { OutputChannel } from "vscode";

function compileBrainfuck(code: string): string {
    let compiledCode: string = "( function(r,w){var i=0;var t=new Uint8Array(30000);"
    let i: number
    let countChars = function (char: string) {
        let c = 0
        while (code.charAt(i) == char) {
            c++
            i++
        }
        i--
        return c
    }
    for (i = 0; i < code.length; i++) {
        switch (code.charAt(i)) {
            case "<":
                compiledCode += "i-=" + countChars("<") + ";"
                break;
            case ">":
                compiledCode += "i+=" + countChars(">") + ";"
                break;
            case "+":
                compiledCode += "t[i]+=" + countChars("+") + ";"
                break;
            case "-":
                compiledCode += "t[i]-=" + countChars("-") + ";"
                break;
            case ".":
                compiledCode += "w(t[i]);"
                break;
            case ",":
                compiledCode += "t[i]= r();"
                break;
            case "[":
                compiledCode += "while(t[i]!=0){"
                break;
            case "]":
                compiledCode += "}"
                break;
        }
    }
    return compiledCode + "return t;})"
}

export function compileBrainfuckToFunction(code: string): (readFunction: () => number, writeFunction: (byte: number) => void) => Uint8Array {
    return eval(compileBrainfuck(code))
}

export function compileBrainfuckToStandalone(code: string): string {
    return '#!/usr/bin/env node\n(function(){var a=0;' + compileBrainfuck(code) + '(function(){try{return process.argv[2].charCodeAt(a++);}catch(e){return 0;}},function(b){process.stdout.write(String.fromCharCode(b))});})();'
}