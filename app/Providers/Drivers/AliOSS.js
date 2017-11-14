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
  getUrl(...args){
    return this.getObjectUrl(...args)
  }
}
