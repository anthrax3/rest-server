'use strict'

const Model = require('./Model')
const Config = use('Config')

module.exports = class AdminUser extends Model {
  static get hidden() {
    return ['password']
  }
  static get label() {
    return '管理员'
  }
  static async fields() {
    return {
      _id: { sortable: true },
      username: { label: '用户名' },
      password: { label: '密码', type: 'password', listable: false },
      realname: { label: '真实姓名' },
      avatar: { label: '头像', type: 'image', preview: { height: 300 } },
      
      role: { label: '角色', sortable: true },
      created_at: { label: '注册时间', sortable: true },
      sort: { label: '排序', sortable: true },
    }
  }

  getAvatar(val) {
    return this.uploadUri(val)
  }

  static boot() {
    super.boot()
    this.addHook('beforeCreate', 'User.hashPassword')
    this.addHook('beforeUpdate', 'User.hashPassword')
  }
}
