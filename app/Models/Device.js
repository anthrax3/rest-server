'use strict'

const Model = require('./Model')

module.exports = class Device extends Model {
  static get label () {
    return '设备'
  }
  static async fields() {
    return {
      _id: { sortable: true },
      os: { label: '操作系统' },
      version: { label: '系统版本' },
      model: { label: '机型' },
      // name: { label: '名称' },
      width: { label: '屏幕宽度(px)' },
      height: { label: '屏幕高度(px)' },
      created_at: { label: '注册时间' },
    }
  }

}