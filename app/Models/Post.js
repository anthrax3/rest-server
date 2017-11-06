'use strict'

const Model = use('Model')

module.exports = class Post extends Model {
  static get label () {
    return '一条'
  }
  static get fields() {
    return {
      _id: { sortable: true },
      user_id: { label: '用户', type: 'select2', ref: "user.username" },
      course_id: { label: '专辑', type: 'select2', ref: "course.title" },
      title: { label: '标题' },
      
      image: { label: '图片', type: 'image' },
      

      description: { label: '描述', type: 'html', listable: false },
      content: { label: '详情', type: 'html', listable: false },
      voice: {type: 'audio', listable: false},

      is_free: {label: '是否免费', type: 'switch'},
      created_at: { label: '创建时间' },
    }
  }

  static async choices() {
    return {
      user_id: await use('App/Models/User').pair('id', 'username'),
      course_id: await use('App/Models/Course').pair('id', 'title'),
    }
  }

  course(){
    return this.belongsTo('App/Models/Course','course_id', 'id')
  }

  user(){
    return this.belongsTo('App/Models/User','user_id', 'id')
  }

  properties(){
    return this.referMany('App/Models/Property','id', 'property_ids')
  }

}