import React from 'react';
import { 
  ApolloClient, 
  InMemoryCache, 
  ApolloProvider as ApolloProviderOriginal, 
  HttpLink, 
  from 
} from '@apollo/client';
import { onError } from '@apollo/client/link/error';

// Set up GraphQL endpoint
const GRAPHQL_URL = import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:5001/graphql';

// Error handling link
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`);
    });
  }
  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
  }
});

// HTTP link for GraphQL endpoint
const httpLink = new HttpLink({
  uri: GRAPHQL_URL,
  credentials: 'include', // Send cookies with requests
  fetchOptions: {
    mode: 'cors'  // Explicitly set CORS mode
  }
});

// Create the Apollo client
export const client = new ApolloClient({
  link: from([errorLink, httpLink]),
  cache: new InMemoryCache(),
});

// Create the provider component
export const ApolloProvider: React.FC<{children: React.ReactNode}> = ({ children }: {children: React.ReactNode}) => {
  return (
    <ApolloProviderOriginal client={client}>
      {children}
    </ApolloProviderOriginal>
  );
};

export default ApolloProvider; 