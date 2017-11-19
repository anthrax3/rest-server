'use strict'

const Order = exports = module.exports = {}

Order.paid = async (order) => {
  const now = new Date
  order.paid_at = now
  order.items.forEach(item => {
    item.started_at = now
    item.expired_at = new Date(now.valueOf() + 365 * 86400000)
    item.paid_at = now
    item.save()
  })
  order.save()
}
