import * as vscode from 'vscode';
import { CompletionItem } from 'vscode-debugadapter';
import { stringify } from 'querystring';

const SUPPORT_OPT = ['\\+','\\-'];



export class BrainfuckCompletionItemProvider implements vscode.CompletionItemProvider{
    provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
        
        
        var completion: vscode.CompletionItem | undefined;
        //当前行文本
        const currentLineText = document.lineAt(position.line).text;
        //当前单词第一个字符位置 position.character中的下标指向的实际上是关键字的下一个(不知道这么说准确不准确)
        const currentTokenFisrtCharIndex = findCurrentTokenFirstCharIndex(currentLineText,position.character-1);
        //当前单词
        const currentToken = currentLineText.substr(currentTokenFisrtCharIndex,position.character-currentTokenFisrtCharIndex);

        //针对所有支持的操作符(其实就+和-)构造正则表达式 并验证当前单词是否匹配
        SUPPORT_OPT.map(opt=>'^(\\d+)('+opt+'{1})$').forEach(regex=>{
            const matched = currentToken.match(regex);
            //如果匹配了就构造CompletionItem
            if(matched!=null) {
                //插入的文本 将关键字重复x次得出的结果，比如 5+ 则是 +++++
                const insertText = matched[2].repeat(parseInt(matched[1]));
                //创建CompletionItem 它所显示的标题为当前单词 比如 5+
                completion = new vscode.CompletionItem(currentToken);
                //这个是文档，我直接设置成了insertText
                completion.documentation = insertText; 
                //这个是显示出来的解释信息
                completion.detail = 'Insert '+matched[1] +' ' + matched[2];
                //这个是插入的文字，支持SnippetString
                completion.insertText = insertText;
                //snippet执行完之后的删除操作 这里设成了从当前单词第第一个位置到当前单词的最后一个位置
                completion.additionalTextEdits = [vscode.TextEdit.delete(new vscode.Range(position.line,currentTokenFisrtCharIndex,position.line,position.character))];
                
            }
        });
        return completion?Promise.resolve(new vscode.CompletionList([completion], true)):null;
    }

    
}





function findCurrentTokenFirstCharIndex(text: string,position: number):number{
    while(position>0&&text.charAt(position)!=' ')
        position--;
    return text.charAt(position)==' '?position+1:position;
}