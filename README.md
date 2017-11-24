# parse-server-oss-adapter
> parse server file adapter for aliyun OSS

## Installation
npm install --save parse-server-oss-adapter2

## Usage with parse-server

### Using with a config file

<pre>
{
  "appId": 'my_app_id',
  "masterKey": 'my_master_key',
  // other options
  "filesAdapter": {
    "module": "parse-server-oss-adapter",
    "options": {
      "accessKey": "accessKey",
      "secretKey": "secretKey",
      "bucket": "my_bucket",
      // optional:
      "region": 'oss-cn-hangzhou', // default value
      "bucketPrefix": '', // default value
      "directAccess": false, // default value
      "baseUrl": null, // default value
      "baseUrlDirect": false // default value
    }
  }
}
</pre>

### Using with environment variables

Set your environment variables:

<pre>
OOS_ACCESS_KEY=accessKey
OOS_SECRET_KEY=secretKey
OOS_BUCKET=bucketName
</pre>

And update your config / options

<pre>
{
  "appId": 'my_app_id',
  "masterKey": 'my_master_key',
  // other options
  "filesAdapter": "parse-server-oss-adapter"
}
</pre>

### Passing as an instance

<pre>
var OSSAdapter = require('parse-server-oss-adapter');

var ossAdapter = new OSSAdapter('accessKey',
                  'secretKey',
                  'bucket' , {
                    region: 'oss-cn-hangzhou'
                    bucketPrefix: '',
                    directAccess: false,
                    baseUrl: 'http://images.example.com'
                  });

var api = new ParseServer({
    appId: 'my_app',
    masterKey: 'master_key',
    filesAdapter: ossAdapter
})
</pre>

or with an options hash

<pre>
var OSSAdapter = require('parse-server-oss-adapter');

var ossOptions = {
  "accessKey": "accessKey",
  "secretKey": "secretKey",
  "bucket": "my_bucket",
  // optional:
  "region": 'oss-cn-hangzhou', // default value
  "bucketPrefix": '', // default value
  "directAccess": false, // default value
  "baseUrl": null // default value
}

var ossAdapter = new OSSAdapter(ossOptions);

var api = new ParseServer({
  appId: 'my_app',
  masterKey: 'master_key',
  filesAdapter: ossAdapter
})
</pre>

Author: Jianzhong Liu(neter)

Release Date:2017-11-24

*The project is based on zhouu's parse-server-oss-adapter. The orginal project don't support private bucket.*
