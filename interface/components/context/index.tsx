import { createContext, ReactNode, useReducer } from 'react'
import initialState from './state'
import reducer from './dispatch'
import actions from './actions'
import { ContextType } from './index.d'

type ContextProps = { children: ReactNode }

export const MaviConfigContext = createContext<ContextType>({} as any)

export const MaviConfigContextProvider = ({ children }: ContextProps) => {
  const [state, dispatch] = useReducer(reducer, initialState)
  const ctx = { state, actions, dispatch }

  return <MaviConfigContext.Provider value={ctx}>{children} </MaviConfigContext.Provider>
}
