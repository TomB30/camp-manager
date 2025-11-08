package middleware

// OperationRoles maps operation IDs to their required roles
var OperationRoles = map[string][]string{
	// Authentication endpoints - no role restrictions (handled separately)
	"login":          {},
	"signup":         {},
	"getCurrentUser": {},
	"logout":         {},

	// Tenant management - system scope admin only
	"getTenants":     {"admin"},
	"getTenantById":  {"admin"},
	"createTenant":   {"admin"},
	"updateTenant":   {"admin"},
	"deleteTenant":   {"admin"},

	// Camp management - tenant scope
	"getCamps":       {"admin", "program-admin", "viewer"},
	"createCamp":     {"admin"},
	"getCampById":    {"admin", "program-admin", "viewer"},
	"updateCampById": {"admin"},
	"deleteCampById": {"admin"},

	// Programs - admin and program-admin can CRUD
	"listPrograms":        {"admin", "program-admin", "viewer"},
	"createProgram":       {"admin", "program-admin"},
	"getProgramById":      {"admin", "program-admin", "viewer"},
	"updateProgramById":   {"admin", "program-admin"},
	"deleteProgramById":   {"admin", "program-admin"},

	// Activities - admin and program-admin can CRUD
	"listActivities":      {"admin", "program-admin", "viewer"},
	"createActivity":      {"admin", "program-admin"},
	"getActivityById":     {"admin", "program-admin", "viewer"},
	"updateActivityById":  {"admin", "program-admin"},
	"deleteActivityById":  {"admin", "program-admin"},

	// Events - admin and program-admin can CRUD
	"listEvents":          {"admin", "program-admin", "viewer"},
	"createEvent":         {"admin", "program-admin"},
	"getEventById":        {"admin", "program-admin", "viewer"},
	"updateEventById":     {"admin", "program-admin"},
	"deleteEventById":     {"admin", "program-admin"},

	// Campers - admin only for CUD, all for read
	"listCampers":         {"admin", "program-admin", "viewer"},
	"createCamper":        {"admin"},
	"getCamperById":       {"admin", "program-admin", "viewer"},
	"updateCamperById":    {"admin"},
	"deleteCamperById":    {"admin"},

	// Staff Members - admin only for CUD, all for read
	"listStaffMembers":    {"admin", "program-admin", "viewer"},
	"createStaffMember":   {"admin"},
	"getStaffMemberById":  {"admin", "program-admin", "viewer"},
	"updateStaffMemberById": {"admin"},
	"deleteStaffMemberById": {"admin"},

	// Areas - admin only for CUD, all for read
	"listAreas":           {"admin", "program-admin", "viewer"},
	"createArea":          {"admin"},
	"getAreaById":         {"admin", "program-admin", "viewer"},
	"updateAreaById":      {"admin"},
	"deleteAreaById":      {"admin"},

	// Locations - admin only for CUD, all for read
	"listLocations":       {"admin", "program-admin", "viewer"},
	"createLocation":      {"admin"},
	"getLocationById":     {"admin", "program-admin", "viewer"},
	"updateLocationById":  {"admin"},
	"deleteLocationById":  {"admin"},

	// Colors - admin only for CUD, all for read
	"listColors":          {"admin", "program-admin", "viewer"},
	"createColor":         {"admin"},
	"getColorById":        {"admin", "program-admin", "viewer"},
	"updateColorById":     {"admin"},
	"deleteColorById":     {"admin"},

	// Roles - admin only for CUD, all for read
	"listRoles":           {"admin", "program-admin", "viewer"},
	"createRole":          {"admin"},
	"getRoleById":         {"admin", "program-admin", "viewer"},
	"updateRoleById":      {"admin"},
	"deleteRoleById":      {"admin"},

	// Certifications - admin only for CUD, all for read
	"listCertifications":  {"admin", "program-admin", "viewer"},
	"createCertification": {"admin"},
	"getCertificationById": {"admin", "program-admin", "viewer"},
	"updateCertificationById": {"admin"},
	"deleteCertificationById": {"admin"},

	// Housing Rooms - admin only for CUD, all for read
	"listHousingRooms":    {"admin", "program-admin", "viewer"},
	"createHousingRoom":   {"admin"},
	"getHousingRoomById":  {"admin", "program-admin", "viewer"},
	"updateHousingRoomById": {"admin"},
	"deleteHousingRoomById": {"admin"},

	// Sessions - admin only for CUD, all for read
	"listSessions":        {"admin", "program-admin", "viewer"},
	"createSession":       {"admin"},
	"getSessionById":      {"admin", "program-admin", "viewer"},
	"updateSessionById":   {"admin"},
	"deleteSessionById":   {"admin"},

	// Groups - admin only for CUD, all for read
	"listGroups":          {"admin", "program-admin", "viewer"},
	"createGroup":         {"admin"},
	"getGroupById":        {"admin", "program-admin", "viewer"},
	"updateGroupById":     {"admin"},
	"deleteGroupById":     {"admin"},
}

// ResourceType defines the type of resource for authorization checks
type ResourceType string

const (
	ResourceTypeProgram  ResourceType = "program"
	ResourceTypeActivity ResourceType = "activity"
	ResourceTypeEvent    ResourceType = "event"
	ResourceTypeOther    ResourceType = "other"
)

// OperationResourceTypes maps operation IDs to their resource types
// This is used to determine if program-admin has write access
var OperationResourceTypes = map[string]ResourceType{
	// Programs, activities, and events - program-admin can write
	"listPrograms":        ResourceTypeProgram,
	"createProgram":       ResourceTypeProgram,
	"getProgramById":      ResourceTypeProgram,
	"updateProgramById":   ResourceTypeProgram,
	"deleteProgramById":   ResourceTypeProgram,

	"listActivities":      ResourceTypeActivity,
	"createActivity":      ResourceTypeActivity,
	"getActivityById":     ResourceTypeActivity,
	"updateActivityById":  ResourceTypeActivity,
	"deleteActivityById":  ResourceTypeActivity,

	"listEvents":          ResourceTypeEvent,
	"createEvent":         ResourceTypeEvent,
	"getEventById":        ResourceTypeEvent,
	"updateEventById":     ResourceTypeEvent,
	"deleteEventById":     ResourceTypeEvent,

	// All other resources - program-admin read-only
	"listCampers":         ResourceTypeOther,
	"createCamper":        ResourceTypeOther,
	"getCamperById":       ResourceTypeOther,
	"updateCamperById":    ResourceTypeOther,
	"deleteCamperById":    ResourceTypeOther,

	"listStaffMembers":    ResourceTypeOther,
	"createStaffMember":   ResourceTypeOther,
	"getStaffMemberById":  ResourceTypeOther,
	"updateStaffMemberById": ResourceTypeOther,
	"deleteStaffMemberById": ResourceTypeOther,

	"listAreas":           ResourceTypeOther,
	"createArea":          ResourceTypeOther,
	"getAreaById":         ResourceTypeOther,
	"updateAreaById":      ResourceTypeOther,
	"deleteAreaById":      ResourceTypeOther,

	"listLocations":       ResourceTypeOther,
	"createLocation":      ResourceTypeOther,
	"getLocationById":     ResourceTypeOther,
	"updateLocationById":  ResourceTypeOther,
	"deleteLocationById":  ResourceTypeOther,

	"listColors":          ResourceTypeOther,
	"createColor":         ResourceTypeOther,
	"getColorById":        ResourceTypeOther,
	"updateColorById":     ResourceTypeOther,
	"deleteColorById":     ResourceTypeOther,

	"listRoles":           ResourceTypeOther,
	"createRole":          ResourceTypeOther,
	"getRoleById":         ResourceTypeOther,
	"updateRoleById":      ResourceTypeOther,
	"deleteRoleById":      ResourceTypeOther,

	"listCertifications":  ResourceTypeOther,
	"createCertification": ResourceTypeOther,
	"getCertificationById": ResourceTypeOther,
	"updateCertificationById": ResourceTypeOther,
	"deleteCertificationById": ResourceTypeOther,

	"listHousingRooms":    ResourceTypeOther,
	"createHousingRoom":   ResourceTypeOther,
	"getHousingRoomById":  ResourceTypeOther,
	"updateHousingRoomById": ResourceTypeOther,
	"deleteHousingRoomById": ResourceTypeOther,

	"listSessions":        ResourceTypeOther,
	"createSession":       ResourceTypeOther,
	"getSessionById":      ResourceTypeOther,
	"updateSessionById":   ResourceTypeOther,
	"deleteSessionById":   ResourceTypeOther,

	"listGroups":          ResourceTypeOther,
	"createGroup":         ResourceTypeOther,
	"getGroupById":        ResourceTypeOther,
	"updateGroupById":     ResourceTypeOther,
	"deleteGroupById":     ResourceTypeOther,
}

