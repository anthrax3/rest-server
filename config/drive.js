'use strict'

const Helpers = use('Helpers')
const Env = use('Env')

module.exports = {
  /*
  |--------------------------------------------------------------------------
  | Default disk
  |--------------------------------------------------------------------------
  |
  | The default disk is used when you interact with the file system without
  | defining a disk name
  |
  */
  default: 'qiniu',

  disks: {
    /*
    |--------------------------------------------------------------------------
    | Local
    |--------------------------------------------------------------------------
    |
    | Local disk interacts with the a local folder inside your application
    |
    */
    local: {
      root: Helpers.publicPath('uploads'),
      driver: 'local'
    },

    alioss: {
      driver: 'alioss',
      accessKeyId: Env.get('ALIOSS_KEY'),
      accessKeySecret: Env.get('ALIOSS_SECRET'),
      bucket: Env.get('ALIOSS_BUCKET'),
      region: Env.get('ALIOSS_REGION'),
      endpoint: Env.get('ALIOSS_ENDPOINT'),
      publicUrl: Env.get('ALIOSS_PUBLIC_URL')
    },

    qiniu: {
      driver: 'qiniu',
      accessKeyId: Env.get('QINIU_KEY'),
      accessKeySecret: Env.get('QINIU_SECRET'),
      bucket: Env.get('QINIU_BUCKET'),
      region: Env.get('QINIU_REGION', 'Zone_z0'),
      endpoint: Env.get('QINIU_ENDPOINT'),
      publicUrl: Env.get('QINIU_PUBLIC_URL')
    },



    /*
    |--------------------------------------------------------------------------
    | S3
    |--------------------------------------------------------------------------
    |
    | S3 disk interacts with a bucket on aws s3
    |
    */
    s3: {
      driver: 's3',
      key: Env.get('S3_KEY'),
      secret: Env.get('S3_SECRET'),
      bucket: Env.get('S3_BUCKET'),
      region: Env.get('S3_REGION')
    }
  }
}