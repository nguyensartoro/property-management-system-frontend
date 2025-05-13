import React from 'react';
import { 
  ApolloClient, 
  InMemoryCache, 
  ApolloProvider as ApolloProviderOriginal, 
  HttpLink, 
  from,
  ApolloLink
} from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import toast from 'react-hot-toast';

// Set up GraphQL endpoint
// Remove any trailing % character that might be in the env variable
const rawGraphqlUrl = import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:5001/graphql';
const GRAPHQL_URL = rawGraphqlUrl.endsWith('%') 
  ? rawGraphqlUrl.slice(0, -1) 
  : rawGraphqlUrl;

// Log outgoing requests in development
const requestLogger = new ApolloLink((operation, forward) => {
  if (import.meta.env.MODE !== 'production') {
    console.log(`GraphQL Request: ${operation.operationName}`, {
      variables: operation.variables,
    });
  }
  return forward(operation);
});

// Error handling link
const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}, Operation: ${operation.operationName}`
      );
      
      if (operation.operationName === 'Login' || operation.operationName === 'Register') {
        // Don't show toast for auth operations - the component will handle these
        return;
      }
      
      // Show a toast notification for GraphQL errors
      toast.error(`GraphQL error: ${message}`);
    });
  }
  
  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
    const errorMessage = networkError.message || 'Network connection error';
    
    if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
      toast.error('Cannot connect to server. Please check if the backend is running.');
    } else {
      toast.error(`Network error: ${errorMessage}`);
    }
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
  link: from([requestLogger, errorLink, httpLink]),
  cache: new InMemoryCache(),
  connectToDevTools: true,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
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