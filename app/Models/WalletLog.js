'use strict'

const Model = require('./Model')

module.exports = class WalletLog extends Model {
  static get label () {
    return '钱包记录'
  }
  static get fields() {
    return {
      _id: { sortable: true },
      user_id: {label: '用户', ref: "user.username"},
      type: { label: '类型', type: 'select', options: [
        {text: '请选择'},
        {text: '充值', value: 'charge'},
        {text: '购买', value: 'buy'},
      ],searchable: true },
      amount: { label: '金额(值币)' },
      balance: { label: '余额(值币)' },
      data: { label: '数据', listable: false },
      created_at: {label: '时间'}
    }
  }

  static boot() {
    super.boot()
    this.addHook('afterCreate', async (model) => {
      const user = await model.user().first()
      user.balance = Number(user.balance) + Number(model.amount)
      model.balance = user.balance
      await model.save()
      await user.save()
      
      
    })
  }

  user(){
    return this.belongsTo('App/Models/User', 'user_id', '_id')
  }

}