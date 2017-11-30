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
    "APPLE_PAY": {
      "title": "支付",
      "image": "https://ws1.sinaimg.cn/large/6aedb651gy1fhyjj82k35j201o01oq2p.jpg"
    }
  }
}