'use strict'

module.exports = class Actions {
  register(Model, options) {
    Model.prototype.actions = function () {
      return this.morphMany('App/Models/Action', 'actionable_type', 'actionable_id')
    }
  
    Model.prototype.collections = function () {
      return this.morphMany('App/Models/Action', 'actionable_type', 'actionable_id').where({
        name: 'collection'
      })
    }

    Model.prototype.likes = function () {
      return this.morphMany('App/Models/Action', 'actionable_type', 'actionable_id').where({
        name: 'like'
      })
    }

    // Model.prototype.follows = function () {
    //   return this.morphMany('App/Models/Action', 'actionable_type', 'actionable_id').where({
    //     name: 'follow'
    //   })
    // }
  }
}