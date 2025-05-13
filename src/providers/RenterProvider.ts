import { gql } from "@apollo/client";

export const GET_RENTERS = gql`
  query GetRenters($page: Int, $limit: Int, $searchText: String, $sortBy: String, $sortOrder: String) {
    renters(page: $page, limit: $limit, searchText: $searchText, sortBy: $sortBy, sortOrder: $sortOrder) {
      nodes {
        id
        name
        email
        phone
        emergencyContact
        identityNumber
        roomId
        room {
          id
          number
          name
        }
      }
      pageInfo {
        totalCount
        totalPages
        currentPage
      }
    }
  }
`;

export const GET_RENTER = gql`
  query GetRenter($id: ID!) {
    renter(id: $id) {
      id
      name
      email
      phone
      emergencyContact
      identityNumber
      roomId
      room {
        id
        number
        name
      }
      documents {
        id
        name
        type
        path
      }
    }
  }
`;

export const CREATE_RENTER = gql`
  mutation CreateRenter($input: CreateRenterInput!) {
    createRenter(input: $input) {
      id
      name
      email
      phone
      emergencyContact
      identityNumber
      roomId
    }
  }
`;

export const UPDATE_RENTER = gql`
  mutation UpdateRenter($id: ID!, $input: UpdateRenterInput!) {
    updateRenter(id: $id, input: $input) {
      id
      name
      email
      phone
      emergencyContact
      identityNumber
      roomId
    }
  }
`;

export const DELETE_RENTER = gql`
  mutation DeleteRenter($id: ID!) {
    deleteRenter(id: $id)
  }
`;

export const UPLOAD_AVATAR = gql`
  mutation UploadAvatar($id: ID!, $file: Upload!) {
    uploadAvatar(id: $id, file: $file) {
      avatarUrl
      success
      message
    }
  }
`;

export const UPLOAD_DOCUMENT = gql`
  mutation UploadDocument($input: CreateDocumentInput!) {
    createDocument(input: $input) {
      id
      name
      type
      path
      renterId
    }
  }
`;

export const GET_AVAILABLE_ROOMS = gql`
  query GetAvailableRooms {
    rooms(status: "AVAILABLE") {
      nodes {
        id
        number
        name
        status
      }
    }
  }
`;
