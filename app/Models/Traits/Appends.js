'use strict'

module.exports = class Appends {
  register (Model, options) {
    Model.prototype.appendIsCollected = async function({ auth }) {
      const user = auth.user
      if (!user) {
        return false
      }
      const exist = await user.actions().where({
        name: 'collection',
        actionable_type: this.constructor.name,
        actionable_id: this._id
      }).count()
      return !!exist
    }
    Model.prototype.appendIsLiked = async function({ auth }) {
      const user = auth.user
      if (!user) {
        return false
      }
      const exist = await user.actions().where({
        name: 'like',
        actionable_type: this.constructor.name,
        actionable_id: this._id
      }).count()
      return !!exist
    }
  
    Model.prototype.appendCollectionCount = async function() {
      const count = await this.actions().where({
        name: 'collection'
      }).count()
      return count || 0
    }
  
    Model.prototype.appendLikeCount = async function() {
      const count = await this.actions().where({
        name: 'like'
      }).count()
      return count || 0
    }
  
    Model.prototype.appendIsBuy = async function({ auth }) {
      const user = auth.user
      if (this.is_free) {
        return true
      }
      if (!user) {
        return false
      }
      const exist = await user.orderItems().where({
        buyable_type: this.constructor.name,
        buyable_id: String(this._id),
        paid_at: { ne: null }
      }).count()
  
      // console.log(exist);
      return !!exist
    }
  }
}