'use strict'

const Model = require('./Model')

const Course = use('App/Models/Course')

module.exports = class Ad extends Model {
  static get label () {
    return '广告'
  }
  static async fields() {
    return {
      _id: { sortable: true },
      name: { label: '名称' },
      type: { label: '类型' },
      items: { 
        label: '内容', 
        type: 'array', 
        listable: false,
        fields: {
          title: {label: '标题'},
          image: {label: '图片', type: 'image'},
          course: {label: '专栏', type: 'select', options: await Course.options('_id', 'title')},
          link: {label: '链接', description: '专栏/语音/链接 任选其一'},
          // content: {type: 'html'},
          sort: {label: '排序', type: 'number', formatter: 'Number'}
        },
        
      },
    }
  }

}