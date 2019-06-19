import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
var exec = require('child_process').exec,child;

export class MyTreeDataProvider implements vscode.TreeDataProvider<MyTreeItem>{
    
    constructor(public rootDir: string){}
    
    private _onDidChangeTreeData: vscode.EventEmitter<MyTreeItem | undefined> = new vscode.EventEmitter<MyTreeItem | undefined>();
    readonly onDidChangeTreeData: vscode.Event<MyTreeItem | undefined> = this._onDidChangeTreeData.event;


    getTreeItem(element: MyTreeItem): vscode.TreeItem {
		return element;
    }
    
    delete(element: MyTreeItem){
        let path = element.path;
        let stat = fs.statSync(path);
        if(stat.isDirectory()){
            exec('rm -rf "'+path+'"')
        }else{
            fs.unlinkSync(path);
        }
        this.refresh();
    }

    open(element: MyTreeItem){
        vscode.workspace.openTextDocument(element.path);
    }

    refresh(): void {
		this._onDidChangeTreeData.fire();
	}

    getChildren(element?: MyTreeItem | undefined): vscode.ProviderResult<MyTreeItem[]> {
        if(!element){
            return Promise.resolve([new MyTreeItem(this.rootDir,vscode.TreeItemCollapsibleState.Expanded,null)]);
        }else{
            let items: MyTreeItem[] = [];
            let subfiles = fs.readdirSync(element.path);
            subfiles.forEach(file=>{
                let stat = fs.statSync(path.join(element.path,file));
                items.push(new MyTreeItem(file,(stat.isDirectory()?vscode.TreeItemCollapsibleState.Collapsed:vscode.TreeItemCollapsibleState.None),element))
            })
            return Promise.resolve(items);
        }
    }


}


function lightRes(filename: string){
    return path.join(__filename, '..', '..', 'res', 'light', filename); 
}

function darkRes(filename: string){
    return path.join(__filename, '..', '..', 'res', 'dark', filename); 
}

export class MyTreeItem extends vscode.TreeItem {
    constructor(public readonly label: string, public readonly collapsibleState: vscode.TreeItemCollapsibleState,public parent: MyTreeItem | null) {
        super(label, collapsibleState);
    }

    get path(): string {
        return this.parent?path.join(this.parent.path,this.label):this.label;
    }

    
    iconPath = {
        light: this.collapsibleState == vscode.TreeItemCollapsibleState.None ? lightRes('file.svg') :  lightRes('dir.svg'),
        dark: this.collapsibleState == vscode.TreeItemCollapsibleState.None ?  darkRes('file.svg') :  darkRes('dir.svg')
    }
    contextValue = this.collapsibleState == vscode.TreeItemCollapsibleState.None ? "fileItems" : "dirItems";
}