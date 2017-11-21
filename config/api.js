'use strict'

const Env = use('Env')
const Helpers = use('Helpers')

module.exports = {
  url: Env.get('API_URL', Env.get('APP_URL')),
  upload: {
    types: ['image', 'audio', 'video'],
    size: '100mb'
  },
  resources: {
    order_items: {
      auth: true,
      query: {
        index: {
          // with: ['buyable']
        }
      }
    },
    orders: {
      auth: true
    },
    actions: {
      auth: true
    },
    courses: {
      query: {
        index: {
          with: ['user'],
          appends: ['is_buy'],
        },
        show: {
          with: ['user', 'posts', 'comments'],
          appends: ['is_buy'],
        }
      }
    }
  }
}