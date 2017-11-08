'use strict'

const Model = require('./Model')
const Config = use('Config')

class User extends Model {
  static get label() {
    return '用户'
  }
  static async fields() {
    return {
      _id: { sortable: true },
      mobile: { label: '手机号1' },
      username: { label: '用户名' },
      realname: { label: '真实姓名' },
      avatar: { label: '头像', type: 'image', preview: { height: 300 } },
      points: { label: '积分', sortable: true },
      created_at: { label: '注册时间', sortable: true },
      sort: { label: '排序', sortable: true },
    }
  }

  getAvatar(val) {
    if (val.match(/^http/i)) {
      return val
    }
    return Config.get('api.upload.url') + '/' + val
  }

  static boot() {
    super.boot()

    /**
     * A hook to hash the user password before saving
     * it to the database.
     *
     * Look at `app/Models/Hooks/User.js` file to
     * check the hashPassword method
     */
    this.addHook('beforeCreate', 'User.hashPassword')
  }

  /**
   * A relationship on tokens is required for auth to
   * work. Since features like `refreshTokens` or
   * `rememberToken` will be saved inside the
   * tokens table.
   *
   * @method tokens
   *
   * @return {Object}
   */
  tokens() {
    return this.hasMany('App/Models/Token')
  }
}

module.exports = User
