'use strict'

const Hash = use('Hash')

const UserHook = module.exports = {}

UserHook.hashPassword = async (model) => {
  const dirty = model.dirty
  if (dirty.password) {
    model.password = await Hash.make(model.password)
  }
}
