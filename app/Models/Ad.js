'use strict'

const Model = require('./Model')

const Course = use('App/Models/Course')
const Post = use('App/Models/Post')

module.exports = class Ad extends Model {
  static get label() {
    return '广告'
  }
  static get fields() {
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
          title: { label: '标题' },
          image: { label: '图片', type: 'image' },
          course_id: { label: '点击跳转专栏', type: 'select', options: this.getOptions('course_id') },
          post_id: { label: '点击跳转一条', type: 'select', options: this.getOptions('post_id') },
          book_id: { label: '点击跳转书', type: 'select', options: this.getOptions('book_id') },
          link: { label: '点击跳转链接', description: '专栏/一条/书/链接 任选其一' },
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

  static async buildOptions() {
    this.options = {
      course_id: await Course.fetchOptions('_id', 'title'),
      post_id: await Post.fetchOptions('_id', 'title', { is_book: false }),
      book_id: await Post.fetchOptions('_id', 'title', { is_book: true }),
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