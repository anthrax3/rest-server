'use strict'

const _ = require('lodash')
const Helpers = use('Helpers')
const Config = use('Config')
const { HttpException } = require('@adonisjs/generic-exceptions')

const User = use('App/Models/User')
const Option = use('App/Models/Option')
const Order = use('App/Models/Order')

const md5 = require('crypto').createHash('md5')

module.exports = class SiteController {

  async hook({ request }) {
    const data = request.all()

  }
}