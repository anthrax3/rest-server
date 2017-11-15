/**
 * node-flydrive
 *
 * @license MIT
 * @copyright Johnny Wu <wu-xuesong@qq.com>
 */

const Resetable = require('resetable')

const OSS = require('ali-oss').Wrapper
/**
 * AliOSS driver for using ali-oss with flydriver
 *
 * @constructor
 * @class AliOSS
 */
module.exports = class AliOSS extends OSS {
  constructor(config) {
    super(config)
    this.config = config
  }
  getUrl(path) {
    return this.getObjectUrl(path, this.config.publicUrl)
  }
}
