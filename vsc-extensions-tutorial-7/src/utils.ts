import * as vscode from 'vscode'
import {Md5} from "md5-typescript";
export let getConfig = <T>(key: string): T=><T>vscode.workspace.getConfiguration().get<T>(key);

export let genRandomNumber = (len: number): number=>{
    return getRandomInt(Math.pow(10,len-1),Math.pow(10,len)-1);
}
export let genSign = (appid: string,q: string,salt: string,key:string): string => Md5.init(appid+q+salt+key);

function getRandomInt(min: number, max: number): number {  
    var Range = max - min;  
    var Rand = Math.random();  
    return(min + Math.round(Rand * Range));  
}