'use strict'

const Model = require('./Model')
const Config = use('Config')
const Property = use('App/Models/Property')
const Oauth = use('App/Models/Oauth')
const _ = require('lodash')

module.exports = class User extends Model {
  static get computed() {
    return super.computed.concat([
      'is_user',
    ])
  }
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
      password: { label: '密码', cols: 4, type: 'password', autocomplete: 'new-password', listable: false },
      realname: { label: '真实姓名', cols: 4, searchable: true },
      // points: { label: '积分', cols: 4, sortable: true, editable: false },
      balance: { label: '值币', cols: 4, sortable: true, editable: true },
      type: { label: '身份', cols: 4, type: 'radiolist', options: this.getOptions('type'), searchable: true },
      role_id: { label: '角色', cols: 4, type: 'radiolist', options: this.getOptions('role_id'), searchable: true },
      position: { label: '职位', cols: 4, type: 'select', options: this.getOptions('position'), searchable: true },
      profession: { label: '行业', cols: 4, type: 'select', options: this.getOptions('profession'), searchable: true },
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
      profession: await Property.fetchOptions('profession'),
      role_id: [
        { text: '专家', value: 1 },
        { text: '用户', value: 2 },
      ],
      type: [
        { text: '从业者', value: 1 },
        { text: '投资者', value: 2 },
      ]
    }
  }

  getRoleId(value){
    return value || 2
  }

  

  static get listFields() {
    return '_id username nickname avatar'.split(' ')
  }

  getAvatar(val) {
    return this.uploadUri(val)
  }

  static boot() {
    super.boot()

    this.addTrait('Appends')
    // this.addTrait('Actions')
    this.addHook('beforeCreate', 'User.hashPassword')
    this.addHook('beforeUpdate', 'User.hashPassword')
  }

  oauths() {
    return this.hasMany('App/Models/Oauth', '_id', 'user_id')
  }

  wx() {
    return this.hasOne('App/Models/Oauth', '_id', 'user_id').where('type', 'wx')
  }
  qq() {
    return this.hasOne('App/Models/Oauth', '_id', 'user_id').where('type', 'qq')
  }

  actions() {
    return this.hasMany('App/Models/Action', '_id', 'user_id')
  }
  
  comments() {
    return this.hasMany('App/Models/Comment', '_id', 'user_id')
  }
  

  orders() {
    return this.hasMany('App/Models/Order', '_id', 'user_id')
  }

  orderItems() {
    return this.hasMany('App/Models/OrderItem', '_id', 'user_id')
  }

  getBalance(val){
    return Number(val) || 0
  }

  async buy(data, itemsData) {
    const { payment_type } = data
    
    data.no = [
      'A',
      (new Date).valueOf(),
      parseInt(Math.random() * 9999)
    ].join('')

    let total = 0

    for (let item of itemsData) {
      const buyable = await use('App/Models/' + item.buyable_type).find(item.buyable_id)
      if (!buyable) {
        throw new Error('无效的产品')
      }
      // item.buyable_id = buyable._id
      item.title = buyable.title
      item.price = buyable.price
      if (buyable.buyData) {
        item.data = buyable.buyData
      }
      item.qty = parseInt(item.qty) || 1
      item.paid_at = null
      item.user_id = this._id
      total += item.price * item.qty
    }

    if (!data.total) {
      data.total = total
    }

    if (!data.title) {
      data.title = itemsData[0].title
    }

    data.paid_at = null

    if (data.payment_type == 'WALLET') {
      if (this.getBalance(this.balance) < data.total) {
        throw new Error('余额不足,请充值')
      }
    }

    // const exist = await this.orders().where({
    //   paid_at: null
    // }).count()
    // throw new Error('您有未完成的订单,暂时无法下单')

    const order = await this.orders().create(data)

    const items = await order.items().createMany(itemsData)
    use('Event').emit('user::buy', order)
    return order
  }

  async payViaBalance(order) {
    await this.addBalance('buy', -order.total, {
      order_id: order._id,
      title: order.title
    })
    await order.paid()
    return true
  }

  static async register(data) {
    data = _.defaults({}, {
      role_id: 2, //普通用户
      avatar: 'http://ww1.sinaimg.cn/large/6aedb651gy1fg019galomj207s07sdg5.jpg',

    }, data)
    if (!data.username && data.mobile) {
      data.username = 'User' + String(data.mobile).substr(5)
    }
    const user = new User()
    user.fill(data)
    await user.save()
    return user
  }

  walletLogs() {
    return this.hasMany('App/models/WalletLog', '_id', 'user_id')
  }

  async addBalance(type, amount, data = null) {
    const log = await this.walletLogs().create({
      type, amount
    })
    use('Event').emit('user::addBalance', log)
    return this.balance
  }

  getIsUser() {
    return !this.role_id || this.role_id == 2
  }

  // getLikeCount(val){
  //   return val || 0
  // }

  // getFollowCount(val){
  //   return val || 0
  // }

  // getNoticeCount(val){
  //   return val || 0
  // }

  async appendIsFollowed({auth}) {
    const user = auth.user
    if (!user) {
      return false
    }
    return await user.actions().where({
      name: 'follow',
      actionable_type: this.constructor.name,
      actionable_id: this._id
    }).count()
  }


}
