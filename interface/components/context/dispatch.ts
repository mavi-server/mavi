import type { Reducer } from './index.d'

const reducer: Reducer = (state, action) => {
  switch (action.type) {
    default:
      return { ...state }
  }
}

export default reducer