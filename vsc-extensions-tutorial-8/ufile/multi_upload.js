var MultiMap = require('multimap');
var user_agent = require('./user_agent.json');

var MultiUpload = function(method, url_path_params, bucket, key, read_stream, stream_size, mime_type) {
    this.method = method;
    this.url_path_params = url_path_params;

    if (this.url_path_params.indexOf("uploadId") > -1 && this.url_path_params.indexOf("partNumber") > -1) {
        this.type = "MULTI_UPLOAD_PART";
    } else if (this.url_path_params.indexOf("uploadId") > -1 && this.url_path_params.indexOf("newKey") > -1) {
        this.type = "FINISH_MULTI_UPLOAD";
    }

    this.bucket = bucket;
    this.key = key;
    this.read_stream = read_stream;
    this.stream_size = stream_size;
    this.mime_type = mime_type;
    this.headers = new MultiMap();
    for (var key in user_agent) {
        this.headers.set(key, user_agent[key]);
    }
}

MultiUpload.prototype.setHeader = function(key, value) {
    this.headers.set(key, value);
}

module.exports = MultiUpload;
