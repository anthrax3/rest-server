const Route = use('Route')

//不需要登录
Route.group(() => {

  Route.post('login', 'SiteController.login')
  

}).prefix('admin/api').middleware([
  'authenticator:adminJwt'
])


//需要登录
Route.group(() => {

  Route.post('upload', 'SiteController.upload')
  Route.any('ueditor', 'UEditorController.handle')

  Route.get(':resource/grid', 'ResourceController.grid')
  Route.get(':resource/form', 'ResourceController.form')
  Route.get(':resource/view', 'ResourceController.view')
  Route.get(':resource/stat', 'ResourceController.stat')
  Route.resource(':resource', 'ResourceController')

}).prefix('admin/api').middleware([
  // 'auth:adminJwt',
  'resource'
])

