'use strict'

const Model = require('./Model')

module.exports = class Device extends Model {
  static get label () {
    return '设备'
  }
  static get fields() {
    return {
      _id: { sortable: true },
      os: { label: '操作系统' },
      version: { label: '系统版本' },
      model: { label: '机型' },
      // name: { label: '名称' },
      width: { label: '屏幕宽度(px)' },
      height: { label: '屏幕高度(px)' },
      jpushId: { label: 'jpushId' },
      created_at: { label: '注册时间', sortable: true },
      updated_at: { label: '更新时间', sortable: true },
      actions: false
    }
  }

}