'use strict'

const _ = require('lodash')
const crypto = require('crypto')
const Helpers = use('Helpers')
const Config = use('Config')
const Drive = use('Drive')
const { HttpException } = require('@adonisjs/generic-exceptions')

const User = use('App/Models/User')
const Oauth = use('App/Models/Oauth')
const Option = use('App/Models/Option')
const Course = use('App/Models/Course')
const Reading = use('App/Models/Reading')
const Ad = use('App/Models/Ad')

module.exports = class SiteController {
  async index() {
    return {
      version: 2,
      status: 'ok'
    }
  }

  async upload({ request, response, auth }) {

    const fileData = await global.upload(request)
    return {
      title: fileData.clientName,
      state: "SUCCESS",
      url: fileUrl.url
    }
  }

  async captcha({ request, auth }) {
    const Sms = use('App/Models/Sms')
    const SmsSender = use('Sms')
    const moment = require('moment')
    const data = request.all()
    const { mobile, captcha, isLogin, isChangePassword } = data
    await validate(data, {
      mobile: 'required|mobile'
    })
    const user = await User.findBy({ mobile })
    //获取最近的一条有效短信
    const sms = await Sms.where({
      mobile,
      created_at: {
        gte: moment().subtract(1, 'minute')
      }
    }).orderBy('-_id').first()
    if (captcha) {
      //校验验证码
      if (!sms) {
        throw new HttpException('请先发送验证码', 400)
      }
      //开始校验
      const valid = await SmsSender.verify(sms.msg_id, captcha)
      if (!valid) {
        // console.log(sms.toJSON(), captcha);
        throw new HttpException('验证码无效', 400)
      }
      //校验成功
      if (isLogin) {
        if (!user) {
          throw new HttpException('用户不存在', 400)
        }
        const token = await auth.generate(user)
        return {
          code: 200,
          token: token.token,
          user
        }
      } else if (isChangePassword) {
        if (!user) {
          throw new HttpException('用户不存在', 400)
        }
        return {
          code: 200
        }
      }
      return {
        code: 200
      }
    } else {
      //发送验证码
      if (sms) {
        throw new HttpException('操作太快', 403)
      }
      const ret = await SmsSender.sendCode(mobile)
      if (!ret.msg_id) {
        throw new HttpException('发送失败', 500)
      }
      await Sms.create({
        mobile,
        msg_id: ret.msg_id,
        data: ret
      })
      return {
        code: 200,
        msg: '发送成功'
      }
    }
  }

  async checkMobileExist({ request }) {
    const { mobile } = request.all()
    const user = await User.findBy({ mobile })
    return {
      code: user ? 1 : 2
    }
  }

  //游客注册
  async guest({ request, auth }) {
    const { did } = request.all()
    await validate(request.all(), {
      did: 'required'
    })
    const user = await User.findOrCreate({
      did
    }, {
        did,
        role_id: 1,
        username: 'guest' + crypto.randomBytes(3).toString('hex')
      })
    const token = await auth.generate(user)
    token.user = user
    return token
  }

  async register({ request, auth }) {
    const data = request.all()
    const { mobile, password } = data
    await validate(data, {
      mobile: 'required|mobile',
      password: 'required',
    })
    let user = await User.findBy('mobile', mobile)
    if (user) {
      throw new HttpException([
        { field: 'mobile', message: '用户已存在' }
      ], 422)
    }
    try {
      user = await User.register({
        mobile,
        password
      })
    } catch (e) {
      throw new HttpException('注册失败', 500)
    }
    const token = await auth.generate(user)
    token.user = user
    return token
  }

  async authLogin({ request, auth }) {
    const { openid } = request.all()
    const oauth = await Oauth.findBy({ openid })
    if (!oauth) {
      return {}
    }
    const user = await oauth.user().first()
    const token = await auth.generate(user)
    token.user = user
    return token
  }

  async authRegister({ request, auth }) {
    const data = request.all()
    const { openid, type } = data
    const oauth = await Oauth.findOrCreate({ 
      openid
    }, data)
    
    const user = await User.create({
      username: type + crypto.randomBytes(4).toString('hex'),
      role_id: 2
    })
    oauth.user_id = user._id
    await oauth.save()
    const token = await auth.generate(user)
    token.user = user
    return token
  }

  async login({ request, auth }) {

    const data = request.all()
    const { mobile, password } = data
    await validate(data, {
      mobile: 'required|mobile',
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

  async advices() {
    const category = await use('App/Models/Category').findBy({ key: 'feedback' })
    return await category.children().fetch()
  }

  async addDevice({ request, auth }) {
    const Device = m('Device')
    const data = request.all()
    await validate(data, {
      did: 'required'
    })
    let model = await Device.findBy('did', data.did)
    if (!model) {
      model = new Device()
    }
    model.merge(data)
    if (auth.user) {
      model.user_id = auth.user._id
    }
    await model.save()
    return model
  }

  async properties() {
    const properties = await m('Property').fetch()
    return _.mapValues(_.keyBy(properties.toJSON(), 'name'), 'children')
  }

  async contact() {
    const site = await m('Option').get('site')
    return _.pick(site, ['wechat', 'email'])
  }

}