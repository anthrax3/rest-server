'use strict'

const Model = require('./Model')

module.exports = class Voucher extends Model {
  static get label() {
    return '兑换码'
  }
  static get fields() {
    return {
      _id: { sortable: true },
      code: { label: '代码' },
      object_id: { label: '产品' },
      user_id: { label: '使用人' },
      used_at: { label: '使用时间' },
      mobile: { label: '手机号' },
      source: { label: '来源' },
      
      actions: {
        buttons: {
          edit: false
        }
      }
    }
  }

  object () {
    return this.morphTo('App/Models', 'object_type', '_id', 'object_id')
  }

}