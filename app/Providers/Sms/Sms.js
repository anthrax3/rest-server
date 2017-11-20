'use strict'

const axios = require('axios')
const crypto = require('crypto')

module.exports = class Sms {

  constructor(config) {

    this.config = config
    this.auth = new Buffer(config.key + ':' + config.secret).toString('base64')
    this.http = axios.create({
      baseURL: 'https://api.sms.jpush.cn/v1/',
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

}