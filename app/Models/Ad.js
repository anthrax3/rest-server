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
      title: { label: '名称', cols: 4 },
      name: { label: 'key', cols: 4, role: 'system' },
      // type: { label: '类型', cols: 6 },
      items: { 
        label: '内容', 
        type: 'array', 
        listable: false,
        fields: {
          title: {label: '标题'},
          image: {label: '图片', type: 'image'},
          course_id: {label: '专栏', type: 'select', options: await Course.options('_id', 'title')},
          post_id: {label: '一条/书', type: 'select', options: await Post.options('_id', 'title')},
          link: {label: '链接', description: '专栏/语音/链接 任选其一'},
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