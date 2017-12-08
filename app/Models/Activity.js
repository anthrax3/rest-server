'use strict'

const Model = require('./Model')
const Course = use('App/Models/Course')
const Post = use('App/Models/Post')

module.exports = class Push extends Model {
  static get label() {
    return '推送记录'
  }
  static get fields() {
    return {
      _id: { sortable: true },
      title: { label: '标题' },
      image: { label: '图片', type: 'image' },
      description: { label: '描述' },
      course_id: { label: '点击跳转专栏', type: 'select', options: this.getOptions('course_id') },
      post_id: { label: '点击跳转一条', type: 'select', options: this.getOptions('post_id') },
      book_id: { label: '点击跳转书', type: 'select', options: this.getOptions('book_id') },
      link: { label: '点击跳转链接', description: '专栏/一条/书/链接 任选其一' },
      content: { label: '内容' },
      // is_push: { label: '发起推送', type: 'switch', listable: false },
      extra: { label: '附加数据',listable: false },
      created_at: { label: '发送时间' },
      actions: {
        
      }
    }
  }

  static boot() {
    super.boot()
    this.addGlobalScope((query) => {
      query.sort('-_id')
    })
    // this.addHook('afterSave', async(model) => {
    //   if (model.is_push) {
    //     model.sendPush({registration_id: ['1114a89792908f6e03a']})
    //   }
    // })
  }

  static async buildOptions() {
    this.options = {
      course_id: await Course.fetchOptions('_id', 'title'),
      post_id: await Post.fetchOptions('_id', 'title', { is_book: false }),
      book_id: await Post.fetchOptions('_id', 'title', { is_book: true }),
    }
  }


  sendPush(to, title, extra) {
    const Push = use('Push')
    if (!title) {
      title = this.title
    }
    Push.send(to, title, {
      winName: 'user/win',
      pageParams: {
        title: '我的消息', 
        frame: 'activities',
        action: false
      }
    })
  }

}