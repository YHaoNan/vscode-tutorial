var MultiMap = require('multimap');
var user_agent = require('./user_agent.json');

var HttpRequest = function(method, url_path_params, bucket, key, file_path) {
	this.method = method;
	this.url_path_params = url_path_params;

	if (this.url_path_params.indexOf("/uploadhit") > -1) {
		this.type = "UPLOAD_HIT";
	} else if (this.url_path_params.indexOf("?uploads") > -1) {
		this.type = "INIT_MULTI_UPLOAD";
	} else if (this.url_path_params.indexOf("uploadId") > -1 && this.url_path_params.indexOf("partNumber") > -1) {
		this.type = "UPLOAD_PART";
	} else {
		this.type = "PUT_OR_POST";
	}

	this.bucket = bucket;
	this.key = key;
	this.file_path = file_path;
	this.headers = new MultiMap();
	for (var key in user_agent) {
		this.headers.set(key, user_agent[key]);
	}
}

HttpRequest.prototype.setHeader = function(key, value) {
	this.headers.set(key, value);
}

module.exports = HttpRequest;
