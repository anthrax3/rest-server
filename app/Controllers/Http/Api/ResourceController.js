'use strict'

const _ = require('lodash')
const Helpers = use('Helpers')
const Config = use('Config')
const Drive = use('Drive')
const inflection = require('inflection')
const { HttpException } = require('@adonisjs/generic-exceptions')

module.exports = class ResourceController {

  async processData(ctx, query, data) {
    const { params, auth } = ctx
    if (query.appends) {
      for (let row of data.rows) {
        await row.fetchAppends(ctx, query.appends)
      }
    }
    return data
  }

  async processQuery({ params, model, auth }, query) {
    switch (params.resource) {
      case 'courses':
        query = await this.buildCoursesQuery(query)
        break;
    }
    return query
  }

  async index(ctx) {
    let { request, Model, query, params, auth } = ctx

    const { page = 1, perPage = 20 } = query
    const offset = (page - 1) * perPage
    const limit = perPage
    query = await this.processQuery(ctx, query)

    let data = await Model.query(query).listFields().skip(offset).limit(limit).fetch()

    data = await this.processData(ctx, query, data)
    const total = await Model.where(query.where).count()
    const lastPage = Math.ceil(total / perPage)
    return {
      lastPage,
      total,
      page,
      perPage,
      data,

    }
  }

  async show({ request, auth, Model, model }) {
    return model
  }

  async buildCoursesQuery(query) {
    const Category = use('App/Models/Category')
    const { category } = query.where || {}
    if (category) {
      const parent = await Category.findBy({ key: category })
      const cats = await Category.where({ parent_id: parent._id }).fetch()
      const ids = _.map(cats.toJSON(), '_id')
      ids.push(parent._id)
      delete query.where.category
      query.where.category_ids = { in: ids }
      
    }
    
    return query
  }

  async collect(ctx) {
    const Action = use('App/Models/Action')
    const { request, auth, Model, model } = ctx
    const action = await model.collections().where({
      user_id: auth.user._id
    }).first()
    if (!action) {
      await model.actions().create({
        name: 'collection',
        user_id: auth.user._id
      })
    } else {
      await action.delete()
    }
    const count = await model.collections().count()
    return {
      status: !action,
      count: count
    }
  }

  async comments({ request, Model, model, query }) {
    return await model.comments().where({
      is_checked: true
    }).orderBy({
      is_top: -1,
      _id: -1,
    }).paginate(query.page, query.perPage || 10)
  }

  async comment({ request, auth, Model, model, query }) {
    const data = request.only(['content', 'comment_id'])
    await validate(data, {
      content: 'required'
    })
    data.user_id = auth.user._id
    return await model.comments().create(data)
  }

}