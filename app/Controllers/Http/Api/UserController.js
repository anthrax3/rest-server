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
    const user = auth.current.user
    await user.fetchAppends({}, ['profile_like_count', 'follow_count'])
    return user
  }

  async likes({ auth, query }) {
    const data = await auth.current.user.actions().where({
      name: 'like',
      // actionable_type: inflection.classify(request.input('type'))
    }).paginate(query.page, query.perPage)
    const newRows = []
    for (let row of data.rows) {
      switch (row.actionable_type) {
        case 'Post':
          row.actionable = await row.morphQuery().listFields().with(['course', 'user']).first()
          break
        case 'Course':
          row.actionable = await row.morphQuery().listFields().with(['post', 'user']).first()
          break
      }
    }
    return data

  }

  async collections({ auth, query, params }) {
    const data = await auth.current.user.actions().where({
      name: 'collection',
      actionable_type: inflection.classify(params.type)
    }).paginate(query.page, query.perPage)
    const newRows = []
    for (let row of data.rows) {
      switch (row.actionable_type) {
        case 'Post':
        newRows.push(await row.morphQuery().listFields().with(['course', 'user']).first())
          break
        case 'Course':
        newRows.push(row = await row.morphQuery().listFields().with(['post', 'user']).first())
          break
      }
    }
    data.rows = newRows
    return data

  }

  async follows({ auth, query }) {
    const data = await auth.current.user.actions().where({
      name: 'follow',
    }).paginate(query.page, query.perPage)
    const newRows = []
    for (let row of data.rows) {
      switch (row.actionable_type) {
        case 'Post':
          newRows.push(await row.morphQuery().listFields().with(['course', 'user']).first())
          break
        case 'Course':
          newRows.push(await row.morphQuery().listFields().with(['post', 'user']).first())
          break
        case 'User':
          newRows.push(await row.morphQuery().listFields().first())
          break
      }
    }
    data.rows = newRows
    return data
  }

  async comments({ auth, query, params }) {
    const data = await auth.current.user.comments().with(['user']).where({
      // commentable_type: inflection.classify(params.type)
    }).paginate(query.page, query.perPage)
    for (let row of data.rows) {
      switch (row.commentable_type) {
        case 'Post':
          row.commentable = await row.morphQuery().listFields().with(['course', 'user']).first()
          break
        case 'Course':
          row.commentable = await row.morphQuery().listFields().with(['post', 'user']).first()
          break
      }
    }
    return data

  }


  async resetPassword({request, auth}) {
    const data = request.only([
      'mobile', 'password'
    ])
    const user = await User.findBy({mobile: data.mobile})
    user.password = data.password
    await user.save()
    const token = await auth.generate(user)
    token.user = user
    return token
  }

  async update({request, auth}) {
    const user = auth.current.user
    const data = request.only([
      'position', 
      'invitationCode',

      'username',
      'profession',
      'introduction',
      'birthday',
      'mobile',
    ])
    await validate(data, {
      mobile: 'mobile'
    })
    user.merge(data)
    await user.save()
    return user
  }

}