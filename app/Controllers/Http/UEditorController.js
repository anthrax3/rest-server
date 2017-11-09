'use strict'
const Config = use('Config')
const fs = require('fs')

module.exports = class UEditorController {

  async handle({ request, response }) {
    const { action } = request.all()

    const uploadPath = Config.get('api.upload.path')
    const uploadUri = Config.get('api.upload.url')

    switch (action) {
      case 'config':
        return response.jsonp(Config.get('ueditor'))
        break
      case 'listimage':
        const images = fs.readdirSync(uploadPath)
        return response.jsonp({
          "state": "SUCCESS",
          "list": _.map(images, v => ({url: uploadUri + '/' + v})),
          "start": 0,
          "total": images.length
        })
        break;
      case 'uploadimage':
      case 'uploadscrawl':
      case 'uploadvideo':
      case 'uploadfile':
        const file = request.file('upfile', {
          types: ['image', 'audio', 'video'],
          size: '100mb'
        })
        let fileData = file.toJSON()
        
        const filePath = uploadPath + '/' + fileData.clientName
        const fileUrl = uploadUri + '/' + fileData.clientName

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath)
        }
        await file.move(uploadPath)
        if (!file.moved()) {
          throw new HttpException(file.error(), 400)
        }
        return {
          title: fileData.clientName,
          original: fileData.clientName,
          state: "SUCCESS",
          url: fileUrl
        }
        break

    }
  }
}
