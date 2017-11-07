'use strict'

const Model = require('./Model')

module.exports = class Category extends Model {

  static get label() {
    return '分类'
  }

  static async fields() {
    return {
      _id: { sortable: true },
      parent_id: {
        label: '上级分类', sortable: true, type: 'select', ref: "parent.name",
        options: await Category.options('id', 'name'), format: 'Number'
      },
      name: { label: '名称' },
      icon: { label: '图标' },
      sort: { label: '排序', sortable: true, type: 'number', format: 'Number' },
    }
  }

  rules() {
    return {
      name: 'required'
    }
  }

  parent() {
    return this.belongsTo('App/Models/Category', 'parent_id', 'id')
  }

}