import { gql } from "@apollo/client";

export const GET_ROOMS = gql`
  query GetRooms($page: Int, $limit: Int, $search: String, $type: String, $status: String, $minPrice: Float, $maxPrice: Float, $sortBy: String, $sortOrder: String) {
    rooms(
      page: $page
      limit: $limit
      search: $search
      type: $type
      status: $status
      minPrice: $minPrice
      maxPrice: $maxPrice
      sortBy: $sortBy
      sortOrder: $sortOrder
    ) {
      nodes {
        id
        name
        number
        floor
        size
        description
        status
        price
        images
        propertyId
        createdAt
        updatedAt
        type
      }
      pageInfo {
        totalCount
        totalPages
        currentPage
      }
    }
  }
`;

export const GET_ROOM = gql`
  query GetRoom($id: ID!) {
    room(id: $id) {
      id
      name
      number
      floor
      size
      description
      status
      price
      images
      propertyId
      createdAt
      updatedAt
      type
      roomServices {
        id
        serviceId
      }
      renters {
        id
        name
        avatar
      }
      contracts {
        id
        startDate
        endDate
        contractType
        status
        amount
        renterIds
        renterNames
      }
    }
  }
`;

export const CREATE_ROOM = gql`
  mutation CreateRoom($input: RoomInput!) {
    createRoom(input: $input) {
      room {
        id
        name
        number
        floor
        size
        description
        status
        price
        type
      }
      success
      message
    }
  }
`;

export const UPDATE_ROOM = gql`
  mutation UpdateRoom($id: ID!, $input: RoomInput!) {
    updateRoom(id: $id, input: $input) {
      room {
        id
        name
        number
        floor
        size
        description
        status
        price
        type
      }
      success
      message
    }
  }
`;

export const DELETE_ROOM = gql`
  mutation DeleteRoom($id: ID!) {
    deleteRoom(id: $id) {
      success
    }
  }
`;
