'use strict'

const Model = require('./Model')

const Course = use('App/Models/Course')
const Post = use('App/Models/Post')

module.exports = class Ad extends Model {
  static get label () {
    return '广告'
  }
  static async fields() {
    return {
      _id: { sortable: true },
      name: { label: '名称', cols: 6 },
      type: { label: '类型', cols: 6 },
      items: { 
        label: '内容', 
        type: 'array', 
        listable: false,
        fields: {
          title: {label: '标题'},
          image: {label: '图片', type: 'image'},
          course: {label: '专栏', type: 'select', options: await Course.options('_id', 'name')},
          post: {label: '一条', type: 'select', options: await Post.options('_id', 'title')},
          link: {label: '链接', description: '专栏/语音/链接 任选其一'},
          // content: {type: 'html'},
          // sort: {label: '排序', type: 'number', formatter: 'Number'}
        },
        
      },
      actions: {
        buttons: {
          show: false,
          remove: false
        }
      }
    }
  }

  getItems(val) {
    if (!val) {
      return val
    }
    val.forEach(v => {
      v.image = this.uploadUri(v.image)
    })
    return val
  }

}