'use strict'

const Model = require('./Model')

module.exports = class Press extends Model {
  static get label () {
    return '轻阅读'
  }
  static async fields() {
    return {
      _id: { sortable: true },
      mobile: { label: '手机号' }
    }
  }

}