import {
  waitForConnected
  , connectToEnvironment
} from './kuzzleWrapper'
import store from '../vuex/store'
import { reset } from '../vuex/actions'
import {
  environments
  , currentEnvironmentId
  , currentEnvironment
} from '../vuex/modules/common/kuzzle/getters'
import * as authTypes from '../vuex/modules/auth/mutation-types'
import * as kuzzleTypes from '../vuex/modules/common/kuzzle/mutation-types'
import Promise from 'bluebird'
import router from './router'

export const LAST_CONNECTED = 'lastConnectedEnv'
const ENVIRONMENTS = 'environments'
export const DEFAULT_COLOR = '#002835'
export const DEFAULT = 'default'

const defaultEnvironment = {
  [DEFAULT]: {
    name: 'localhost',
    host: 'localhost',
    ioPort: 7512,
    wsPort: 7513,
    color: DEFAULT_COLOR
  }
}

export const persistEnvironments = (environments) => {
  // eslint-disable-next-line no-undef
  localStorage.setItem(ENVIRONMENTS, JSON.stringify(environments))
}
/**
 * Loads the environment definitions stored in localStorage, stores them in
 * the Vuex store, then returns the id of the last connected
 * environment if available, or the first environment id available otherwise.
 *
 * @return {Object} all environments.
 */
export const loadEnvironments = () => {
  let loadedEnv = {}

  try {
    // eslint-disable-next-line no-undef
    loadedEnv = JSON.parse(localStorage.getItem(ENVIRONMENTS) || '{}')
    if (Object.keys(loadedEnv).length === 0) {
      return defaultEnvironment
    }
  } catch (e) {
    return defaultEnvironment
  }

  return loadedEnv
}

/**
 * Creates an environment objects, stores it in the Vuex store and returns it.
 *
 * @param  {String} The name of the environment (displayed in the list).
 * @param  {String} The HEX color code of the main header bar when connected.
 * @param  {String} The hostname.
 * @param  {int} The port number for the Socket.IO protocol.
 * @param  {int} The port number for the Websocket protocol.
 *
 * @return {Object} The environment object.
 */
export const createEnvironment = (name, color, host, ioPort, wsPort) => {
  if (!color) {
    color = DEFAULT_COLOR
  }

  let newEnvironment = {
    name,
    color,
    host,
    ioPort,
    wsPort
  }

  store.dispatch(kuzzleTypes.ADD_ENVIRONMENT, {id: name, environment: newEnvironment})
  return newEnvironment
}

export const loadLastConnectedEnvId = () => {
  // eslint-disable-next-line no-undef
  return localStorage.getItem(LAST_CONNECTED)
}

export const deleteEnvironment = (store, id) => {
  if (currentEnvironmentId(store.state) === id) {
    store.dispatch(authTypes.DO_LOGOUT)
    router.push({name: 'Login'})
  }

  store.dispatch(kuzzleTypes.DELETE_ENVIRONMENT, id)
}

export const updateEnvironment = (id, name, color, host, ioPort, wsPort) => {
  let envToUpdate = environments(store.state)[id]
  if (!envToUpdate) {
    throw new Error(`The provided id ${id} does not correspond to any existing
      environment`)
  }

  envToUpdate = {
    ...envToUpdate, name, color, host, ioPort, wsPort
  }

  store.dispatch(kuzzleTypes.UPDATE_ENVIRONMENT, {id, environment: envToUpdate})
  return envToUpdate
}

export const setTokenToCurrentEnvironment = (token) => {
  store.dispatch(kuzzleTypes.UPDATE_ENVIRONMENT, {
    id: currentEnvironmentId(store.state),
    environment: {
      ...currentEnvironment(store.state),
      token: token
    }
  })
  return currentEnvironment(store.state)
}

export const switchEnvironment = (store, id) => {
  if (!id) {
    throw new Error(`cannot switch to ${id} environment`)
  }

  let environment = environments(store.state)[id]
  if (!environment) {
    throw new Error(`Id ${id} does not match any environment`)
  }

  reset(store)

  connectToEnvironment(environment)

  return waitForConnected(10000)
    .then(() => {
      store.dispatch(kuzzleTypes.SET_CONNECTION, id)

      return store.dispatch(authTypes.LOGIN_BY_TOKEN, {token: environment.token})
        .then(user => {
          if (!user.id) {
            return store.dispatch(authTypes.CHECK_FIRST_ADMIN)
          }
          return Promise.resolve()
        })
    })
}
