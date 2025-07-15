import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ReactKeycloakProvider } from '@react-keycloak/web';
import keycloak from './keycloak';
import { getMe } from './api/auth';
import { Provider } from 'react-redux';
import store from './app/store';

const onKeycloakTokens = (tokens) => {
  if (tokens?.token) {
    getMe(tokens.token).catch(() => {});
  }
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ReactKeycloakProvider
      authClient={keycloak}
      initOptions={{ onLoad: 'check-sso', checkLoginIframe: false }}
      onTokens={onKeycloakTokens}
    >
    <Provider store={store}>
      <App />
    </Provider>
  </ReactKeycloakProvider>
);