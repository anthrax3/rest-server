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

    Model.prototype.appendFollowCount = async function() {
      const count = await this.actions().where({
        name: 'follow'
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
      let buyableWhere = [
        {
          buyable_type: this.constructor.name,
          buyable_id: this._id,
        }
      ]
      if (this.constructor.name == 'Post') {
        buyableWhere.push({
          buyable_type: 'Course',
          buyable_id: this.course_id,
        })
      }
      const exist = await user.orderItems().or(buyableWhere).where({
        paid_at: { ne: null }
      }).count()
  
      // console.log(exist);
      return !!exist
    }
  }
}