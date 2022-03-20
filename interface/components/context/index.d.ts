import { MaviConfig } from "../../../types"

export type State = MaviConfig
export type Action = {
  type: ActionTypes,
  payload: any,
}
export type Reducer = (state: State, action: Action) => State
export type ContextType = {
  state: MaviConfig | {}
  dispatch: Action | {}
  actions: {
    [functionName: string]: (...args: any[]) => any
  }
}



type ActionTypes = "SET_CONFIG" | 'SET_HOST' | 'SET_PORT' | 'SET_POWERED_BY' | 'SET_TIMER' | 'SET_CORS' | 'SET_STATIC' | 'SET_DATABASE' | 'SET_API'