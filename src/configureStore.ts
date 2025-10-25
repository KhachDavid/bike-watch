import { applyMiddleware, compose, createStore, Store, StoreEnhancer } from 'redux';
import thunkMiddleware from 'redux-thunk';
import createSagaMiddleware from 'redux-saga';

import rootReducer from './store/reducers';
import rootSaga from './store/sagas';
import { RootState } from './types';

const sagaMiddleware = createSagaMiddleware();

export default function configureStore(preloadedState?: Partial<RootState>): Store<RootState> {
  const middlewares = [thunkMiddleware, sagaMiddleware];
  const middlewareEnhancer = applyMiddleware(...middlewares);

  const enhancers = [middlewareEnhancer];
  const composedEnhancers = compose(...enhancers) as StoreEnhancer;

  const store = createStore(
    rootReducer,
    preloadedState,
    composedEnhancers,
  );

  sagaMiddleware.run(rootSaga);

  if (process.env.NODE_ENV !== 'production' && (module as any).hot) {
    (module as any).hot.accept('./store/reducers', () =>
      store.replaceReducer(rootReducer)
    );
  }

  return store;
}