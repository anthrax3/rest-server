'use strict'

const _ = require('lodash')
const Helpers = use('Helpers')
const Config = use('Config')
const Drive = use('Drive')
const Post = use('App/Models/Post')
const Option = use('App/Models/Option')

const { HttpException } = require('@adonisjs/generic-exceptions')
const BaseController = require('./ResourceController')

module.exports = class PostController extends BaseController {

  async weeklyBook(){
    const recommend = await Option.get('recommend')
    return await Post.query().listFields().where({
      _id: recommend.book
    }).first()
  }
  
}