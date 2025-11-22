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
  listHousingRooms: (): Promise<HousingRoom[]> => impl().listHousingRooms(),
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
