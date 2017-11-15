'use strict'

const Model = require('./Model')

module.exports = class Setting extends Model {
  static async fields() {
    return {
      press_description: { label: '首页轻阅读描述', type: 'textarea', cols: 10 },
      book: {
        label: '首页听本书推荐',
        type: 'select',
        options: await use('App/Models/Post').options('_id', 'title', {
          course_id: '5a094dec42788b6da07243d5'
        }),
        cols: 3
      },
      reading: {
        label: '首页深解读推荐', 
        type: 'select', 
        options: await use('App/Models/Reading').options('_id', 'title'),
        cols: 3
      },
      course: {
        label: '首页专栏推荐',
        type: 'select',
        options: await use('App/Models/Course').options('_id', 'name'),
        cols: 3
      },
      course_free: {
        label: '首页限时免费专栏',
        type: 'select',
        options: await use('App/Models/Course').options('_id', 'name'),
        cols: 3
      },
    }
  }
}
