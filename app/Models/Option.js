'use strict'

const Model = require('./Model')

module.exports = class Option extends Model {

  static get fields() {
    return {
      title: { label: '名称',cols: 3 },
      name: { label: 'key', description: '请勿修改',cols: 3, role: 'system' },
      isArray: { label: '是否为数组', type: 'switch', listable: false,cols: 3, role: 'system' },
      isTable: { label: '是否为表格', type: 'switch', listable: false,cols: 3, role: 'system' },
      fields: { label: '字段', type: 'json', listable: false, role: 'system' },
      data: { label: '数据', type: 'object', fields: 'fields', listable: false }

    }
  }

  static async get(name) {
    const model = await Option.findBy({ name })
    if (!model) {
      return null
    }
    return model.data
  }
}
