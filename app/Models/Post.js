'use strict'

const Model = require('./Model')
const User = require('./User')
const Course = require('./Course')
const Config = use('Config')

module.exports = class Post extends Model {
  static get objectIDs() {
    return ['course_id', 'property_ids', 'user_id', '_id']
  }
  static get label () {
    return '一条'
  }
  static async fields() {
    return {
      _id: { sortable: true},
      
      
      course_id: { 
        label: '所属专辑', type: 'select2', ref: "course.name", cols: 6,
        options: await Course.options('_id', 'name'), searchable: true,
        sortable: true
      },
      user_id: { 
        label: '所属专家', type: 'select2', ref: "user.username", cols: 6,
        options: await User.options('_id', 'username'), searchable: true,
        sortable: true
      },
      title: { label: '标题', searchable: true ,cols: 6, },
      
      
      is_free: {label: '是否免费', type: 'switch', cols: 6,},
      image: { label: '图片', type: 'image' , cols: 6,},
      voice: {label: '语音', type: 'audio', cols: 6, listable: false},
      
      description: { label: '描述', type: 'textarea', listable: false,  cols: 12,},
      
      content: { label: '详情', type: 'html', listable: false, cols: 6, },
      
      
      created_at: { label: '创建时间' },
    }
  }

  getVoice(val){
    return this.uploadUri(val)
  }

  course(){
    return this.belongsTo('App/Models/Course','course_id', '_id')
  }

  user(){
    return this.belongsTo('App/Models/User','user_id', '_id')
  }

  properties(){
    return this.referMany('App/Models/Property','_id', 'property_ids')
  }

}