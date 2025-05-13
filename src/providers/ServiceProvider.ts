import { gql } from "@apollo/client";

export const GET_SERVICES = gql`
  query GetServices($page: Int, $limit: Int, $active: Boolean, $feeType: String, $sortBy: String, $sortOrder: String) {
    services(
      page: $page
      limit: $limit
      active: $active
      feeType: $feeType
      sortBy: $sortBy
      sortOrder: $sortOrder
    ) {
      nodes {
        id
        name
        icon
        fee
        feeType
        description
        active
        createdAt
        updatedAt
      }
      pageInfo {
        totalCount
        totalPages
        currentPage
      }
    }
  }
`;

export const GET_SERVICE = gql`
  query GetService($id: ID!) {
    service(id: $id) {
      id
      name
      icon
      fee
      feeType
      description
      active
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_SERVICE = gql`
  mutation CreateService($input: CreateServiceInput!) {
    createService(input: $input) {
      id
      name
      icon
      fee
      feeType
      description
      active
    }
  }
`;

export const UPDATE_SERVICE = gql`
  mutation UpdateService($id: ID!, $input: UpdateServiceInput!) {
    updateService(id: $id, input: $input) {
      id
      name
      icon
      fee
      feeType
      description
      active
    }
  }
`;

export const DELETE_SERVICE = gql`
  mutation DeleteService($id: ID!) {
    deleteService(id: $id)
  }
`;