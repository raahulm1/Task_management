import React from 'react';
import { useKeycloak } from '@react-keycloak/web';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const keycloakContext = useKeycloak();

  if (!keycloakContext) {
    console.error("Keycloak context not found. Is ReactKeycloakProvider wrapping your app?");
    return <div>Authentication not initialized</div>;
  }

  const { keycloak, initialized } = keycloakContext;

  if (!initialized) {
    return <div>Loading authentication...</div>;
  }

  if (!keycloak.authenticated) {
    keycloak.login();
    return <div>Redirecting to login...</div>;
  }

  return children;
};

export default ProtectedRoute;
