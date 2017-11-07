'use strict'

module.exports = class UEditorController {

  async handle({ request, response }) {
    const { action } = request.all()

    switch(action) {
      case 'config':
        return response.jsonp({
          "imageUrl": "http://localhost/ueditor/php/controller.php?action=uploadimage",
          "imagePath": "/ueditor/php/",
          "imageFieldName": "upfile",
          "imageMaxSize": 2048,
          "imageAllowFiles": [".png", ".jpg", ".jpeg", ".gif", ".bmp"]
        })
        break
      case 'uploadimage':
      case 'uploadscrawl':
      case 'uploadvideo':
      case 'uploadfile':
        return response.jsonp({
          "state": "SUCCESS",
          "url": "/static/img/logo.png",
          "title": "demo.jpg",
          "original": "demo.jpg"
        })
        break
      
    }
  }
}
