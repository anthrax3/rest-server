'use strict'

const Model = use('Model')

module.exports = class Press extends Model {
  static get label () {
    return '轻阅读'
  }
  static get fields() {
    return {
      _id: { sortable: true },
      mobile: { label: '手机号' }
    }
  }

}