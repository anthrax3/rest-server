'use strict'

const Model = require('./Model')

module.exports = class Oauth extends Model {
  static get label () {
    return '第三方账号'
  }
  static async fields() {
    return {
      _id: { sortable: true },
      user_id: { label: '用户', ref: 'user.username', sortable: true},
      type: {label: '类型'},
      avatar: {type: 'image'},
      created_at: {label: '创建时间'},
    }
  }

}