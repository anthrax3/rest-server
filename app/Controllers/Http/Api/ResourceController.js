'use strict'

const _ = require('lodash')
const Helpers = use('Helpers')
const Config = use('Config')
const Drive = use('Drive')
const inflection = require('inflection')
const ObjectID = require('mongodb').ObjectID
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
      case 'posts':
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

    // console.log(Model.listFields);
    data = await this.processData(ctx, query, data)
    if (query.where.category) {

    }
    const total = await Model.where(query.where).count() || 0
    const lastPage = Math.ceil(total / perPage)
    return {
      lastPage,
      total,
      page,
      perPage,
      data,

    }
  }

  async show({ request, auth, Model, model, params }) {
    //修复专栏详情页评论user无法加载的bug
    if (params.resource == 'courses') {
      for (let comment of model.$relations.comments.rows) {
        await comment.load('user')
      }
    }

    //+pv
    if (['courses', 'posts'].includes(params.resource)) {
      await Model.query().where({
        _id: model._id
      }).update({
        $inc: { pv: 1 }
      })
    }
    return model
  }

  async buildCoursesQuery(query) {
    const Category = use('App/Models/Category')
    const { category } = query.where || {}
    let where = {}
    if (category) {
      if (category.length >= 24) {
        where = { _id: ObjectID(category) }
      } else {
        where = { key: category }
      }
      const parent = await Category.query().where(where).with('children.children').firstOrFail()
      delete query.where.category
      query.where.category_ids = { in: parent.getSubIds() }

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
      count: toNumber(count)
    }
  }

  async like(ctx) {
    const Action = use('App/Models/Action')
    const { request, auth, Model, model } = ctx
    const action = await model.likes().where({
      user_id: auth.user._id
    }).first()
    if (!action) {
      await model.actions().create({
        name: 'like',
        user_id: auth.user._id
      })
    } else {
      await action.delete()
    }
    const count = await model.likes().count()
    return {
      status: !action,
      count: toNumber(count)
    }
  }

  async comments({ request, Model, model, query }) {
    return await model.comments().with(['user']).where({
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
    data.is_checked = true
    return await model.comments().create(data)
  }

}