'use strict'

const Model = require('./Model')

module.exports = class Sms extends Model {
  static get label() {
    return '短信记录'
  }
  static get fields() {
    return {
      _id: { sortable: true },
      mobile: { label: '手机号' },
      msg_id: { label: '短信ID' },
      data: { label: '响应数据' },
      created_at: { label: '发送时间' },
      actions: {
        buttons: {
          edit: false
        }
      }
    }
  }

}