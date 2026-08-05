import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import Modal from 'react-modal';
import App from './App';
import './index.css';
import { store } from './store';
import './i18n';
import { BrowserRouter } from 'react-router-dom';
Modal.setAppElement('#root');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>,
);
