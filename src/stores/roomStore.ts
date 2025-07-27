import { create } from 'zustand';
import { roomService, propertyService, Room, RoomStatus } from '../utils/apiClient';

interface RoomInput {
  name: string;
  number: string;
  floor: number;
  size: number;
  description?: string;
  status: RoomStatus;
  price: number;
  propertyId: string;
  type?: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

interface RoomState {
  rooms: Room[];
  selectedRoom: Room | null;
  isLoading: boolean;
  error: string | null;
  pagination: Pagination | null;
  
  // Actions
  fetchRooms: (page?: number, limit?: number, search?: string, status?: string) => Promise<void>;
  fetchRoomsByProperty: (propertyId: string) => Promise<void>;
  fetchRoomById: (id: string) => Promise<void>;
  createRoom: (data: RoomInput) => Promise<Room>;
  updateRoom: (id: string, data: Partial<RoomInput>) => Promise<void>;
  deleteRoom: (id: string) => Promise<void>;
  clearSelectedRoom: () => void;
  clearError: () => void;
}

export const useRoomStore = create<RoomState>((set) => ({
  rooms: [],
  selectedRoom: null,
  isLoading: false,
  error: null,
  pagination: null,

  fetchRooms: async (page = 1, limit = 10, search = '', status = '') => {
    try {
      set({ isLoading: true, error: null });
      const response = await roomService.getAllRooms(page, limit, search, status);
      set({
        rooms: response.data.data,
        pagination: response.data.pagination || null,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error fetching rooms:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch rooms',
      });
    }
  },

  fetchRoomsByProperty: async (propertyId: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await propertyService.getPropertyRooms(propertyId);
      set({
        rooms: response.data.data,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error fetching rooms by property:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch rooms for this property',
      });
    }
  },

  fetchRoomById: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await roomService.getRoomById(id);
      set({
        selectedRoom: response.data.data,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error fetching room:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch room',
      });
    }
  },

  createRoom: async (data: RoomInput) => {
    try {
      set({ isLoading: true, error: null });
      const response = await roomService.createRoom(data);
      const newRoom = response.data.data;
      
      set((state) => ({
        rooms: [...state.rooms, newRoom],
        isLoading: false,
      }));
      
      return newRoom;
    } catch (error) {
      console.error('Error creating room:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to create room',
      });
      throw error;
    }
  },

  updateRoom: async (id: string, data: Partial<RoomInput>) => {
    try {
      set({ isLoading: true, error: null });
      const response = await roomService.updateRoom(id, data);
      const updatedRoom = response.data.data;
      
      set((state) => ({
        rooms: state.rooms.map((room) =>
          room.id === id ? updatedRoom : room
        ),
        selectedRoom: state.selectedRoom?.id === id ? updatedRoom : state.selectedRoom,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error updating room:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to update room',
      });
      throw error;
    }
  },

  deleteRoom: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      await roomService.deleteRoom(id);
      set((state) => ({
        rooms: state.rooms.filter((room) => room.id !== id),
        selectedRoom: state.selectedRoom?.id === id ? null : state.selectedRoom,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error deleting room:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to delete room',
      });
      throw error;
    }
  },

  clearSelectedRoom: () => set({ selectedRoom: null }),
  
  clearError: () => set({ error: null }),
}));