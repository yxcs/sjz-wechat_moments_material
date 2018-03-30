import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import { createStore, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import app from './reducer'
import sagas from './sagas';
import { Provider } from 'react-redux';
import { injectGlobal } from 'styled-components';


import 'element-theme-default';

// add global style
injectGlobal`
  .scroll-bar {
    &::-webkit-scrollbar {
      width: 4px;
      height: 4px;
      background: #eee;
    }
    &::-webkit-scrollbar-thumb {
      background: #ccc;
      border-radius: 4px;
    }
  }
`

const sagaMiddleware = createSagaMiddleware();
const store = createStore(
  app,
  applyMiddleware(sagaMiddleware)
)
sagaMiddleware.run(sagas)

ReactDOM.render(
  <Provider store={store}>
    <App/>
  </Provider>,
  document.getElementById('root')
);
