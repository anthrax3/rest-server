'use strict'

const Model = require('./Model')

module.exports = class Property extends Model {
  static async fields() {
    return {
      _id: { sortable: true },
      parent_id: { label: '上级', sortable: true, ref:"parent.title"},
      name: { label: '英文名' },
      title: { label: '标题' },
    }
  }

  parent(){
    return this.belongsTo('App/Models/Property', 'parent_id', 'id')
  }
}
