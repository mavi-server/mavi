

export default {
  addRoutes({ state, dispatch }, { input, selectedListItems, depth }) {
    const routes = state.api.routes
    const path = Object.keys(routes)[selectedListItems[0]]
    let data: any

    // add route entity
    if (depth === 0) {
      dispatch({
        type: 'ADD_API_ENTITY',
        payload: { routes: { [input]: [] } }
      })
    }

    // add new route
    else if (depth === 1) {
      dispatch({
        type: 'ADD_ROUTE',
        payload: {
          path, // parent router path
          route: {
            path: input,
            method: 'get',
            controller: 'find',
            model: name,
            columns: [],
            exclude: [],
            middlewares: [],
            populate: [],
            utils: [],
            query: {},
            view: null
          }
        }
      })
    }

    // add route config
    // else if (depth === 2) {
    //   dispatch({
    //     type: 'ADD_ROUTE_CONFIG',
    //     payload: {
    //       path: input,
    //       method: 'get',
    //       controller: 'find',
    //       model: name,
    //       exclude: [],
    //       middlewares: [],
    //       populate: [],
    //       utils: [],
    //       query: {},
    //       view: null
    //     }
    //   })
    // }
  },
  deleteRoutes({ state, dispatch }, { input, setSelectedListItems, selectedListItems, depth }) {
    const routes = state.api.routes
    const path = Object.keys(routes)[selectedListItems[0]]
    const index = selectedListItems[1]

    // delete route entity
    if (depth === 0) {
      dispatch({
        type: 'DELETE_API_ENTITY',
        payload: { path }
      })
      setSelectedListItems([null, null, null, null])
    }

    // delete route
    else if (depth === 1) {
      dispatch({
        type: 'DELETE_ROUTE',
        payload: { path, index }
      })
      setSelectedListItems([selectedListItems[0], null, null, null])
    }
  },
  editRoutes({ state, dispatch }, { input, setSelectedListItems, selectedListItems, depth }) {
    const routes = state.api.routes
    const path = Object.keys(routes)[selectedListItems[0]]
    const index = selectedListItems[1]

    // delete route entity
    if (depth === 0) {
      dispatch({
        type: 'EDIT_API_ENTITY',
        payload: { oldPath: path, newPath: input }
      })
      setSelectedListItems([null, null, null, null])
    }

    // delete route
    else if (depth === 1) {
      dispatch({
        type: 'EDIT_ROUTE',
        payload: { path, index, newPath: input, }
      })
      setSelectedListItems([selectedListItems[0], null, null, null])
    }
  }
} as Actions
import { Actions } from './index.d'