'use strict'

const axios = require('axios')
const crypto = require('crypto')

module.exports = class JPush {

  constructor(config) {

    this.config = config
    this.auth = new Buffer(config.key + ':' + config.secret).toString('base64')
    this.http = axios.create({
      baseURL: 'https://api.jpush.cn/v3/',
      headers: {
        Authorization: 'Basic ' + this.auth
      }
    })
  }

  async post(...args) {
    let data
    try {
      const res = await this.http.post(...args)
      data = res.data
    } catch (e) {
      data = e.response.data
    }
    return data
  }

  async sendCode(mobile) {
    return this.post('codes', {
      mobile,
      temp_id: this.config.templates.code
    })
  }

  async verify(msgId, code) {
    if (code === '3042') {
      // return true
    }
    const ret = await this.post(`codes/${msgId}/valid`, {
      code
    })
    console.log('sms: ', ret);
    return ret.is_valid || ret.error.code == 50012
  }

}