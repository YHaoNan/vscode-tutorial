const HttpRequest = require('ufile').HttpRequest;
const AuthClient = require('ufile').AuthClient;
import {exec} from 'child_process'
import {getConfig} from './utils'
import * as vscode from 'vscode'
import { pathToFileURL } from 'url';
import {join} from 'path';

export function handle(source:string,compressLevel:number,callback:(err:string|undefined,data:string|undefined)=>void){
    //读取相关配置
    let handler_path = <string>getConfig('img.imghandlerpath');
    let ucloudPublicKey = <string>getConfig('img.ucloud_public_key');
    let ucloudPrivateKey = <string>getConfig('img.ucloud_private_key');
    let bucketName = <string>getConfig('img.bucketname');
    let ucloudDomain = <string>getConfig('img.domain');
    let backupDir = <string>getConfig('img.backupdir');

    //生成图片上传后的名字 img-unix时间戳.jpg
    let upload_name = 'img-'+new Date().getTime()+'.jpg';

    //执行压缩脚本的pyhton命令 完整命令是 python3 压缩脚本路径 待上传的文件路径 压缩等级 备份文件夹/$upload_name
    //用join是因为不同平台的文件夹分隔符不一样
    let command = 'python3 "'+handler_path+'" "'+ source+'" '+compressLevel+' "'+join(backupDir,upload_name)+'"';

    //执行命令
    exec(command,(err,stdout,stderr)=>{
        if(err){
            callback("调用压缩脚本出错："+stderr,undefined);
            return;
        }
        if(stdout){
            let upload_img_path = '';
            let result = stdout.split(':');
            if(result.length<2){
                callback("脚本返回结果出错，返回："+stdout,undefined);
                return;
            }
            //如果返回的是正确结果
            if(result[0]=='200'){
                //获取压缩后的图片路径
                upload_img_path = result[1];
                console.log(upload_name,upload_img_path);
                //构造请求
                const req = new HttpRequest('POST','/',bucketName,upload_name,backupDir+'/'+upload_name);
                const client = new AuthClient(req,ucloudPublicKey,ucloudPrivateKey,ucloudDomain);
                client.SendRequest((res:any)=>{
                    console.log(res);
                    if(res instanceof Error){
                        callback('上传错误：'+res.message,undefined);
                        return;
                    }
                    if(res.statusCode != 200){
                        callback('上传错误：'+res.statusCode,undefined);
                        return;
                    }
                    callback(undefined,'http://'+bucketName+ucloudDomain+'/'+upload_name);
                    
                });
            }else{
                callback("压缩错误："+result[1],undefined);
            }
        }
    });
    
}