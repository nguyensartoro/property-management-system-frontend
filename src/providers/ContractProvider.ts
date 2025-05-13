import { gql } from "@apollo/client";

export const GET_CONTRACTS = gql`
query GetContracts($page: Int, $limit: Int, $status: String, $sortBy: String, $sortOrder: String) {
  contracts(page: $page, limit: $limit, status: $status, sortBy: $sortBy, sortOrder: $sortOrder) {
    nodes {
      id
      roomId
      room {
        number
      }
      renters {
        id
        name
      }
      startDate
      endDate
      contractType
      status
      amount
    }
    pageInfo {
      totalCount
      totalPages
      currentPage
    }
  }
}
`;

export const GET_CONTRACT = gql`
  query GetContract($id: ID!) {
    contract(id: $id) {
      id
      roomId
      room {
        id
        number
        name
      }
      renters {
        id
        name
        avatar
      }
      startDate
      endDate
      contractType
      status
      amount
      renterIds
      renterNames
    }
  }
`;

export const CREATE_CONTRACT = gql`
  mutation CreateContract($input: ContractInput!) {
    createContract(input: $input) {
      contract {
        id
        roomId
        startDate
        endDate
        contractType
        status
        amount
        renterIds
      }
      success
      message
    }
  }
`;

export const UPDATE_CONTRACT = gql`
  mutation UpdateContract($id: ID!, $input: ContractInput!) {
    updateContract(id: $id, input: $input) {
      contract {
        id
        roomId
        startDate
        endDate
        contractType
        status
        amount
        renterIds
      }
      success
      message
    }
  }
`;

export const DELETE_CONTRACT = gql`
  mutation DeleteContract($id: ID!) {
    deleteContract(id: $id) {
      success
      message
    }
  }
`;