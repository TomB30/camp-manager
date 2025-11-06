package handler

import (
	"net/http"

	"github.com/tbechar/camp-manager-backend/internal/api"
	"github.com/tbechar/camp-manager-backend/internal/config"
	"github.com/tbechar/camp-manager-backend/internal/database"
	"github.com/tbechar/camp-manager-backend/internal/domain"
	"github.com/tbechar/camp-manager-backend/internal/repository"
	"github.com/tbechar/camp-manager-backend/internal/service"
)

// Handler aggregates all entity handlers and implements the ServerInterface
type Handler struct {
	activities     *ActivitiesHandler
	areas          *AreasHandler
	auth           *AuthHandler
	campers        *CampersHandler
	camps          *CampsHandler
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
	tenants        *TenantsHandler
	health         *HealthHandler
}

// NewHandler creates a new handler with all dependencies wired up
func NewHandler(db *database.Database, cfg *config.Config) *Handler {
	// Initialize repositories
	activitiesRepo := repository.NewActivitiesRepository(db)
	areasRepo := repository.NewAreasRepository(db)
	campersRepo := repository.NewCampersRepository(db)
	campsRepo := repository.NewCampsRepository(db)
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
	tenantsRepo := repository.NewTenantsRepository(db)
	usersRepo := repository.NewUsersRepository(db)

	// Initialize JWT service
	jwtService := domain.NewJWTService(cfg.JWT.SecretKey)

	// Initialize services
	activitiesService := service.NewActivitiesService(activitiesRepo)
	areasService := service.NewAreasService(areasRepo)
	authService := service.NewAuthService(usersRepo, jwtService)
	campersService := service.NewCampersService(campersRepo)
	campsService := service.NewCampsService(campsRepo)
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
	tenantsService := service.NewTenantsService(tenantsRepo)

	// Initialize handlers
	return &Handler{
		activities:     NewActivitiesHandler(activitiesService),
		areas:          NewAreasHandler(areasService),
		auth:           NewAuthHandler(authService),
		campers:        NewCampersHandler(campersService),
		camps:          NewCampsHandler(campsService),
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
		tenants:        NewTenantsHandler(tenantsService),
		health:         NewHealthHandler(db),
	}
}

// Activities handlers - delegate to ActivitiesHandler

func (h *Handler) ListActivities(w http.ResponseWriter, r *http.Request, campId api.CampId, params api.ListActivitiesParams) {
	h.activities.ListActivities(w, r, campId, params)
}

func (h *Handler) CreateActivity(w http.ResponseWriter, r *http.Request, campId api.CampId) {
	h.activities.CreateActivity(w, r, campId)
}

func (h *Handler) GetActivityById(w http.ResponseWriter, r *http.Request, campId api.CampId, id api.Id) {
	h.activities.GetActivityById(w, r, campId, id)
}

func (h *Handler) UpdateActivityById(w http.ResponseWriter, r *http.Request, campId api.CampId, id api.Id) {
	h.activities.UpdateActivityById(w, r, campId, id)
}

func (h *Handler) DeleteActivityById(w http.ResponseWriter, r *http.Request, campId api.CampId, id api.Id) {
	h.activities.DeleteActivityById(w, r, campId, id)
}

// Areas handlers - delegate to AreasHandler

func (h *Handler) ListAreas(w http.ResponseWriter, r *http.Request, campId api.CampId, params api.ListAreasParams) {
	h.areas.ListAreas(w, r, campId, params)
}

func (h *Handler) CreateArea(w http.ResponseWriter, r *http.Request, campId api.CampId) {
	h.areas.CreateArea(w, r, campId)
}

func (h *Handler) GetAreaById(w http.ResponseWriter, r *http.Request, campId api.CampId, id api.Id) {
	h.areas.GetAreaById(w, r, campId, id)
}

func (h *Handler) UpdateAreaById(w http.ResponseWriter, r *http.Request, campId api.CampId, id api.Id) {
	h.areas.UpdateAreaById(w, r, campId, id)
}

func (h *Handler) DeleteAreaById(w http.ResponseWriter, r *http.Request, campId api.CampId, id api.Id) {
	h.areas.DeleteAreaById(w, r, campId, id)
}

// Camp management handlers (tenant-level) - delegate to CampsHandler

func (h *Handler) GetCamps(w http.ResponseWriter, r *http.Request) {
	h.camps.GetCamps(w, r)
}

func (h *Handler) CreateCamp(w http.ResponseWriter, r *http.Request) {
	h.camps.CreateCamp(w, r)
}

func (h *Handler) GetCampById(w http.ResponseWriter, r *http.Request, id api.Id) {
	h.camps.GetCampById(w, r, id)
}

func (h *Handler) UpdateCampById(w http.ResponseWriter, r *http.Request, id api.Id) {
	h.camps.UpdateCampById(w, r, id)
}

func (h *Handler) DeleteCampById(w http.ResponseWriter, r *http.Request, id api.Id) {
	h.camps.DeleteCampById(w, r, id)
}

// Campers handlers - delegate to CampersHandler

func (h *Handler) ListCampers(w http.ResponseWriter, r *http.Request, campId api.CampId, params api.ListCampersParams) {
	h.campers.ListCampers(w, r, campId, params)
}

func (h *Handler) CreateCamper(w http.ResponseWriter, r *http.Request, campId api.CampId) {
	h.campers.CreateCamper(w, r, campId)
}

func (h *Handler) GetCamperById(w http.ResponseWriter, r *http.Request, campId api.CampId, id api.Id) {
	h.campers.GetCamperById(w, r, campId, id)
}

func (h *Handler) UpdateCamperById(w http.ResponseWriter, r *http.Request, campId api.CampId, id api.Id) {
	h.campers.UpdateCamperById(w, r, campId, id)
}

func (h *Handler) DeleteCamperById(w http.ResponseWriter, r *http.Request, campId api.CampId, id api.Id) {
	h.campers.DeleteCamperById(w, r, campId, id)
}

// Certifications handlers - delegate to CertificationsHandler

func (h *Handler) ListCertifications(w http.ResponseWriter, r *http.Request, campId api.CampId, params api.ListCertificationsParams) {
	h.certifications.ListCertifications(w, r, campId, params)
}

func (h *Handler) CreateCertification(w http.ResponseWriter, r *http.Request, campId api.CampId) {
	h.certifications.CreateCertification(w, r, campId)
}

func (h *Handler) GetCertificationById(w http.ResponseWriter, r *http.Request, campId api.CampId, id api.Id) {
	h.certifications.GetCertificationById(w, r, campId, id)
}

func (h *Handler) UpdateCertificationById(w http.ResponseWriter, r *http.Request, campId api.CampId, id api.Id) {
	h.certifications.UpdateCertificationById(w, r, campId, id)
}

func (h *Handler) DeleteCertificationById(w http.ResponseWriter, r *http.Request, campId api.CampId, id api.Id) {
	h.certifications.DeleteCertificationById(w, r, campId, id)
}

// Colors handlers - delegate to ColorsHandler

func (h *Handler) ListColors(w http.ResponseWriter, r *http.Request, campId api.CampId, params api.ListColorsParams) {
	h.colors.ListColors(w, r, campId, params)
}

func (h *Handler) CreateColor(w http.ResponseWriter, r *http.Request, campId api.CampId) {
	h.colors.CreateColor(w, r, campId)
}

func (h *Handler) GetColorById(w http.ResponseWriter, r *http.Request, campId api.CampId, id api.Id) {
	h.colors.GetColorById(w, r, campId, id)
}

func (h *Handler) UpdateColorById(w http.ResponseWriter, r *http.Request, campId api.CampId, id api.Id) {
	h.colors.UpdateColorById(w, r, campId, id)
}

func (h *Handler) DeleteColorById(w http.ResponseWriter, r *http.Request, campId api.CampId, id api.Id) {
	h.colors.DeleteColorById(w, r, campId, id)
}

// Events handlers - delegate to EventsHandler

func (h *Handler) ListEvents(w http.ResponseWriter, r *http.Request, campId api.CampId, params api.ListEventsParams) {
	h.events.ListEvents(w, r, campId, params)
}

func (h *Handler) CreateEvent(w http.ResponseWriter, r *http.Request, campId api.CampId) {
	h.events.CreateEvent(w, r, campId)
}

func (h *Handler) GetEventById(w http.ResponseWriter, r *http.Request, campId api.CampId, id api.Id) {
	h.events.GetEventById(w, r, campId, id)
}

func (h *Handler) UpdateEventById(w http.ResponseWriter, r *http.Request, campId api.CampId, id api.Id) {
	h.events.UpdateEventById(w, r, campId, id)
}

func (h *Handler) DeleteEventById(w http.ResponseWriter, r *http.Request, campId api.CampId, id api.Id) {
	h.events.DeleteEventById(w, r, campId, id)
}

// Groups handlers - delegate to GroupsHandler

func (h *Handler) ListGroups(w http.ResponseWriter, r *http.Request, campId api.CampId, params api.ListGroupsParams) {
	h.groups.ListGroups(w, r, campId, params)
}

func (h *Handler) CreateGroup(w http.ResponseWriter, r *http.Request, campId api.CampId) {
	h.groups.CreateGroup(w, r, campId)
}

func (h *Handler) GetGroupById(w http.ResponseWriter, r *http.Request, campId api.CampId, id api.Id) {
	h.groups.GetGroupById(w, r, campId, id)
}

func (h *Handler) UpdateGroupById(w http.ResponseWriter, r *http.Request, campId api.CampId, id api.Id) {
	h.groups.UpdateGroupById(w, r, campId, id)
}

func (h *Handler) DeleteGroupById(w http.ResponseWriter, r *http.Request, campId api.CampId, id api.Id) {
	h.groups.DeleteGroupById(w, r, campId, id)
}

// Housing Rooms handlers - delegate to HousingRoomsHandler

func (h *Handler) ListHousingRooms(w http.ResponseWriter, r *http.Request, campId api.CampId, params api.ListHousingRoomsParams) {
	h.housingRooms.ListHousingRooms(w, r, campId, params)
}

func (h *Handler) CreateHousingRoom(w http.ResponseWriter, r *http.Request, campId api.CampId) {
	h.housingRooms.CreateHousingRoom(w, r, campId)
}

func (h *Handler) GetHousingRoomById(w http.ResponseWriter, r *http.Request, campId api.CampId, id api.Id) {
	h.housingRooms.GetHousingRoomById(w, r, campId, id)
}

func (h *Handler) UpdateHousingRoomById(w http.ResponseWriter, r *http.Request, campId api.CampId, id api.Id) {
	h.housingRooms.UpdateHousingRoomById(w, r, campId, id)
}

func (h *Handler) DeleteHousingRoomById(w http.ResponseWriter, r *http.Request, campId api.CampId, id api.Id) {
	h.housingRooms.DeleteHousingRoomById(w, r, campId, id)
}

// Locations handlers - delegate to LocationsHandler

func (h *Handler) ListLocations(w http.ResponseWriter, r *http.Request, campId api.CampId, params api.ListLocationsParams) {
	h.locations.ListLocations(w, r, campId, params)
}

func (h *Handler) CreateLocation(w http.ResponseWriter, r *http.Request, campId api.CampId) {
	h.locations.CreateLocation(w, r, campId)
}

func (h *Handler) GetLocationById(w http.ResponseWriter, r *http.Request, campId api.CampId, id api.Id) {
	h.locations.GetLocationById(w, r, campId, id)
}

func (h *Handler) UpdateLocationById(w http.ResponseWriter, r *http.Request, campId api.CampId, id api.Id) {
	h.locations.UpdateLocationById(w, r, campId, id)
}

func (h *Handler) DeleteLocationById(w http.ResponseWriter, r *http.Request, campId api.CampId, id api.Id) {
	h.locations.DeleteLocationById(w, r, campId, id)
}

// Programs handlers - delegate to ProgramsHandler

func (h *Handler) ListPrograms(w http.ResponseWriter, r *http.Request, campId api.CampId, params api.ListProgramsParams) {
	h.programs.ListPrograms(w, r, campId, params)
}

func (h *Handler) CreateProgram(w http.ResponseWriter, r *http.Request, campId api.CampId) {
	h.programs.CreateProgram(w, r, campId)
}

func (h *Handler) GetProgramById(w http.ResponseWriter, r *http.Request, campId api.CampId, id api.Id) {
	h.programs.GetProgramById(w, r, campId, id)
}

func (h *Handler) UpdateProgramById(w http.ResponseWriter, r *http.Request, campId api.CampId, id api.Id) {
	h.programs.UpdateProgramById(w, r, campId, id)
}

func (h *Handler) DeleteProgramById(w http.ResponseWriter, r *http.Request, campId api.CampId, id api.Id) {
	h.programs.DeleteProgramById(w, r, campId, id)
}

// Roles handlers - delegate to RolesHandler

func (h *Handler) ListRoles(w http.ResponseWriter, r *http.Request, campId api.CampId, params api.ListRolesParams) {
	h.roles.ListRoles(w, r, campId, params)
}

func (h *Handler) CreateRole(w http.ResponseWriter, r *http.Request, campId api.CampId) {
	h.roles.CreateRole(w, r, campId)
}

func (h *Handler) GetRoleById(w http.ResponseWriter, r *http.Request, campId api.CampId, id api.Id) {
	h.roles.GetRoleById(w, r, campId, id)
}

func (h *Handler) UpdateRoleById(w http.ResponseWriter, r *http.Request, campId api.CampId, id api.Id) {
	h.roles.UpdateRoleById(w, r, campId, id)
}

func (h *Handler) DeleteRoleById(w http.ResponseWriter, r *http.Request, campId api.CampId, id api.Id) {
	h.roles.DeleteRoleById(w, r, campId, id)
}

// Sessions handlers - delegate to SessionsHandler

func (h *Handler) ListSessions(w http.ResponseWriter, r *http.Request, campId api.CampId, params api.ListSessionsParams) {
	h.sessions.ListSessions(w, r, campId, params)
}

func (h *Handler) CreateSession(w http.ResponseWriter, r *http.Request, campId api.CampId) {
	h.sessions.CreateSession(w, r, campId)
}

func (h *Handler) GetSessionById(w http.ResponseWriter, r *http.Request, campId api.CampId, id api.Id) {
	h.sessions.GetSessionById(w, r, campId, id)
}

func (h *Handler) UpdateSessionById(w http.ResponseWriter, r *http.Request, campId api.CampId, id api.Id) {
	h.sessions.UpdateSessionById(w, r, campId, id)
}

func (h *Handler) DeleteSessionById(w http.ResponseWriter, r *http.Request, campId api.CampId, id api.Id) {
	h.sessions.DeleteSessionById(w, r, campId, id)
}

// Staff Members handlers - delegate to StaffMembersHandler

func (h *Handler) ListStaffMembers(w http.ResponseWriter, r *http.Request, campId api.CampId, params api.ListStaffMembersParams) {
	h.staffMembers.ListStaffMembers(w, r, campId, params)
}

func (h *Handler) CreateStaffMember(w http.ResponseWriter, r *http.Request, campId api.CampId) {
	h.staffMembers.CreateStaffMember(w, r, campId)
}

func (h *Handler) GetStaffMemberById(w http.ResponseWriter, r *http.Request, campId api.CampId, id api.Id) {
	h.staffMembers.GetStaffMemberById(w, r, campId, id)
}

func (h *Handler) UpdateStaffMemberById(w http.ResponseWriter, r *http.Request, campId api.CampId, id api.Id) {
	h.staffMembers.UpdateStaffMemberById(w, r, campId, id)
}

func (h *Handler) DeleteStaffMemberById(w http.ResponseWriter, r *http.Request, campId api.CampId, id api.Id) {
	h.staffMembers.DeleteStaffMemberById(w, r, campId, id)
}

// Authentication handlers - delegate to AuthHandler

func (h *Handler) Login(w http.ResponseWriter, r *http.Request) {
	h.auth.Login(w, r)
}

func (h *Handler) Signup(w http.ResponseWriter, r *http.Request) {
	h.auth.Signup(w, r)
}

func (h *Handler) GetCurrentUser(w http.ResponseWriter, r *http.Request) {
	h.auth.GetCurrentUser(w, r)
}

func (h *Handler) Logout(w http.ResponseWriter, r *http.Request) {
	h.auth.Logout(w, r)
}

// Tenant management handlers - delegate to TenantsHandler

func (h *Handler) GetTenants(w http.ResponseWriter, r *http.Request) {
	h.tenants.GetTenants(w, r)
}

func (h *Handler) GetTenantById(w http.ResponseWriter, r *http.Request, id api.Id) {
	h.tenants.GetTenantById(w, r, id)
}
