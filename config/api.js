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
          append: ['is_buy'],
          with: ['buyable']
        },
        show: {

        }
      }
    },
    orders: {
      auth: true
    },
    actions: {
      auth: true
    },
    comments: {
      query: {
        index: {
          with: ['user'],
        },
        show: {
          
        }
      }
    },
    posts: {
      query: {
        index: {
          with: ['user', 'course'],
          appends: ['is_buy'],
        },
        show: {
          // select: '_id title'.split(' '),
          // with: ['comments'],
          with: ['user', 'course', 'related', 'comments'],
          appends: ['is_buy', 'is_collected', 'is_liked', 'collection_count', 'like_count'],
        }
      }
    },
    courses: {
      query: {
        index: {
          with: ['user'],
          appends: ['is_buy'],
        },
        show: {
          // with: ['comments'],
          with: ['comments','user', 'posts'],
          appends: ['is_buy', 'is_collected', 'is_liked', 'collection_count', 'like_count'],
        }
      }
    }
  }
}