var fs = require('fs');
var assert = require('assert');
var crypto = require('crypto');
var mime = require('mime');
var _ = require("underscore");

exports.GetFileSize = function(file_path) {
    var stats = fs.statSync(file_path);
    return stats.size;
}

exports.GetMimeType = function(file_path) {
	var ret =  mime.getType(file_path);
    if (!ret) {
        return "application/octet-stream";
    }
    return ret;
}

exports.KeySort = function(params) {
    var keys = _.keys(params);
    var params_sort = {};
    keys.sort();
        _.each(keys, function(key){
        params_sort[key] = params[key];
    });
    return params_sort;
}


UrlsafeBase64Encode = function(buf) {
    var encoded = buf.toString('base64');
    return Base64ToUrlSafe(encoded);
}

Base64ToUrlSafe = function(value) {
    return value.replace(/\//g, '_').replace(/\+/g, '-');
}

SmallSha1 = function(path, callback) {
    var sha1 = crypto.createHash('sha1');

    var rs = fs.createReadStream(path);
    rs.on('data', function(chunk) {
        sha1.update(chunk);
    });

    rs.on('end', function() {
        callback(1, sha1.digest());
    });
}

ChunkSha1 = function(path, callback) {
    var block_size = 4*1024*1024;
    var sha1 = crypto.createHash('sha1');
    var g_sha1 = crypto.createHash('sha1');
    var block = 0;
    var count = 0;

    var rs = fs.createReadStream(path);
    rs.on('data', function(chunk) {
        block += chunk.length;
        sha1.update(chunk);
        if (block == block_size) {
            g_sha1.update(sha1.digest());
            sha1 = crypto.createHash('sha1');
            block = 0;
            count++;
        }
    });

    rs.on('end', function() {
        if (block > 0) {
            g_sha1.update(sha1.digest());
            count++;
        }
        callback(count, g_sha1.digest());
    });
}

exports.UFileEtag = function(path, file_size, callback) {
    assert(file_size >= 0);
    if (file_size <= 4*1024*1024) {
        SmallSha1(path, function(cnt, sha1) {
            var blkcnt = new Buffer(4);
            blkcnt.writeUInt32LE(cnt, 0);
            var con = Buffer.concat([blkcnt, sha1]);
            var hash = UrlsafeBase64Encode(con);
            callback(hash);
        });
    } else {
        ChunkSha1(path, function(cnt, sha1) {
            var blkcnt = new Buffer(4);
            blkcnt.writeUInt32LE(cnt, 0);
            var con = Buffer.concat([blkcnt, sha1]);
            var hash = UrlsafeBase64Encode(con);
            callback(hash);
        });
    }
}
