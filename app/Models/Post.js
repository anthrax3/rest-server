'use strict'

const Model = require('./Model')
const User = require('./User')
const Course = require('./Course')
const Config = use('Config')

module.exports = class Post extends Model {
  static get label () {
    return '一条'
  }
  static async fields() {
    return {
      _id: { sortable: true, searchable: true },
      user_id: { 
        label: '用户', type: 'select2', ref: "user.username", 
        options: await User.options('id', 'username'), searchable: true
      },
      course_id: { 
        label: '专辑', type: 'select2', ref: "course.title",
        options: await Course.options('id', 'title'), searchable: true
      },
      title: { label: '标题', searchable: true },
      
      image: { label: '图片', type: 'image' },
      
      description: { label: '描述', type: 'textarea', listable: false },
      content: { label: '详情', type: 'html', listable: false },
      voice: {label: '语音', type: 'audio', listable: false},
      is_free: {label: '是否免费', type: 'switch'},
      created_at: { label: '创建时间' },
    }
  }

  getVoice(val){
    return this.uploadUri(val)
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