'use strict'

const Model = require('./Model')

module.exports = class Option extends Model {

  static async fields() {
    return {
      name: { label: '名称', description: '请勿修改' },
      title: { label: '描述' },
      fields: { label: '字段', type: 'json', listable: false },
      isArray: { label: '是否为数组', type: 'switch', listable: false },
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
