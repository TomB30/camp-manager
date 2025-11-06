package service

import (
	"context"

	"github.com/google/uuid"
	"github.com/tbechar/camp-manager-backend/internal/api"
	"github.com/tbechar/camp-manager-backend/internal/domain"
)

// ActivitiesRepository defines the data access interface for activities
type ActivitiesRepository interface {
	List(ctx context.Context, limit, offset int, search *string) ([]api.Activity, int, error)
	GetByID(ctx context.Context, id uuid.UUID) (*api.Activity, error)
	Create(ctx context.Context, activity *api.Activity) error
	Update(ctx context.Context, id uuid.UUID, activity *api.Activity) error
	Delete(ctx context.Context, id uuid.UUID) error
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
	List(ctx context.Context, limit, offset int, search *string) ([]api.Camper, int, error)
	GetByID(ctx context.Context, id uuid.UUID) (*api.Camper, error)
	Create(ctx context.Context, camper *api.Camper) error
	Update(ctx context.Context, id uuid.UUID, camper *api.Camper) error
	Delete(ctx context.Context, id uuid.UUID) error
}

// CertificationsRepository defines the data access interface for certifications
type CertificationsRepository interface {
	List(ctx context.Context, limit, offset int, search *string) ([]api.Certification, int, error)
	GetByID(ctx context.Context, id uuid.UUID) (*api.Certification, error)
	Create(ctx context.Context, certification *api.Certification) error
	Update(ctx context.Context, id uuid.UUID, certification *api.Certification) error
	Delete(ctx context.Context, id uuid.UUID) error
}

// CampsRepository defines the data access interface for camps
type CampsRepository interface {
	List(ctx context.Context, tenantID uuid.UUID, limit, offset int, search *string) ([]domain.Camp, int64, error)
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
	List(ctx context.Context, limit, offset int, search *string) ([]api.Event, int, error)
	GetByID(ctx context.Context, id uuid.UUID) (*api.Event, error)
	Create(ctx context.Context, event *api.Event) error
	Update(ctx context.Context, id uuid.UUID, event *api.Event) error
	Delete(ctx context.Context, id uuid.UUID) error
}

// GroupsRepository defines the data access interface for groups
type GroupsRepository interface {
	List(ctx context.Context, limit, offset int, search *string) ([]api.Group, int, error)
	GetByID(ctx context.Context, id uuid.UUID) (*api.Group, error)
	Create(ctx context.Context, group *api.Group) error
	Update(ctx context.Context, id uuid.UUID, group *api.Group) error
	Delete(ctx context.Context, id uuid.UUID) error
}

// HousingRoomsRepository defines the data access interface for housing rooms
type HousingRoomsRepository interface {
	List(ctx context.Context, limit, offset int, search *string) ([]api.HousingRoom, int, error)
	GetByID(ctx context.Context, id uuid.UUID) (*api.HousingRoom, error)
	Create(ctx context.Context, room *api.HousingRoom) error
	Update(ctx context.Context, id uuid.UUID, room *api.HousingRoom) error
	Delete(ctx context.Context, id uuid.UUID) error
}

// LocationsRepository defines the data access interface for locations
type LocationsRepository interface {
	List(ctx context.Context, limit, offset int, search *string) ([]api.Location, int, error)
	GetByID(ctx context.Context, id uuid.UUID) (*api.Location, error)
	Create(ctx context.Context, location *api.Location) error
	Update(ctx context.Context, id uuid.UUID, location *api.Location) error
	Delete(ctx context.Context, id uuid.UUID) error
}

// ProgramsRepository defines the data access interface for programs
type ProgramsRepository interface {
	List(ctx context.Context, limit, offset int, search *string) ([]api.Program, int, error)
	GetByID(ctx context.Context, id uuid.UUID) (*api.Program, error)
	Create(ctx context.Context, program *api.Program) error
	Update(ctx context.Context, id uuid.UUID, program *api.Program) error
	Delete(ctx context.Context, id uuid.UUID) error
}

// RolesRepository defines the data access interface for roles
type RolesRepository interface {
	List(ctx context.Context, limit, offset int, search *string) ([]api.Role, int, error)
	GetByID(ctx context.Context, id uuid.UUID) (*api.Role, error)
	Create(ctx context.Context, role *api.Role) error
	Update(ctx context.Context, id uuid.UUID, role *api.Role) error
	Delete(ctx context.Context, id uuid.UUID) error
}

// SessionsRepository defines the data access interface for sessions
type SessionsRepository interface {
	List(ctx context.Context, limit, offset int, search *string) ([]api.Session, int, error)
	GetByID(ctx context.Context, id uuid.UUID) (*api.Session, error)
	Create(ctx context.Context, session *api.Session) error
	Update(ctx context.Context, id uuid.UUID, session *api.Session) error
	Delete(ctx context.Context, id uuid.UUID) error
}

// StaffMembersRepository defines the data access interface for staff members
type StaffMembersRepository interface {
	List(ctx context.Context, limit, offset int, search *string) ([]api.StaffMember, int, error)
	GetByID(ctx context.Context, id uuid.UUID) (*api.StaffMember, error)
	Create(ctx context.Context, staffMember *api.StaffMember) error
	Update(ctx context.Context, id uuid.UUID, staffMember *api.StaffMember) error
	Delete(ctx context.Context, id uuid.UUID) error
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
