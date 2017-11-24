'use strict';
// OSSAdapter
//
// Stores Parse files in aliyun OSS.

var OSS = require('ali-oss').Wrapper;
const DEFAULT_OSS_REGION = "oss-cn-hangzhou";

function requiredOrFromEnvironment(options, key, env) {
  options[key] = options[key] || process.env[env];
  if (!options[key]) {
    throw `OSSAdapter requires option '${key}' or env. variable ${env}`;
  }
  return options;
}

function fromEnvironmentOrDefault(options, key, env, defaultValue) {
  options[key] = options[key] || process.env[env] || defaultValue;
  return options;
}

function optionsFromArguments(args) {
  let options = {};
  let accessKeyOrOptions = args[0];
  if (typeof accessKeyOrOptions == 'string') {
    options.accessKey = accessKeyOrOptions;
    options.secretKey = args[1];
    options.bucket = args[2];
    let otherOptions = args[3];
    if (otherOptions) {
      options.bucketPrefix = otherOptions.bucketPrefix;
      options.region = otherOptions.region;
      options.directAccess = otherOptions.directAccess;
      options.baseUrl = otherOptions.baseUrl;
      options.baseUrlDirect = otherOptions.baseUrlDirect;
    }
  } else {
    options = accessKeyOrOptions || {};
  }
  options = requiredOrFromEnvironment(options, 'accessKey', 'OSS_ACCESS_KEY');
  options = requiredOrFromEnvironment(options, 'secretKey', 'OSS_SECRET_KEY');
  options = requiredOrFromEnvironment(options, 'bucket', 'OSS_BUCKET');
  options = fromEnvironmentOrDefault(options, 'bucketPrefix', 'OSS_BUCKET_PREFIX', '');
  options = fromEnvironmentOrDefault(options, 'region', 'OSS_REGION', DEFAULT_OSS_REGION);
  options = fromEnvironmentOrDefault(options, 'directAccess', 'OSS_DIRECT_ACCESS', false);
  options = fromEnvironmentOrDefault(options, 'baseUrl', 'OSS_BASE_URL', null);
  options = fromEnvironmentOrDefault(options, 'baseUrlDirect', 'OSS_BASE_URL_DIRECT', false);

  return options;
}

// Creates an OSS session.
// Providing aliyun access, secret keys and bucket are mandatory
// Region will use sane defaults if omitted
function OSSAdapter() {
  var options = optionsFromArguments(arguments);
  this._region = options.region;
  this._bucket = options.bucket;
  this._bucketPrefix = options.bucketPrefix;
  this._directAccess = options.directAccess;
  this._baseUrl = options.baseUrl;
  this._baseUrlDirect = options.baseUrlDirect;

  let ossOptions = {
    accessKeyId: options.accessKey,
    accessKeySecret: options.secretKey,
    bucket: this._bucket,
    region: this._region
  };
  this._ossClient = new OSS(ossOptions);
  this._ossClient.listBuckets().then((val)=> {
    var bucket = val.buckets.filter((bucket)=> {
      return bucket.name == this._bucket
    }).pop();

    this._hasBucket = !!bucket;
  });
}

OSSAdapter.prototype.createBucket = function () {
  if (this._hasBucket) {
    return Promise.resolve();
  } else {
    return this._ossClient.putBucket(this._bucket, this._region).then(()=> {
      this._hasBucket = true;
      if (this._directAccess) {
        return this._ossClient.putBucketACL(this._bucket, this._region, 'public-read');
      }
      return Promise.resolve();
    }).then(()=> {
      return this._ossClient.useBucket(this._bucket, this._region);
    });
  }
};

// For a given config object, filename, and data, store a file in OSS
// Returns a promise containing the OSS object creation response
OSSAdapter.prototype.createFile = function (filename, data, contentType) {

  let options = {};
  if (contentType) {
    options.headers = {'Content-Type': contentType}
  }
  return this.createBucket().then(()=> {

    return this._ossClient.put(this._bucketPrefix + filename, new Buffer(data), options);

  });
};

OSSAdapter.prototype.deleteFile = function (filename) {
  return this.createBucket().then(()=> {
    return this._ossClient.delete(this._bucketPrefix + filename);
  });
};

// Search for and return a file if found by filename
// Returns a promise that succeeds with the buffer result from OSS
OSSAdapter.prototype.getFileData = function (filename) {
    console.log("进入getFileData");
  return this.createBucket().then(()=> {
    return this._ossClient.get(this._bucketPrefix + filename).then((val)=> {
      return Promise.resolve(val.content);
    }).catch((err)=> {
      return Promise.reject(err);
    });
  });
};

// Generates and returns the location of a file stored in OSS for the given request and filename
// The location is the direct OSS link if the option is set, otherwise we serve the file through
// parse-server
OSSAdapter.prototype.getFileLocation = function (config, filename) {

  //return "https://neter-qd-tellstorytochild.oss-cn-qingdao.aliyuncs.com/a1bd44d0441359a49d1bbedc571cb5a9_nVZaIqKpPv_My5yFudRyN_2017-11-24_17-44-18.caf?Expires=1511522071&OSSAccessKeyId=TMP.AQGbsStsf4u0ClSi_A9aFK8oiMvg_ufu8iR4Gm_8pzAIdGFxOlM_H5JRFLgoADAtAhQlCP7zL2QKNiWddRnk8uOWNpkGuwIVAJxpn8_Kqn2GpzQfYIG4DkOqjWev&Signature=TDJ9aR7jSxk0be5ZaMxu8Nqhi1I%3D";
  var url = this._ossClient.signatureUrl(this._bucketPrefix + filename);
  url = url.replace(/^http:/, "https:");//将http替换为https
  //console.log("--------------");
  //console.log(url);
  //console.log("--------------");
  return url;

/*
  if (this._directAccess) {
    if (this._baseUrl && this._baseUrlDirect) {
      return `${this._baseUrl}/${filename}`;
    } else if (this._baseUrl) {
      return `${this._baseUrl}/${this._bucketPrefix + filename}`;
    } else {
      return `https://${this._bucket}.${this._region}.aliyuncs.com/${this._bucketPrefix
      + filename}`;
    }
  }
  return (config.mount + '/files/' + config.applicationId + '/' + encodeURIComponent(filename));
*/
};

module.exports = OSSAdapter;
module.exports.default = OSSAdapter;
