const Route = use('Route')

//不需要登录
Route.group(() => {

  Route.post('login', 'Admin/SiteController.login')
  Route.get('site', 'Admin/SiteController.site')
  

}).prefix('admin/api').middleware([
  'authenticator:adminJwt',
  'query:admin',
])

//需要登录
Route.group(() => {

  Route.get('home', 'Admin/SiteController.home')
  Route.post('upload', 'Admin/SiteController.upload')
  Route.any('ueditor', 'Admin/UEditorController.handle')

  Route.get('vouchers/generate', 'Admin/VoucherController.showGenerateForm')
  Route.post('vouchers/generate', 'Admin/VoucherController.generate')

  Route.get(':resource/options', 'Admin/ResourceController.options')
  Route.get(':resource/grid', 'Admin/ResourceController.grid')
  Route.get(':resource/form', 'Admin/ResourceController.form')
  Route.get(':resource/view', 'Admin/ResourceController.view')
  Route.get(':resource/stat', 'Admin/ResourceController.stat')
  Route.resource(':resource', 'Admin/ResourceController')

}).prefix('admin/api').middleware([
  // 'authenticator:adminJwt',
  'auth:adminJwt',
  'query:admin',
  'resource'
])

