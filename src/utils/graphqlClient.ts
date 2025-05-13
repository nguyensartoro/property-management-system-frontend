/**
 * GraphQL client utility for making API requests to the backend
 */

const GRAPHQL_URL = import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:5001/graphql';

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

interface GraphQLError extends Error {
  message: string;
  extensions?: Record<string, unknown>;
}

/**
 * Execute a GraphQL query or mutation
 * @param query GraphQL query or mutation string
 * @param variables Variables for the query/mutation
 * @param token JWT authentication token (optional - only used if cookies not enabled)
 */
export async function executeGraphQL<T>(
  query: string,
  variables?: Record<string, unknown>,
  token?: string | null
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Add authorization header if token is provided and we're not using cookies
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers,
      credentials: 'include', // Include cookies in request
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    const result = await response.json() as GraphQLResponse<T>;
    console.log(result, "** result **");

    if (result.errors && result.errors.length > 0) {
      throw new Error(result.errors[0].message || 'GraphQL error');
    }

    if (!result.data) {
      throw new Error('No data returned from GraphQL server');
    }

    return result.data;
  } catch (error: unknown) {
    const graphqlError = error as GraphQLError;
    console.error('GraphQL request failed:', graphqlError);
    throw graphqlError;
  }
}