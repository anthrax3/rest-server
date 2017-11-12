'use strict'

const Model = require('./Model')
const Config = use('Config')

class User extends Model {
  static get hidden() {
    return ['password']
  }
  static get label() {
    return '用户'
  }
  static async fields() {
    return {
      _id: { sortable: true },
      mobile: { label: '手机号', cols: 3 },
      username: { label: '用户名', cols: 3 },
      password: { label: '密码', cols: 3, type: 'password', autocomplete: 'new-password' },

      realname: { label: '真实姓名', cols: 3 },
      
      
      points: { label: '积分', cols: 3, sortable: true , editable: false},
      avatar: { label: '头像', cols: 3, type: 'image', preview: { height: 120 } },
      created_at: { label: '注册时间', sortable: true },
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

module.exports = User
