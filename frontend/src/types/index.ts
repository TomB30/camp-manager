export type Label = {
  meta: {
    id: string;
    name: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
  };
  spec: {};
};

export type Conflict = {
  type:
    | "event_overcapacity"
    | "room_overcapacity"
    | "camper_double_booked"
    | "staff_double_booked"
    | "missing_certification"
    | "unfilled_position";
  message: string;
  entityId: string;
  conflictingIds: string[];
};
