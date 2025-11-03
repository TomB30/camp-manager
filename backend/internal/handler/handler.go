package handler

import (
	"net/http"

	"github.com/tbechar/camp-manager-backend/internal/api"
	"github.com/tbechar/camp-manager-backend/internal/database"
	"github.com/tbechar/camp-manager-backend/internal/repository"
	"github.com/tbechar/camp-manager-backend/internal/service"
)

// Handler aggregates all entity handlers and implements the ServerInterface
type Handler struct {
	activities     *ActivitiesHandler
	areas          *AreasHandler
	campers        *CampersHandler
	certifications *CertificationsHandler
	colors         *ColorsHandler
	events         *EventsHandler
	groups         *GroupsHandler
	housingRooms   *HousingRoomsHandler
	locations      *LocationsHandler
	programs       *ProgramsHandler
	roles          *RolesHandler
	sessions       *SessionsHandler
	staffMembers   *StaffMembersHandler
	health         *HealthHandler
}

// NewHandler creates a new handler with all dependencies wired up
func NewHandler(db *database.Database) *Handler {
	// Initialize repositories
	activitiesRepo := repository.NewActivitiesRepository(db)
	areasRepo := repository.NewAreasRepository(db)
	campersRepo := repository.NewCampersRepository(db)
	certificationsRepo := repository.NewCertificationsRepository(db)
	colorsRepo := repository.NewColorsRepository(db)
	eventsRepo := repository.NewEventsRepository(db)
	groupsRepo := repository.NewGroupsRepository(db)
	housingRoomsRepo := repository.NewHousingRoomsRepository(db)
	locationsRepo := repository.NewLocationsRepository(db)
	programsRepo := repository.NewProgramsRepository(db)
	rolesRepo := repository.NewRolesRepository(db)
	sessionsRepo := repository.NewSessionsRepository(db)
	staffMembersRepo := repository.NewStaffMembersRepository(db)

	// Initialize services
	activitiesService := service.NewActivitiesService(activitiesRepo)
	areasService := service.NewAreasService(areasRepo)
	campersService := service.NewCampersService(campersRepo)
	certificationsService := service.NewCertificationsService(certificationsRepo)
	colorsService := service.NewColorsService(colorsRepo)
	eventsService := service.NewEventsService(eventsRepo)
	groupsService := service.NewGroupsService(groupsRepo)
	housingRoomsService := service.NewHousingRoomsService(housingRoomsRepo)
	locationsService := service.NewLocationsService(locationsRepo)
	programsService := service.NewProgramsService(programsRepo)
	rolesService := service.NewRolesService(rolesRepo)
	sessionsService := service.NewSessionsService(sessionsRepo)
	staffMembersService := service.NewStaffMembersService(staffMembersRepo)

	// Initialize handlers
	return &Handler{
		activities:     NewActivitiesHandler(activitiesService),
		areas:          NewAreasHandler(areasService),
		campers:        NewCampersHandler(campersService),
		certifications: NewCertificationsHandler(certificationsService),
		colors:         NewColorsHandler(colorsService),
		events:         NewEventsHandler(eventsService),
		groups:         NewGroupsHandler(groupsService),
		housingRooms:   NewHousingRoomsHandler(housingRoomsService),
		locations:      NewLocationsHandler(locationsService),
		programs:       NewProgramsHandler(programsService),
		roles:          NewRolesHandler(rolesService),
		sessions:       NewSessionsHandler(sessionsService),
		staffMembers:   NewStaffMembersHandler(staffMembersService),
		health:         NewHealthHandler(db),
	}
}

// Activities handlers - delegate to ActivitiesHandler

func (h *Handler) ListActivities(w http.ResponseWriter, r *http.Request, params api.ListActivitiesParams) {
	h.activities.ListActivities(w, r, params)
}

func (h *Handler) CreateActivity(w http.ResponseWriter, r *http.Request) {
	h.activities.CreateActivity(w, r)
}

func (h *Handler) GetActivityById(w http.ResponseWriter, r *http.Request, id api.Id) {
	h.activities.GetActivityById(w, r, id)
}

func (h *Handler) UpdateActivityById(w http.ResponseWriter, r *http.Request, id api.Id) {
	h.activities.UpdateActivityById(w, r, id)
}

func (h *Handler) DeleteActivityById(w http.ResponseWriter, r *http.Request, id api.Id) {
	h.activities.DeleteActivityById(w, r, id)
}

// Areas handlers - delegate to AreasHandler

func (h *Handler) ListAreas(w http.ResponseWriter, r *http.Request, params api.ListAreasParams) {
	h.areas.ListAreas(w, r, params)
}

func (h *Handler) CreateArea(w http.ResponseWriter, r *http.Request) {
	h.areas.CreateArea(w, r)
}

func (h *Handler) GetAreaById(w http.ResponseWriter, r *http.Request, id api.Id) {
	h.areas.GetAreaById(w, r, id)
}

func (h *Handler) UpdateAreaById(w http.ResponseWriter, r *http.Request, id api.Id) {
	h.areas.UpdateAreaById(w, r, id)
}

func (h *Handler) DeleteAreaById(w http.ResponseWriter, r *http.Request, id api.Id) {
	h.areas.DeleteAreaById(w, r, id)
}

// Campers handlers - delegate to CampersHandler

func (h *Handler) ListCampers(w http.ResponseWriter, r *http.Request, params api.ListCampersParams) {
	h.campers.ListCampers(w, r, params)
}

func (h *Handler) CreateCamper(w http.ResponseWriter, r *http.Request) {
	h.campers.CreateCamper(w, r)
}

func (h *Handler) GetCamperById(w http.ResponseWriter, r *http.Request, id api.Id) {
	h.campers.GetCamperById(w, r, id)
}

func (h *Handler) UpdateCamperById(w http.ResponseWriter, r *http.Request, id api.Id) {
	h.campers.UpdateCamperById(w, r, id)
}

func (h *Handler) DeleteCamperById(w http.ResponseWriter, r *http.Request, id api.Id) {
	h.campers.DeleteCamperById(w, r, id)
}

// Certifications handlers - delegate to CertificationsHandler

func (h *Handler) ListCertifications(w http.ResponseWriter, r *http.Request, params api.ListCertificationsParams) {
	h.certifications.ListCertifications(w, r, params)
}

func (h *Handler) CreateCertification(w http.ResponseWriter, r *http.Request) {
	h.certifications.CreateCertification(w, r)
}

func (h *Handler) GetCertificationById(w http.ResponseWriter, r *http.Request, id api.Id) {
	h.certifications.GetCertificationById(w, r, id)
}

func (h *Handler) UpdateCertificationById(w http.ResponseWriter, r *http.Request, id api.Id) {
	h.certifications.UpdateCertificationById(w, r, id)
}

func (h *Handler) DeleteCertificationById(w http.ResponseWriter, r *http.Request, id api.Id) {
	h.certifications.DeleteCertificationById(w, r, id)
}

// Colors handlers - delegate to ColorsHandler

func (h *Handler) ListColors(w http.ResponseWriter, r *http.Request, params api.ListColorsParams) {
	h.colors.ListColors(w, r, params)
}

func (h *Handler) CreateColor(w http.ResponseWriter, r *http.Request) {
	h.colors.CreateColor(w, r)
}

func (h *Handler) GetColorById(w http.ResponseWriter, r *http.Request, id api.Id) {
	h.colors.GetColorById(w, r, id)
}

func (h *Handler) UpdateColorById(w http.ResponseWriter, r *http.Request, id api.Id) {
	h.colors.UpdateColorById(w, r, id)
}

func (h *Handler) DeleteColorById(w http.ResponseWriter, r *http.Request, id api.Id) {
	h.colors.DeleteColorById(w, r, id)
}

// Events handlers - delegate to EventsHandler

func (h *Handler) ListEvents(w http.ResponseWriter, r *http.Request, params api.ListEventsParams) {
	h.events.ListEvents(w, r, params)
}

func (h *Handler) CreateEvent(w http.ResponseWriter, r *http.Request) {
	h.events.CreateEvent(w, r)
}

func (h *Handler) GetEventById(w http.ResponseWriter, r *http.Request, id api.Id) {
	h.events.GetEventById(w, r, id)
}

func (h *Handler) UpdateEventById(w http.ResponseWriter, r *http.Request, id api.Id) {
	h.events.UpdateEventById(w, r, id)
}

func (h *Handler) DeleteEventById(w http.ResponseWriter, r *http.Request, id api.Id) {
	h.events.DeleteEventById(w, r, id)
}

// Groups handlers - delegate to GroupsHandler

func (h *Handler) ListGroups(w http.ResponseWriter, r *http.Request, params api.ListGroupsParams) {
	h.groups.ListGroups(w, r, params)
}

func (h *Handler) CreateGroup(w http.ResponseWriter, r *http.Request) {
	h.groups.CreateGroup(w, r)
}

func (h *Handler) GetGroupById(w http.ResponseWriter, r *http.Request, id api.Id) {
	h.groups.GetGroupById(w, r, id)
}

func (h *Handler) UpdateGroupById(w http.ResponseWriter, r *http.Request, id api.Id) {
	h.groups.UpdateGroupById(w, r, id)
}

func (h *Handler) DeleteGroupById(w http.ResponseWriter, r *http.Request, id api.Id) {
	h.groups.DeleteGroupById(w, r, id)
}

// Housing Rooms handlers - delegate to HousingRoomsHandler

func (h *Handler) ListHousingRooms(w http.ResponseWriter, r *http.Request, params api.ListHousingRoomsParams) {
	h.housingRooms.ListHousingRooms(w, r, params)
}

func (h *Handler) CreateHousingRoom(w http.ResponseWriter, r *http.Request) {
	h.housingRooms.CreateHousingRoom(w, r)
}

func (h *Handler) GetHousingRoomById(w http.ResponseWriter, r *http.Request, id api.Id) {
	h.housingRooms.GetHousingRoomById(w, r, id)
}

func (h *Handler) UpdateHousingRoomById(w http.ResponseWriter, r *http.Request, id api.Id) {
	h.housingRooms.UpdateHousingRoomById(w, r, id)
}

func (h *Handler) DeleteHousingRoomById(w http.ResponseWriter, r *http.Request, id api.Id) {
	h.housingRooms.DeleteHousingRoomById(w, r, id)
}

// Locations handlers - delegate to LocationsHandler

func (h *Handler) ListLocations(w http.ResponseWriter, r *http.Request, params api.ListLocationsParams) {
	h.locations.ListLocations(w, r, params)
}

func (h *Handler) CreateLocation(w http.ResponseWriter, r *http.Request) {
	h.locations.CreateLocation(w, r)
}

func (h *Handler) GetLocationById(w http.ResponseWriter, r *http.Request, id api.Id) {
	h.locations.GetLocationById(w, r, id)
}

func (h *Handler) UpdateLocationById(w http.ResponseWriter, r *http.Request, id api.Id) {
	h.locations.UpdateLocationById(w, r, id)
}

func (h *Handler) DeleteLocationById(w http.ResponseWriter, r *http.Request, id api.Id) {
	h.locations.DeleteLocationById(w, r, id)
}

// Programs handlers - delegate to ProgramsHandler

func (h *Handler) ListPrograms(w http.ResponseWriter, r *http.Request, params api.ListProgramsParams) {
	h.programs.ListPrograms(w, r, params)
}

func (h *Handler) CreateProgram(w http.ResponseWriter, r *http.Request) {
	h.programs.CreateProgram(w, r)
}

func (h *Handler) GetProgramById(w http.ResponseWriter, r *http.Request, id api.Id) {
	h.programs.GetProgramById(w, r, id)
}

func (h *Handler) UpdateProgramById(w http.ResponseWriter, r *http.Request, id api.Id) {
	h.programs.UpdateProgramById(w, r, id)
}

func (h *Handler) DeleteProgramById(w http.ResponseWriter, r *http.Request, id api.Id) {
	h.programs.DeleteProgramById(w, r, id)
}

// Roles handlers - delegate to RolesHandler

func (h *Handler) ListRoles(w http.ResponseWriter, r *http.Request, params api.ListRolesParams) {
	h.roles.ListRoles(w, r, params)
}

func (h *Handler) CreateRole(w http.ResponseWriter, r *http.Request) {
	h.roles.CreateRole(w, r)
}

func (h *Handler) GetRoleById(w http.ResponseWriter, r *http.Request, id api.Id) {
	h.roles.GetRoleById(w, r, id)
}

func (h *Handler) UpdateRoleById(w http.ResponseWriter, r *http.Request, id api.Id) {
	h.roles.UpdateRoleById(w, r, id)
}

func (h *Handler) DeleteRoleById(w http.ResponseWriter, r *http.Request, id api.Id) {
	h.roles.DeleteRoleById(w, r, id)
}

// Sessions handlers - delegate to SessionsHandler

func (h *Handler) ListSessions(w http.ResponseWriter, r *http.Request, params api.ListSessionsParams) {
	h.sessions.ListSessions(w, r, params)
}

func (h *Handler) CreateSession(w http.ResponseWriter, r *http.Request) {
	h.sessions.CreateSession(w, r)
}

func (h *Handler) GetSessionById(w http.ResponseWriter, r *http.Request, id api.Id) {
	h.sessions.GetSessionById(w, r, id)
}

func (h *Handler) UpdateSessionById(w http.ResponseWriter, r *http.Request, id api.Id) {
	h.sessions.UpdateSessionById(w, r, id)
}

func (h *Handler) DeleteSessionById(w http.ResponseWriter, r *http.Request, id api.Id) {
	h.sessions.DeleteSessionById(w, r, id)
}

// Staff Members handlers - delegate to StaffMembersHandler

func (h *Handler) ListStaffMembers(w http.ResponseWriter, r *http.Request, params api.ListStaffMembersParams) {
	h.staffMembers.ListStaffMembers(w, r, params)
}

func (h *Handler) CreateStaffMember(w http.ResponseWriter, r *http.Request) {
	h.staffMembers.CreateStaffMember(w, r)
}

func (h *Handler) GetStaffMemberById(w http.ResponseWriter, r *http.Request, id api.Id) {
	h.staffMembers.GetStaffMemberById(w, r, id)
}

func (h *Handler) UpdateStaffMemberById(w http.ResponseWriter, r *http.Request, id api.Id) {
	h.staffMembers.UpdateStaffMemberById(w, r, id)
}

func (h *Handler) DeleteStaffMemberById(w http.ResponseWriter, r *http.Request, id api.Id) {
	h.staffMembers.DeleteStaffMemberById(w, r, id)
}
