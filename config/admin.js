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
    vouchers: {
      query: {
        index: {
          select: ['object_id', 'object_type'],
          appends: ['object_title']
        }
      }
    },
    
  }
}