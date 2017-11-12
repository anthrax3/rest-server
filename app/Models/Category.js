'use strict'

const Model = require('./Model')

module.exports = class Category extends Model {

  static get objectIDs(){
    return ['_id', 'parent_id']
  }

  static get label() {
    return '分类'
  }

  static async fields() {
    return {
      _id: { sortable: true },
      parent_id: {
        label: '上级分类', sortable: true, type: 'select', ref: "parent.name",
        options: await Category.treeOptions('_id', 'name'),
        searchable: true, cols: 3
      },
      name: { label: '名称', searchable: true, cols: 3 },
      icon: { label: '图标', cols: 3 },
      sort: { label: '排序', sortable: true, type: 'number', format: 'Number', cols: 3 },
    }
  }

  rules() {
    return {
      name: 'required'
    }
  }

  parent() {
    return this.belongsTo('App/Models/Category', 'parent_id', '_id')
  }

}