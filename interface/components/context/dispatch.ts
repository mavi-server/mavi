const reducer: Reducer = (state, action) => {
  switch (action.type) {
    case 'ADD_API_ENTITY': {
      return { ...state, api: { ...state.api, routes: { ...state.api.routes, ...action.payload.routes } } }
    }
    case 'ADD_ROUTE': {
      const routes = state.api.routes[action.payload.path].concat(action.payload.route)

      return { ...state, api: { ...state.api, routes: { ...state.api.routes, [action.payload.path]: routes } } }
    }
    case 'DELETE_API_ENTITY': {
      const { path } = action.payload
      const routes = { ...state.api.routes }
      delete routes[path]

      return { ...state, api: { ...state.api, routes } }
    }
    case 'DELETE_ROUTE': {
      const { path, index } = action.payload
      const pathRoutes = [...state.api.routes[path].splice(index, 1)]

      return { ...state, api: { ...state.api, routes: { ...state.api.routes, [path]: pathRoutes } } }
    }
    case 'EDIT_API_ENTITY': {
      const { oldPath, newPath } = action.payload
      const routes = { ...state.api.routes }
      routes[newPath] = routes[oldPath]
      delete routes[oldPath]

      return { ...state, api: { ...state.api, routes } }
    }
    case 'EDIT_ROUTE': {
      const { path, index, newPath } = action.payload
      const routes = { ...state.api.routes }
      routes[path][index].path = newPath

      return { ...state, api: { ...state.api, routes } }
    }
    default:
      return { ...state }
  }
}

import type { Reducer } from './index.d'
export default reducer