/**
 * Unified Housing Rooms Service
 * Routes to either backend API or local storage based on configuration
 */
import { isBackendEnabled } from "@/config/dataSource";
import { housingRoomsStorage } from "./housingRoomsStorage";
import { housingRoomsApi } from "./api/housingRoomsApi";
import type {
  HousingRoom,
  HousingRoomCreationRequest,
  HousingRoomUpdateRequest,
} from "@/generated/api";

const impl = () => (isBackendEnabled() ? housingRoomsApi : housingRoomsStorage);

export const housingRoomsService = {
  listHousingRooms: (params?: {
    limit?: number;
    offset?: number;
    search?: string;
    filterBy?: string[];
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }): Promise<
    | {
        items: HousingRoom[];
        total: number;
        limit: number;
        offset: number;
        next: number | null;
      }
    | HousingRoom[]
  > => impl().listHousingRooms(params as any),
  createHousingRoom: (data: HousingRoomCreationRequest): Promise<HousingRoom> =>
    impl().createHousingRoom(data),
  updateHousingRoom: (
    id: string,
    data: HousingRoomUpdateRequest,
  ): Promise<HousingRoom> => impl().updateHousingRoom(id, data),
  deleteHousingRoom: (id: string): Promise<void> =>
    impl().deleteHousingRoom(id),
  getHousingRoomById: (id: string): Promise<HousingRoom | null> =>
    impl().getHousingRoomById(id),
};
