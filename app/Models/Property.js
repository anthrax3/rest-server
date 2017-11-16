'use strict'

const Model = require('./Model')

module.exports = class Property extends Model {
  static async fields() {
    return {
      // id: { label: 'ID', cols: 3, description: '请确保唯一' },
      name: { label: 'key', cols: 4, description: '请勿修改' },
      title: { label: '名称', cols: 4 },
      isTable: { label: '显示为表格', type: 'switch', listable: false, cols: 4 },
      children: {
        label: '属性列表',
        type: 'array',
        listable: false,

        fields: {
          id: {
            label: 'ID',
            horizontal: true,
            "label-cols": 2,
          },
          name: {
            label: '名称',
            horizontal: true,
            "label-cols": 2,
          },
          title: {
            label: '标题',
            horizontal: true,
            "label-cols": 2,
          },
        },

      },
    }
  }

  static async options(name) {
    const model = await this.findBy({ name })
    const data = model.children.map(v => {
      return {
        text: v.title,
        value: v.title
      }
    })
    data.unshift({
      text: '请选择',
      value: null
    })
    return data
  }

  parent() {
    return this.belongsTo('App/Models/Property', 'parent_id', 'id')
  }
}
