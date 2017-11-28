'use strict'

const Model = require('./Model')

module.exports = class Push extends Model {
  static get label() {
    return '推送记录'
  }
  static get fields() {
    return {
      _id: { sortable: true },
      platform: { label: '平台' },
      to: { label: '接收方' },
      msg_id: { label: '短信ID' },
      content: { label: '内容' },
      extra: { label: '附加数据',listable: false },
      data: { label: '响应数据',listable: false },
      success: { label: '是否成功', type: 'switch' },
      created_at: { label: '发送时间' },
      actions: {
        buttons: {
          edit: false
        }
      }
    }
  }


  static async send(to, object)

}