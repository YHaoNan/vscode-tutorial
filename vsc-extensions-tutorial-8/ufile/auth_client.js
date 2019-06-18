//system
var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var assert = require('assert');
var Readable = require('stream').Readable;

//third party
var request = require('request');
var utf8 = require('utf8');

//local
var MultiUpload = require('./multi_upload');
var HttpRequest = require('./http_request');
var helper = require('./helper');

//debug
var util = require('util');

var AuthClient = function(req,public_key,private_key,proxy_suffix) {
    this.req = req;
    this.public_key = public_key;
    this.private_key = private_key;
    this.proxy_suffix = proxy_suffix;
    this.authorization = "";
}

AuthClient.prototype.SendRequest = function(callback) {
    //ahthorize
    this.MakeAuth();

    if ('PUT' == this.req.method) {
        if (this.req instanceof MultiUpload) {
            this.PutPart(callback);
        } else if (this.req instanceof HttpRequest) {
            this.PutFile(callback);
        }
    } else if ('POST' == this.req.method) {
        if ("UPLOAD_HIT" ==  this.req.type) {
            this.PostUploadHit(callback);
        } else if ("INIT_MULTI_UPLOAD" == this.req.type) {
            this.PostData(callback);
        } else if ("FINISH_MULTI_UPLOAD" == this.req.type) {
            this.PostFinish(callback);
        }  else if ("PUT_OR_POST" == this.req.type) {
            this.PostFile(callback);
        }
    } else if ('DELETE' == this.req.method) {
        this.DeleteFile(callback);
    } else if ('GET' == this.req.method) {
        this.GetFile(callback);
    } else {
        console.log("unsupported method");
    }
}

AuthClient.prototype.GetFile = function(callback) {
    var urlraw = 'http://' + this.req.bucket + this.proxy_suffix + this.req.url_path_params;
    var urlstr =  utf8.encode(urlraw);

    var full_headers = {};
    full_headers["Authorization"] = this.authorization;

    this.req.headers.forEachEntry(function(entry, key) {
        if (key.indexOf('X-UCloud') === 0) {
            full_headers[key.toLowerCase()] = entry.toString();
        } else {
            full_headers[key] = entry.toString();
        }	
    });

    var options = {
        url: urlstr,
        method: 'GET',
        headers: full_headers
    };

    request.get(options).on('response', function(response) {
        var statusCode = response.statusCode;
        var header = JSON.stringify(response.headers) || ""; 

        var retraw = "{\"statusCode\":" +  response.statusCode +", \"header\":" +  header + "}";
        var ret = retraw.replace(/[\n\t]/g, "");
        callback(JSON.parse(ret));
    }).on('error', function(err) {
        callback(err);
    }).pipe(fs.createWriteStream(this.req.file_path));
}


AuthClient.prototype.DeleteFile = function(callback) {
    var urlraw = 'http://' + this.req.bucket + this.proxy_suffix + this.req.url_path_params;
    var urlstr =  utf8.encode(urlraw);

    var full_headers = {};
    full_headers["Authorization"] = this.authorization;

    this.req.headers.forEachEntry(function(entry, key) {
        if (key.indexOf('X-UCloud') === 0) {
            full_headers[key.toLowerCase()] = entry.toString();
        } else {
            full_headers[key] = entry.toString();
        }	
    });

    var options = {
        url: urlstr,
        method: 'DELETE',
        headers: full_headers
    };

    function delete_cb(err, response, body) {
        if (err) {
            return callback(err);
        }
        var statusCode = response.statusCode;
        var header = JSON.stringify(response.caseless.dict) || "";
        var _body = body || "\"\""

        var retraw = "{\"statusCode\":" +  response.statusCode +", \"header\":" +  header + ", \"body\":" +  _body + "}";
        var ret = retraw.replace(/[\n\t]/g, "");
        callback(JSON.parse(ret));
    }
    request(options, delete_cb);
}

AuthClient.prototype.PostFinish = function(callback) {
    function post_cb(err, response, body) {
        if (err) {
            return callback(err);
        }
        var statusCode = response.statusCode;
        var header = JSON.stringify(response.caseless.dict) || "";
        var _body = body || "\"\""

        var retraw = "{\"statusCode\":" +  response.statusCode +", \"header\":" +  header + ", \"body\":" +  _body + "}";
        var ret = retraw.replace(/[\n\t]/g, "");
        callback(JSON.parse(ret));
    }
	

    var urlraw = 'http://' + this.req.bucket + this.proxy_suffix + this.req.url_path_params;
    var urlstr =  utf8.encode(urlraw);
	
    var full_headers = {};
    full_headers["Authorization"] = this.authorization;
    full_headers["Content-Length"] = this.req.stream_size;

    this.req.headers.forEachEntry(function(entry, key) {
        if (key.indexOf('X-UCloud') === 0) {
            full_headers[key.toLowerCase()] = entry.toString();
        } else {
            full_headers[key] = entry.toString();
        }	
    });
    var options = {
        url: urlstr,
        method: 'POST',
        headers: full_headers
    };
    this.req.read_stream.pipe(request.post(options, post_cb));
}

AuthClient.prototype.PutPart = function(callback) {
    var urlraw = 'http://' + this.req.bucket + this.proxy_suffix + this.req.url_path_params;
    var urlstr =  utf8.encode(urlraw);

    var full_headers = {};
    full_headers["Authorization"] = this.authorization;
    full_headers["Content-Length"] = this.req.stream_size;
    full_headers["Content-Type"] = this.req.mime_type;

    this.req.headers.forEachEntry(function(entry, key) {
        if (key.indexOf('X-UCloud') === 0) {
            full_headers[key.toLowerCase()] = entry.toString();
        } else {
            full_headers[key] = entry.toString();
        }	
    });

    var options = {
        url: urlstr,
        method: 'PUT',
        headers: full_headers
    };

    function put_cb(err, response, body) {
        if (err) {
            return callback(err);
        }
        var statusCode = response.statusCode;
        var header = JSON.stringify(response.caseless.dict) || "";
        var _body = body || "\"\""

        var retraw = "{\"statusCode\":" +  response.statusCode +", \"header\":" +  header + ", \"body\":" +  _body + "}";
        var ret = retraw.replace(/[\n\t]/g, "");
        callback(JSON.parse(ret));
    }
    assert(this.req.read_stream instanceof Readable);
    this.req.read_stream.pipe(request.put(options, put_cb));
}

AuthClient.prototype.PostUploadHit = function(callback) {
	
    var self = this;

    function post_cb(err, response, body) {
        if (err) {
            return callback(err);
        }
        var statusCode = response.statusCode;
        var header = JSON.stringify(response.caseless.dict) || "";
        var _body = body || "\"\""

        var retraw = "{\"statusCode\":" +  response.statusCode +", \"header\":" +  header + ", \"body\":" +  _body + "}";
        var ret = retraw.replace(/[\n\t]/g, "");
        callback(JSON.parse(ret));
    }

    helper.UFileEtag(self.req.file_path, self.req.file_size, get_etag);	
	
    function get_etag(etag) {

        var urlraw = 'http://' + self.req.bucket + self.proxy_suffix + self.req.url_path_params
                + '?Hash=' + etag + '&FileName=' + self.req.key + '&FileSize=' + self.req.file_size;;
        var urlstr =  utf8.encode(urlraw);
	
        var full_headers = {};
        full_headers["Authorization"] = self.authorization;

        self.req.headers.forEachEntry(function(entry, key) {
            if (key.indexOf('X-UCloud') === 0) {
                full_headers[key.toLowerCase()] = entry.toString();
            } else {
                full_headers[key] = entry.toString();
            }	
        });
        var options = {
            url: urlstr,
            method: 'POST',
            headers: full_headers
        };
        var req = request(options, post_cb); 
    }
}

AuthClient.prototype.PostData = function(callback) {
    var self = this;
    function post_cb(err, response, body) {
        if (err) {
            return callback(err);
        }
        var statusCode = response.statusCode;
        var header = JSON.stringify(response.caseless.dict) || "";
        var _body = body || "\"\""

        var retraw = "{\"statusCode\":" +  response.statusCode +", \"header\":" +  header + ", \"body\":" +  _body + "}";
        var ret = retraw.replace(/[\n\t]/g, "");
        callback(JSON.parse(ret));
    }
	

    var urlraw = 'http://' + self.req.bucket + self.proxy_suffix + self.req.url_path_params;
    var urlstr =  utf8.encode(urlraw);
	
    var full_headers = {};
    full_headers['Authorization'] =  self.authorization;
    full_headers['Content-Length'] = 0;
    self.req.headers.forEachEntry(function(entry, key) {
        if (key.indexOf('X-UCloud') === 0) {
            full_headers[key.toLowerCase()] = entry.toString();
        } else {
            full_headers[key] = entry.toString();
        }	
    });
    var options = {
        url: urlstr,
        method: 'POST',
        headers: full_headers
    };

    var req = request(options, post_cb); 
}

AuthClient.prototype.PostFile = function(callback) {
	
    function post_cb(err, response, body) {
        if (err) {
            return callback(err);
        }
        var statusCode = response.statusCode;
        var header = JSON.stringify(response.caseless.dict) || "";
        var _body = body || "\"\""

        var retraw = "{\"statusCode\":" +  response.statusCode +", \"header\":" +  header + ", \"body\":" +  _body + "}";
        var ret = retraw.replace(/[\n\t]/g, "");
        callback(JSON.parse(ret));
    }
	

    var urlraw = 'http://' + this.req.bucket + this.proxy_suffix + this.req.url_path_params;
    var urlstr =  utf8.encode(urlraw);
	
    var full_headers = {};

    if (this.req.headers.has('Content-MD5')) {
        full_headers["Content-MD5"] = this.req.headers.get('Content-MD5')[0];
    }
    if (this.req.headers.has('Date')) {
        full_headers["Date"] = this.req.headers.get('Date')[0];
    }

    this.req.headers.forEachEntry(function(entry, key) {
        if (key.indexOf('X-UCloud') === 0) {
            full_headers[key.toLowerCase()] = entry.toString();
        } else {
            full_headers[key] = entry.toString();
        }
    });

    var options = {
        url: urlstr,
        method: 'POST',
        headers: full_headers
    };

    var req = request(options, post_cb); 

    var form = req.form();
    form.append('Authorization', this.authorization);
    form.append('FileName', this.req.key);
    form.append('file', fs.createReadStream(this.req.file_path), 
            {filename: path.basename(this.req.file_path)});
}

AuthClient.prototype.PutFile = function(callback) {
    var urlraw = 'http://' + this.req.bucket + this.proxy_suffix + this.req.url_path_params;
    var urlstr =  utf8.encode(urlraw);

    var full_headers = {};
    full_headers["Authorization"] = this.authorization;
    full_headers["Content-Type"]  = this.req.mime_type;
    full_headers["Content-Length"] = this.req.file_size;
    if (this.req.headers.has('Content-MD5')) {
        full_headers["Content-MD5"] = this.req.headers.get('Content-MD5')[0];
    }
    if (this.req.headers.has('Date')) {
        full_headers["Date"] = this.req.headers.get('Date')[0];
    }

    this.req.headers.forEachEntry(function(entry, key) {
        if (key.indexOf('X-UCloud') === 0) {
            full_headers[key.toLowerCase()] = entry.toString();
        } else {
            full_headers[key] = entry.toString();
        }
    });


    var options = {
        url: urlstr,
        method: 'PUT',
        headers: full_headers
    };

    function put_cb(err, response, body) {
        if (err) {
            return callback(err);
        }
        var statusCode = response.statusCode;
        var header = JSON.stringify(response.caseless.dict) || "";
        var _body = body || "\"\""

        var retraw = "{\"statusCode\":" +  response.statusCode +", \"header\":" +  header + ", \"body\":" +  _body + "}";
        var ret = retraw.replace(/[\n\t]/g, "");
        callback(JSON.parse(ret));
    }
    fs.createReadStream(this.req.file_path).pipe(request(options, put_cb));
}

AuthClient.prototype.MakeAuth =  function() {
    if (this.req instanceof MultiUpload) {
        var canonicalized_resource = this.CanonicalizedResource(this.req.bucket, this.req.key);
        var canonicalized_ucloudHeaders =  this.CanonicalizedUCloudHeaders(this.req.headers);
        var date = "";
        if (this.req.headers.has("Date")) {
            date = this.req.headers.get("Date")[0];
        }	
        var content_md5 = "";	
        if (this.req.headers.has("Content-MD5")) {
            content_md5 = this.req.headers.get("Content-MD5")[0];
        }
        var content_type = this.req.mime_type;
        if ("FINISH_MULTI_UPLOAD" == this.req.type) {
            content_type = "";
        }
        var http_verb = this.req.method;
        var string_to_sign = http_verb  + "\n" + content_md5 + "\n" + content_type + "\n"
                + date + "\n" + canonicalized_ucloudHeaders + canonicalized_resource;

        var signature = this.Sign(this.private_key, utf8.encode(string_to_sign));
        this.authorization = this.Authorize(this.public_key, signature);
        return;
    } else if (this.req instanceof HttpRequest) {
        this.req.file_size = 0;
        this.req.mime_type = "";
        if (this.req.method != 'GET' && this.req.file_path && this.req.file_path != "") {
            this.req.file_size = helper.GetFileSize(this.req.file_path);
            this.req.mime_type = helper.GetMimeType(this.req.file_path);
        }

        var canonicalized_resource = this.CanonicalizedResource(this.req.bucket, this.req.key);
        var canonicalized_ucloudHeaders =  this.CanonicalizedUCloudHeaders(this.req.headers);
        var date = "";
        if (this.req.headers.has("Date")) {
            date = this.req.headers.get("Date")[0];
        }	
        var content_md5 = "";	
        if (this.req.headers.has("Content-MD5")) {
            content_md5 = this.req.headers.get("Content-MD5")[0];
        }
        var content_type = this.req.mime_type;
        if (this.req.type && ("UPLOAD_HIT" == this.req.type  || "INIT_MULTI_UPLOAD" == this.req.type)) {
            content_type = ""; 
        }
        var http_verb = this.req.method;
        var string_to_sign = http_verb  + "\n" + content_md5 + "\n" + content_type + "\n"
                + date + "\n" + canonicalized_ucloudHeaders + canonicalized_resource;

        //console.log(' string_to_sign \n' + string_to_sign); 

        var signature = this.Sign(this.private_key, utf8.encode(string_to_sign));
        this.authorization = this.Authorize(this.public_key, signature);
    }
}


AuthClient.prototype.Base64 = function(content) {
    return new Buffer(content).toString('base64');
}

AuthClient.prototype.HmacSha1 = function(secretKey, content) {
    var hmac = crypto.createHmac('sha1', secretKey);
    hmac.update(content);
    return hmac.digest();
}


AuthClient.prototype.CanonicalizedResource = function(bucket, key) {
    return "/" + bucket + "/" + key;
}

AuthClient.prototype.CanonicalizedUCloudHeaders = function(headers) {
    var map = {};
    headers.forEachEntry(function(entry, key) {
        if (key.indexOf('X-UCloud') === 0) {
            map[key.toLowerCase()] =  entry.toString();
        }
    });	
    var sorted_map = helper.KeySort(map);
    var result = "";
    Object.keys(sorted_map).forEach(function(key) {
        result += key + ":" + sorted_map[key] + "\n";
    });
	
    return result;
}

AuthClient.prototype.Sign = function (ucloud_private_key, string_to_sign) {
    return this.Base64(this.HmacSha1(ucloud_private_key, string_to_sign));
}

AuthClient.prototype.Authorize = function (ucloud_public_key, signature) {
    return "UCloud" + " " + ucloud_public_key + ":" + signature;
}

module.exports = AuthClient;
