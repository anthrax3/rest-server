'use strict'

const Model = require('./Model')

module.exports = class PayLog extends Model {
  static get label() {
    return '交易记录'
  }
  static get fields() {
    return {
      _id: { sortable: true },
      channel_type: { label: '支付渠道' },
      transaction_id: { label: '订单号' },
      transaction_fee: { label: '交易金额' },
      trade_success: { label: '交易成功', type: 'switch' },
      timestamp: {label: '时间'},
      message_detail: {label: '交易数据', listable: false},
      actions: {
        buttons: {
          edit: false
        }
      }
    }
  }

}