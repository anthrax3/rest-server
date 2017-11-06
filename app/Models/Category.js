'use strict'

const Model = use('Model')

module.exports = class Category extends Model {

  static get label() {
    return '分类'
  }

  static get fields() {
    return {
      _id: { sortable: true },
      parent_id: {
        label: '上级分类', sortable: true, type: 'select', ref: "parent.name",
        
      },
      name: { label: '名称' },
      icon: { label: '图标' },
      sort: { label: '排序', sortable: true },
    }
  }

  static boot() {
    super.boot()
  }

  static async choices() {
    return {
      parent_id: await Category.pair('id', 'name')
    }
  }

  parent() {
    return this.belongsTo('App/Models/Category', 'parent_id', 'id')
  }

}