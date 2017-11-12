'use strict'

const Model = require('./Model')

module.exports = class Property extends Model {
  static async fields() {
    return {
      id: { label: 'ID', cols: 4, description: '请确保唯一' },
      name: { label: '英文名', cols: 4 },
      title: { label: '名称', cols: 4 },
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

  parent() {
    return this.belongsTo('App/Models/Property', 'parent_id', 'id')
  }
}
