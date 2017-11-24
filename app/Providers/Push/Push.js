'use strict'

const axios = require('axios')
const crypto = require('crypto')
const JPush = require('jpush-sdk')

module.exports = class Push {

  constructor(config) {

    this.config = config
    this.client = JPush.buildClient(config.key, config.secret)
    this.auth = new Buffer(config.key + ':' + config.secret).toString('base64')
    this.http = axios.create({
      baseURL: 'https://api.jpush.cn/v3/',
      headers: {
        Authorization: 'Basic ' + this.auth
      }
    })
  }

  async send(to, content, extra, options = {}) {
    const {
      platform = 'all'
    } = options
    const ret = this.client.push()
      .setPlatform(platform)
      .setAudience(to)
      .setNotification(content)
      .setMessage(content, null, 'text', extra)
      .send((err, res) => {
        if (err) {
          return console.log(err.message);
        }
        const PushModel = use('App/Models/Push')
        PushModel.create({
          platform,
          to,
          msg_id: res.msg_id,
          content,
          extra,
          data: res,
          success: true
        })
        log(res);
      })
  }

}