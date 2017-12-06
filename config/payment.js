'use strict'

const Env = use('Env')

module.exports = {
  default: 'beecloud',

  beecloud: {
    key: Env.get('BEECLOUD_KEY'),
    secret: Env.get('BEECLOUD_SECRET'),
  },

  channels: {
    "ALI_APP": {
      "title": "支付宝",
      "image": "http://ww1.sinaimg.cn/large/6aedb651gy1ffu9ganyvpj203c03ct8l.jpg"
    },
    "WX_APP": {
      "title": "微信支付",
      "image": "http://ww1.sinaimg.cn/large/6aedb651gy1ffu9gn291bj203c03cdfq.jpg"
    },
  }
}