'use strict'

const Model = require('./Model')

module.exports = class Charge extends Model {
  static get label () {
    return '充值金额'
  }
  static get fields() {
    return {
      _id: { sortable: true },
      title: { label: '名称', required: true },
      price: { label: '价格(元)', required: true },
      amount: { label: '兑换值币(点)', required: true, formatter: 'Number' },
      extra: { label: '赠送值币(点)' },
    }
  }

}