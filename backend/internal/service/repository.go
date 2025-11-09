package service

import (
	"context"

	"github.com/google/uuid"
	"github.com/tbechar/camp-manager-backend/internal/api"
	"github.com/tbechar/camp-manager-backend/internal/domain"
)

// ActivitiesRepository defines the data access interface for activities
type ActivitiesRepository interface {
	List(ctx context.Context, tenantId uuid.UUID, campId uuid.UUID, limit, offset int, search *string) ([]api.Activity, int, error)
	GetByID(ctx context.Context, tenantId uuid.UUID, campId uuid.UUID, id uuid.UUID) (*api.Activity, error)
	Create(ctx context.Context, activity *api.Activity) error
	Update(ctx context.Context, tenantId uuid.UUID, campId uuid.UUID, id uuid.UUID, activity *api.Activity) error
	Delete(ctx context.Context, tenantId uuid.UUID, campID uuid.UUID, id uuid.UUID) error
}

// AreasRepository defines the data access interface for areas
type AreasRepository interface {
	List(ctx context.Context, tenantID, campID uuid.UUID, limit, offset int, search *string) ([]domain.Area, int64, error)
	GetByID(ctx context.Context, tenantID, campID, id uuid.UUID) (*domain.Area, error)
	Create(ctx context.Context, area *domain.Area) error
	Update(ctx context.Context, tenantID, campID uuid.UUID, area *domain.Area) error
	Delete(ctx context.Context, tenantID, campID, id uuid.UUID) error
}

// CampersRepository defines the data access interface for campers
type CampersRepository interface {
	List(ctx context.Context, tenantId uuid.UUID, campId uuid.UUID, limit, offset int, search *string) ([]domain.Camper, int64, error)
	GetByID(ctx context.Context, tenantId uuid.UUID, campId uuid.UUID, id uuid.UUID) (*domain.Camper, error)
	Create(ctx context.Context, camper *domain.Camper) error
	Update(ctx context.Context, tenantId uuid.UUID, campId uuid.UUID, id uuid.UUID, camper *domain.Camper) error
	Delete(ctx context.Context, tenantId uuid.UUID, campId uuid.UUID, id uuid.UUID) error
}

// CertificationsRepository defines the data access interface for certifications
type CertificationsRepository interface {
	List(ctx context.Context, tenantID, campID uuid.UUID, limit, offset int, search *string) ([]domain.Certification, int64, error)
	GetByID(ctx context.Context, tenantID, campID, id uuid.UUID) (*domain.Certification, error)
	Create(ctx context.Context, certification *domain.Certification) error
	Update(ctx context.Context, tenantID, campID uuid.UUID, certification *domain.Certification) error
	Delete(ctx context.Context, tenantID, campID, id uuid.UUID) error
}

// CampsRepository defines the data access interface for camps
type CampsRepository interface {
	List(ctx context.Context, tenantID uuid.UUID, campIDs []uuid.UUID, limit, offset int, search *string) ([]domain.Camp, int64, error)
	GetByID(ctx context.Context, tenantID, campID uuid.UUID) (*domain.Camp, error)
	Create(ctx context.Context, camp *domain.Camp) error
	Update(ctx context.Context, camp *domain.Camp) error
	Delete(ctx context.Context, tenantID, campID uuid.UUID) error
}

// ColorsRepository defines the data access interface for colors
type ColorsRepository interface {
	List(ctx context.Context, tenantID, campID uuid.UUID, limit, offset int, search *string) ([]domain.Color, int64, error)
	GetByID(ctx context.Context, tenantID, campID, id uuid.UUID) (*domain.Color, error)
	Create(ctx context.Context, color *domain.Color) error
	Update(ctx context.Context, tenantID, campID uuid.UUID, color *domain.Color) error
	Delete(ctx context.Context, tenantID, campID, id uuid.UUID) error
}

// EventsRepository defines the data access interface for events
type EventsRepository interface {
	List(ctx context.Context, tenantId uuid.UUID, campId uuid.UUID, limit, offset int, search *string) ([]api.Event, int, error)
	GetByID(ctx context.Context, tenantId uuid.UUID, campId uuid.UUID, id uuid.UUID) (*api.Event, error)
	Create(ctx context.Context, event *api.Event) error
	Update(ctx context.Context, tenantId uuid.UUID, campId uuid.UUID, id uuid.UUID, event *api.Event) error
	Delete(ctx context.Context, tenantId uuid.UUID, campID uuid.UUID, id uuid.UUID) error
}

// GroupsRepository defines the data access interface for groups
type GroupsRepository interface {
	List(ctx context.Context, tenantId uuid.UUID, campId uuid.UUID, limit, offset int, search *string) ([]domain.Group, int64, error)
	GetByID(ctx context.Context, tenantId uuid.UUID, campId uuid.UUID, id uuid.UUID) (*domain.Group, error)
	FindByHousingRoomAndSession(ctx context.Context, tenantId, campId, housingRoomId, sessionId uuid.UUID) (*domain.Group, error)
	Create(ctx context.Context, group *domain.Group) error
	Update(ctx context.Context, tenantId uuid.UUID, campId uuid.UUID, id uuid.UUID, group *domain.Group) error
	Delete(ctx context.Context, tenantId uuid.UUID, campId uuid.UUID, id uuid.UUID) error
}

// HousingRoomsRepository defines the data access interface for housing rooms
type HousingRoomsRepository interface {
	List(ctx context.Context, tenantID, campID uuid.UUID, limit, offset int, search *string) ([]domain.HousingRoom, int64, error)
	GetByID(ctx context.Context, tenantID, campID, id uuid.UUID) (*domain.HousingRoom, error)
	Create(ctx context.Context, room *domain.HousingRoom) error
	Update(ctx context.Context, tenantID, campID uuid.UUID, room *domain.HousingRoom) error
	Delete(ctx context.Context, tenantID, campID, id uuid.UUID) error
}

// LocationsRepository defines the data access interface for locations
type LocationsRepository interface {
	List(ctx context.Context, tenantID, campID uuid.UUID, limit, offset int, search *string) ([]domain.Location, int64, error)
	GetByID(ctx context.Context, tenantID, campID, id uuid.UUID) (*domain.Location, error)
	Create(ctx context.Context, location *domain.Location) error
	Update(ctx context.Context, tenantID, campID uuid.UUID, location *domain.Location) error
	Delete(ctx context.Context, tenantID, campID, id uuid.UUID) error
}

// ProgramsRepository defines the data access interface for programs
type ProgramsRepository interface {
	List(ctx context.Context, tenantId uuid.UUID, campId uuid.UUID, limit, offset int, search *string) ([]api.Program, int, error)
	GetByID(ctx context.Context, tenantId uuid.UUID, campId uuid.UUID, id uuid.UUID) (*api.Program, error)
	Create(ctx context.Context, program *api.Program) error
	Update(ctx context.Context, tenantId uuid.UUID, campId uuid.UUID, id uuid.UUID, program *api.Program) error
	Delete(ctx context.Context, tenantId uuid.UUID, campID uuid.UUID, id uuid.UUID) error
}

// RolesRepository defines the data access interface for roles
type RolesRepository interface {
	List(ctx context.Context, tenantID, campID uuid.UUID, limit, offset int, search *string) ([]domain.Role, int64, error)
	GetByID(ctx context.Context, tenantID, campID, id uuid.UUID) (*domain.Role, error)
	Create(ctx context.Context, role *domain.Role) error
	Update(ctx context.Context, tenantID, campID uuid.UUID, role *domain.Role) error
	Delete(ctx context.Context, tenantID, campID, id uuid.UUID) error
}

// SessionsRepository defines the data access interface for sessions
type SessionsRepository interface {
	List(ctx context.Context, tenantId uuid.UUID, campId uuid.UUID, limit, offset int, search *string) ([]domain.Session, int64, error)
	GetByID(ctx context.Context, tenantId uuid.UUID, campId uuid.UUID, id uuid.UUID) (*domain.Session, error)
	Create(ctx context.Context, session *domain.Session) error
	Update(ctx context.Context, tenantId uuid.UUID, campId uuid.UUID, session *domain.Session) error
	Delete(ctx context.Context, tenantId uuid.UUID, campID uuid.UUID, id uuid.UUID) error
}

// StaffMembersRepository defines the data access interface for staff members
type StaffMembersRepository interface {
	List(ctx context.Context, tenantId uuid.UUID, campId uuid.UUID, limit, offset int, search *string) ([]domain.StaffMember, int64, error)
	GetByID(ctx context.Context, tenantId uuid.UUID, campId uuid.UUID, id uuid.UUID) (*domain.StaffMember, error)
	Create(ctx context.Context, tenantId uuid.UUID, campId uuid.UUID, staffMember *domain.StaffMember) error
	Update(ctx context.Context, tenantId uuid.UUID, campId uuid.UUID, id uuid.UUID, staffMember *domain.StaffMember) error
	Delete(ctx context.Context, tenantId uuid.UUID, campID uuid.UUID, id uuid.UUID) error
}

// UsersRepository defines the data access interface for users
type UsersRepository interface {
	FindByEmail(ctx context.Context, email string) (*domain.User, error)
	FindByID(ctx context.Context, id string) (*api.User, error)
	Create(ctx context.Context, user *api.User) error
	Update(ctx context.Context, id string, user *api.User) error
	Delete(ctx context.Context, id string) error
	GetUserWithAccessRules(ctx context.Context, id string) (*api.User, error)
	UpdateLastLogin(ctx context.Context, userID uuid.UUID) error
}

// TenantsRepository defines the data access interface for tenants (used by auth service)
type TenantsRepository interface {
	GetByID(ctx context.Context, id uuid.UUID) (*domain.Tenant, error)
	GetBySlug(ctx context.Context, slug string) (*domain.Tenant, error)
	Create(ctx context.Context, tenant *domain.Tenant) error
	Update(ctx context.Context, tenant *domain.Tenant) error
	Delete(ctx context.Context, tenantID uuid.UUID) error
}
