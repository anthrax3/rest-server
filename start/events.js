const Event = use('Event')

Event.on('order::paid', [])
Event.on('user::register', [])
Event.on('user::login', [])

Event.on('user::addBalance', async (log) => {
  console.log('user::addBalance', log.toJSON());
})