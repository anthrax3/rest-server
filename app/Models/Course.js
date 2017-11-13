'use strict'

const Model = require('./Model')

module.exports = class Course extends Model {

  static get label () {
    return '专辑'
  }

  static async fields() {
    return {
      _id: { sortable: true },
      name: { label: '专栏名称',  cols: 6, block: true },
      cover: { 
        label: '封面图', 
        type: 'image', 
        accept: 'image/*', 
        limit: {width: 240, height: 240, size: 19 *1024}, //19KB
        cols: 6,
      },
      created_at: { label: '创建时间' },
    }
  }

  getCover(val) {
    return this.uploadUri(val)
  }

  user(){
    return this.belongsTo('App/Models/User','user_id', '_id')
  }
}