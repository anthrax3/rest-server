const Validator = use('Validator')
const Config = use('Config')
const Helpers = use('Helpers')
const Antl = use('Antl')
const { HttpException } = require('@adonisjs/generic-exceptions')
const _ = require('lodash')
const inflection = require('inflection')

global._ = _
global.inflection = inflection
global.m = name => use('App/Models/' + name)
global.validate = async function (data, rules, messages, labels) {
  messages = Object.assign({}, Antl.list('validations'), messages)
  labels = Object.assign({}, Antl.list('labels'), labels)
  const validation = await Validator.validate(data, rules, messages)
  if (validation.fails()) {
    let errorMessages = _.each(validation.messages(), v => {
      v.message = String(v.message).replace(v.field, labels[v.field])
      // console.log(v);
      return v
    })
    throw new HttpException(errorMessages, 422)
  }
}

global.log = val => {
  console.log(JSON.stringify(val, null, 2));
}

global.toNumber = (val, defaultValue = 0) => Number(val) || defaultValue

global.add = (...args) => Number(_.sum(_.map(args, toNumber)).toFixed(2))