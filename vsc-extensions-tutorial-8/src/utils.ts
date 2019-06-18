import * as vscode from 'vscode'
export let getConfig = <T>(key: string): T=><T>vscode.workspace.getConfiguration().get<T>(key);
