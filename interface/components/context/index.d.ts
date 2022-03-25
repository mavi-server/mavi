import { MaviConfig } from "../../../types"

export type State = MaviConfig
export type Dispatch = {
  type: DispatchTypes,
  payload: any,
}
export type Reducer = (state: State, action: Dispatch) => State
export type Action = (ctx: ContextType, ...args: any) => void
export type ContextType = {
  state: State
  dispatch: (data: Dispatch) => State
  actions: (fn: string, payload: any) => Action
}
export type DispatchTypes =
  'ADD_API_ENTITY' |
  'ADD_ROUTE' |
  // 'ADD_ROUTE_CONFIG' |
  'DELETE_API_ENTITY' |
  'DELETE_ROUTE' |
  // 'DELETE_ROUTE_CONFIG' |
  'EDIT_API_ENTITY' |
  'EDIT_ROUTE' |
  // 'EDIT_ROUTE_CONFIG' |
  'SET_CONFIG' |
  'SET_HOST' |
  'SET_PORT' |
  'SET_POWERED_BY' |
  'SET_TIMER' |
  'SET_CORS' |
  'SET_STATIC' |
  'SET_DATABASE' |
  'SET_API'
export type Actions = {
  [name: string]: Action
}


