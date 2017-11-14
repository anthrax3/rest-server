'use strict'

const Env = use('Env')
const Helpers = use('Helpers')

module.exports = {
  url: Env.get('API_URL', Env.get('APP_URL')),
  upload: {
    url: Env.get('UPLOAD_URL'),
    path: ''
  },
}