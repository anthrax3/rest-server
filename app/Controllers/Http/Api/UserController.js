'use strict'

const _ = require('lodash')
const Helpers = use('Helpers')
const Config = use('Config')
const Drive = use('Drive')
const { HttpException } = require('@adonisjs/generic-exceptions')

const User = use('App/Models/User')
const Option = use('App/Models/Option')
const Course = use('App/Models/Course')
const Action = use('App/Models/Action')
const Ad = use('App/Models/Ad')

module.exports = class AuthController {

  async login({ request, auth }) {

    const data = request.all()
    const { mobile, password } = data
    await validate(data, {
      mobile: 'required',
      password: 'required',
    })
    const user = await User.findBy('mobile', mobile)
    if (!user) {
      throw new HttpException([
        { field: 'mobile', message: '用户不存在' }
      ], 422)
    }
    let token
    try {
      token = await auth.attempt(mobile, password)
    } catch (e) {
      throw new HttpException([
        { field: 'password', message: '密码错误' }
      ], 422)
      token = await auth.generate(user) //for test
    }
    token.user = user
    return token
  }

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
}