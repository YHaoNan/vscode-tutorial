import axios from 'axios'
import * as utils from './utils'

const ERROR_MSG: {[index:string]:string}= {
    '52001': '请求超时',
    '52002': '系统错误',
    '52003': '请检查您的appid是否正确',
    '54000': '参数不完整',
    '54001': '签名错误',
    '58000': '客户端IP非法',
    '54005': '长query请求过于频繁，请稍后再试',
    '58001': '译文语言不支持',
    '58002': '您的服务已关闭'
}

const API_URL = 'https://fanyi-api.baidu.com/api/trans/vip/translate'

export async function translate(source:string): Promise<string>{
    
    let data:{[index:string]:string} = {
        q: source,
        from: 'auto',
        to: utils.getConfig('ts.to'),
        appid: utils.getConfig<string>('ts.appid'),
        salt: utils.genRandomNumber(10).toString(),
        sign: ''
    }
    

    data.sign = utils.genSign(data.appid,data.q,data.salt,utils.getConfig<string>('ts.key'));


    axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
    axios.defaults.transformRequest = [function (data) {
        let ret = '';
        for (let it in data) {
        ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&';
        }
        return ret;
    }];

    
    
    const result = await axios.post(API_URL,data);
    if(result.data.trans_result){
        let results: any[] = result.data.trans_result;
        let targetStr:string = results.map(obj=>obj.dst).join('\n');
        return Promise.resolve(targetStr);
    }else if(result.data.error_code){
        let msg = ERROR_MSG[result.data.error_code as string];
        msg=msg?msg:'未知错误';
        return Promise.reject(msg);
    }
    return Promise.reject('未知错误');
    
}
