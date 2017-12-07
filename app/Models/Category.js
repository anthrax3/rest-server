'use strict'

const Model = require('./Model')
const ObjectID = require('mongodb').ObjectID

module.exports = class Category extends Model {

  static get objectIDs(){
    return ['_id', 'parent_id']
  }

  static get label() {
    return '分类'
  }

  static get fields() {
    return {
      _id: { sortable: true },
      parent_id: {
        label: '上级分类', sortable: true, type: 'select', ref: "parent.name",
        options: this.getOptions('category_ids'),
        searchable: true, cols: 3
      },
      key: { label: 'KEY', searchable: true, cols: 3 },
      name: { label: '名称', searchable: true, cols: 3 },
      icon: { label: '图标', cols: 3, type: 'image', height: 20 },
      sort: { label: '排序', sortable: true, type: 'number', format: 'Number', cols: 3 },
    }
  }

  static async buildOptions() {
    this.options = {
      category_ids: await Category.treeOptions('_id', 'name'),
    }
  }

  getIcon(val) {
    if (val && val.match(/\.\w+/i)) {
      return this.uploadUri(val)
    }
    return val
  }

  rules() {
    return {
      name: 'required'
    }
  }

  getSubIds() {
    return _.map(
      _.flatMapDeep(
        this.toJSON().children, 
        v => _.map(v.children, '_id').concat(v._id)
      ).concat(this._id), 
      ObjectID
    )
  }

  parent() {
    return this.belongsTo('App/Models/Category', 'parent_id', '_id')
  }

  children() {
    return this.hasMany('App/Models/Category', '_id', 'parent_id')
  }

}