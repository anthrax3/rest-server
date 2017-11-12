const Route = use('Route')

//不需要登录
Route.group(() => {

  Route.post('login', 'ResourceController.login')
  

}).prefix('admin/api').middleware([
  'authenticator:adminJwt'
])


//需要登录
Route.group(() => {

  Route.post('upload', 'ResourceController.upload')
  Route.any('ueditor', 'UEditorController.handle')

  Route.get(':resource/grid', 'ResourceController.grid')
  Route.get(':resource/form', 'ResourceController.form')
  Route.resource(':resource', 'ResourceController')

}).prefix('admin/api').middleware([
  // 'auth:adminJwt',
  'resource'
])

