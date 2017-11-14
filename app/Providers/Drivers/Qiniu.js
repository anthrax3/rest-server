/**
 * node-flydrive
 *
 * @license MIT
 * @copyright Johnny Wu <wu-xuesong@qq.com>
 */

const Resetable = require('resetable')

const qiniu = require('qiniu')
/**
 * AliOSS driver for using ali-oss with flydriver
 *
 * @constructor
 * @class AliOSS
 */
module.exports = class Qiniu {

  constructor(config) {
    this.config = config
    this.mac = new qiniu.auth.digest.Mac(config.accessKeyId, config.accessKeySecret)
    const putPolicy = new qiniu.rs.PutPolicy({
      scope: config.bucket,
      // expires: 60 * 60 * 24 * 30
    })
    this.uploadToken = putPolicy.uploadToken(this.mac)
  }

  put(key, localFile) {
    const config = new qiniu.conf.Config
    config.zone = qiniu.zone[this.config.region]
    const formUploader = new qiniu.form_up.FormUploader(config);
    const putExtra = new qiniu.form_up.PutExtra();

    return new Promise((resolve, reject) => {
      
      formUploader.putFile(this.uploadToken, key, localFile, putExtra, (err, body, info) => {
        if (err) {
          return reject(err)
        }
        if (info.statusCode == 200) {
          resolve(body)
        } else {
          reject(body)
        }
      });
    })
  }

  getUrl(key) {
    key = key.replace(/^\//, '')
    const bucketManager = new qiniu.rs.BucketManager(this.mac);
    const publicBucketDomain = this.config.publicUrl;
    return bucketManager.publicDownloadUrl(publicBucketDomain, key);
  }
}
