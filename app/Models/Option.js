'use strict'

const Model = require('./Model')
const _ = require('lodash')

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

  static async get(name, lhs, rhs) {
    const model = await Option.findBy({ name })
    if (!model) {
      return null
    }
    let data = model.data
    if (_.isArray(data)) {
      if (lhs) {
        data = _.keyBy(data, lhs)
      }
      if (rhs) {
        data = _.mapValues(data, rhs)
      }
    }
    return data
  }
}
