import { createContext, ReactNode, useReducer } from 'react'
import initialState from './state'
import reducer from './dispatch'
import actions from './actions'
import { ContextType } from './index.d'

export const MaviConfigContext = createContext<ContextType>({} as any)
export const MaviConfigContextProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState)
  const ctx = { state, dispatch, actions: {} }
  const abstractActions = (fn: string, payload: any) => {
    if (fn in actions) {
      actions[fn](ctx, payload)
    } else {
      console.error(`Action ${fn} not found`)
    }
  }
  ctx.actions = abstractActions

  return <MaviConfigContext.Provider value={ctx}>{children} </MaviConfigContext.Provider>
}
