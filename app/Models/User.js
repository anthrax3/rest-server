'use strict'

const Model = require('./Model')
const Config = use('Config')
const Property = use('App/Models/Property')
const Oauth = use('App/Models/Oauth')
const _ = require('lodash')

module.exports = class User extends Model {
  static get hidden() {
    return ['password']
  }
  static get label() {
    return '用户'
  }
  static get fields() {
    return {
      _id: { sortable: true },
      mobile: { label: '手机号', cols: 4, searchable: true },
      username: { label: '用户名', cols: 4, searchable: true },
      password: { label: '密码', cols: 4, type: 'password', autocomplete: 'new-password',listable: false },
      realname: { label: '真实姓名', cols: 4, searchable: true },
      points: { label: '积分', cols: 4, sortable: true , editable: false},
      type: { label: '身份', cols: 4, type: 'radiolist', options: this.getOptions('type'), searchable: true},
      position: { label: '职位', cols: 4, type: 'select', options: this.getOptions('position'), searchable: true},
      trade: { label: '行业', cols: 4, type: 'select', options: this.getOptions('trade'), searchable: true},
      created_at: { label: '注册时间', sortable: true, searchable: true },
      wx: {
        label: '微信',
        ref: 'wx.nickname',
        editable: false
      },
      oauths: {
        label: '第三方账号',
        type: 'array',
        editable: false,
        listable: false,
        ref: 'oauths._id',
        fields: _.omit(Oauth.fields, ['_id', 'user_id'])
      },
    }
  }

  static async buildOptions() {
    this.options = {
      position: await Property.fetchOptions('position'),
      trade: await Property.fetchOptions('trade'),
      type: [
        {text: '从业者', value: 1},
        {text: '投资者', value: 2},
      ]
    }
  }

  static get listFields() {
    return '_id username nickname avatar'.split(' ')
  }

  getAvatar(val) {
    return this.uploadUri(val)
  }

  static boot() {
    super.boot()
    this.addHook('beforeCreate', 'User.hashPassword')
    this.addHook('beforeUpdate', 'User.hashPassword')
  }

  oauths() {
    return this.hasMany('App/Models/Oauth', '_id', 'user_id')
  }

  wx(){
    return this.hasOne('App/Models/Oauth', '_id', 'user_id').where('type', 'wx')
  }
  qq(){
    return this.hasOne('App/Models/Oauth', '_id', 'user_id').where('type', 'qq')
  }

  actions() {
    return this.hasMany('App/Models/Action', '_id', 'user_id')
  }

  orders() {
    return this.hasMany('App/Models/Order', '_id', 'user_id')
  }

  orderItems() {
    return this.hasMany('App/Models/OrderItem', '_id', 'user_id')
  }

  async buy(data, itemsData) {
    data.no = [
      'A',
      (new Date).valueOf(),
      parseInt(Math.random() * 9999)
    ].join('')
    
    let total = 0

    _.map(itemsData, item => {
      item.title = item.buyable.title
      item.price = item.buyable.price
      item.qty = parseInt(item.qty) || 1
      item.paid_at = null

      total += item.price * item.qty
    })
    
    if (!data.total) {
      data.total = total
    }

    if (!data.title) {
      data.title = itemsData[0].title
    }
    
    data.paid_at = null

    const order = await this.orders().create(data)
    
    const items = await order.items().createMany(itemsData)
    Event.emit('user::buy')
    return order
  }

}
