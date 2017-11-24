'use strict'

const _ = require('lodash')
const inflection = require('inflection')
const Helpers = use('Helpers')
const Config = use('Config')
const Drive = use('Drive')
const { HttpException } = require('@adonisjs/generic-exceptions')

const User = use('App/Models/User')
const Option = use('App/Models/Option')
const Course = use('App/Models/Course')
const Action = use('App/Models/Action')
const Ad = use('App/Models/Ad')

module.exports = class UserController {

  async action({ request, params, auth }) {
    const data = request.only(['name', 'actionable_id', 'actionable_type'])
    const Action = use('App/Models/Action')
    const exist = await auth.user.actions().findBy(data)
    if (!exist) {
      await auth.user.actions().create(data)
    } else {
      await exist.delete()
    }
    return {
      status: !exist,
      count: await Action.where(data).count()
    }
  }

  async orders({ request, query, auth }) {
    const OrderItem = use('App/Models/OrderItem')
    const data = await auth.user.orderItems().where({
      buyable_id: { ne: null }
    }).orderBy('-_id').paginate(query.page, query.perPage || 5)

    for (let row of data.rows) {
      const query = row.morph()
      switch (row.buyable_type) {
        case 'Course':
          query.listFields().with(['user', 'post'])
          break
        case 'Post':
          query.listFields().with(['user', 'course.user'])
          break
      }
      row.buyable = await query.first()
    }
    return data.toJSON()
  }

  async show({ params }) {
    const user = await User.find(params.id)
    await user.fetchAppends()
    return user
  }

  async profile({ auth }) {
    return auth.current.user
  }

  async likes({ auth, query }) {
    return auth.current.user.actions().where({
      name: 'like',
      // actionable_type: inflection.classify(request.input('type'))
    }).with('actionable').paginate(query.page, query.perPage)
  }

  async follows({ auth, query }) {
    return auth.current.user.actions().where({
      name: 'follow',
    }).with('actionable').paginate(query.page, query.perPage)
  }
}