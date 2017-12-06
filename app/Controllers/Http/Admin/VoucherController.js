'use strict'

const _ = require('lodash')
const crypto = require('crypto')
const Helpers = use('Helpers')
const Config = use('Config')
const Drive = use('Drive')
const Voucher = use('App/Models/Voucher')
const Option = use('App/Models/Option')
const Course = use('App/Models/Course')
const Post = use('App/Models/Post')
const Charge = use('App/Models/Charge')

const { HttpException } = require('@adonisjs/generic-exceptions')
// const BaseController = require('./BaseController')

module.exports = class VoucherController {

  async showGenerateForm({ request, query }) {
    return {
      header: '生成兑换码',
      title: '批量生成兑换码',
      submitText: '生成',
      value: {
        amount: 5
      },
      
      fields: {
        course_ids: {
          label: '专栏',
          type: 'select',
          multiple: true,
          cols: 3,
          options: await Course.fetchOptions('_id', 'title'),
          description: '按住Ctrl或Cmd键可多选, 专栏/语音/书 只能选择其中一种类型'
        },
        post_ids: {
          label: '语音',
          type: 'select',
          multiple: true,
          cols: 3,
          options: await Post.fetchOptions('_id', 'title', {is_book: false})
        },
        book_ids: {
          label: '书',
          type: 'select',
          multiple: true,
          cols: 3,
          options: await Post.fetchOptions('_id', 'title', {is_book: true})
        },
        charge_ids: {
          label: '充值值币',
          type: 'select',
          multiple: true,
          cols: 3,
          options: await Charge.fetchOptions('_id', 'title'),
          description: '只能选择一种'
        },
        amount: {
          label: '生成数量',
          type: 'number',
        }
      }
    }
  }

  async generate({ request, query }) {
    let data = _.mapValues(request.all(), v => {
      if (_.isArray(v)) {
        v = _.filter(v)
        if (_.isEmpty(v)) {
          return null
        }
      }
      return v
    })
    const {
      course_ids, post_ids, book_ids, charge_ids, amount
    } = data
    let object_id = course_ids || post_ids || book_ids || charge_ids
    let object_type = null
    if (course_ids) {
      object_type = 'Course'
    } else if (post_ids || book_ids) {
      object_type = 'Post'
    } else if (charge_ids) {
      object_type = 'Charge'
    }
    await validate({
      amount, object_id, object_type
    }, {
      object_type: 'required',
      object_id: 'required',
      amount: 'required|between:1,1000'
    }, {
      'object_id.required': '请选择对应产品',
      'object_type.required': '请至少选择一种类型',
    }, {
      object_type: '类型',
      amount: '数量'
    })
    const vouchers = []
    let code = null
    for (let k = 0; k < amount; k++) {
      code = String(parseInt(Math.random() * 9999999999))
      vouchers.push({
        object_id,
        object_type,
        code
      })
    }

    await Voucher.createMany(vouchers)
    return {
      vouchers,
      message: `成功生成${vouchers.length}个兑换码`,
      redirect: '/rest/vouchers',
    }
  }

  
}