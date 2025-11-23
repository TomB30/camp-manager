package service

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/tbechar/camp-manager-backend/internal/api"
	"github.com/tbechar/camp-manager-backend/internal/domain"
	pkgerrors "github.com/tbechar/camp-manager-backend/pkg/errors"
	"github.com/tbechar/camp-manager-backend/pkg/utils"
	"gorm.io/gorm"
)

// EventsService defines the interface for event business logic
type EventsService interface {
	// List retrieves events with pagination and optional search
	List(ctx context.Context, tenantID, campID uuid.UUID, limit, offset int, search *string, filterStrings []string, sortBy *string, sortOrder string) (*api.EventsListResponse, error)

	// GetByID retrieves a single event by ID
	GetByID(ctx context.Context, tenantID, campID, id uuid.UUID) (*api.Event, error)

	// Create creates a new event
	Create(ctx context.Context, tenantID, campID uuid.UUID, req *api.EventCreationRequest) (*api.Event, error)

	// CreateRecurringSeries creates a series of recurring events
	CreateRecurringSeries(ctx context.Context, tenantID, campID uuid.UUID, req *api.EventCreationRequest, startDate, endDate time.Time) ([]api.Event, error)

	// Update updates an existing event
	Update(ctx context.Context, tenantID, campID, id uuid.UUID, req *api.EventUpdateRequest, updateScope string) (*api.Event, error)

	// Delete deletes an event by ID
	Delete(ctx context.Context, tenantID, campID, id uuid.UUID, deleteScope string) error
}

// eventsService implements EventsService
type eventsService struct {
	repo           EventsRepository
	activitiesRepo ActivitiesRepository
	programsRepo   ProgramsRepository
	locationsRepo  LocationsRepository
	groupsRepo     GroupsRepository
}

// NewEventsService creates a new events service
func NewEventsService(repo EventsRepository, activitiesRepo ActivitiesRepository, programsRepo ProgramsRepository, locationsRepo LocationsRepository, groupsRepo GroupsRepository) EventsService {
	return &eventsService{
		repo:           repo,
		activitiesRepo: activitiesRepo,
		programsRepo:   programsRepo,
		locationsRepo:  locationsRepo,
		groupsRepo:     groupsRepo,
	}
}

// List retrieves events with pagination and optional search
func (s *eventsService) List(ctx context.Context, tenantID, campID uuid.UUID, limit, offset int, search *string, filterStrings []string, sortBy *string, sortOrder string) (*api.EventsListResponse, error) {
	events, total, err := s.repo.List(ctx, tenantID, campID, limit, offset, search, filterStrings, sortBy, sortOrder)
	if err != nil {
		return nil, pkgerrors.BadRequest("Failed to list events", err)
	}

	// Convert domain events to API events
	apiEvents := make([]api.Event, len(events))
	for i, event := range events {
		apiEvents[i] = event.ToAPI()
	}

	return &api.EventsListResponse{
		Items:  apiEvents,
		Limit:  limit,
		Offset: offset,
		Total:  int(total),
	}, nil
}

// GetByID retrieves a single event by ID
func (s *eventsService) GetByID(ctx context.Context, tenantID, campID, id uuid.UUID) (*api.Event, error) {
	event, err := s.repo.GetByID(ctx, tenantID, campID, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, pkgerrors.NotFound("Event not found", err)
		}
		return nil, pkgerrors.InternalServerError("Failed to get event", err)
	}

	apiEvent := event.ToAPI()
	return &apiEvent, nil
}

// Create creates a new event
func (s *eventsService) Create(ctx context.Context, tenantID, campID uuid.UUID, req *api.EventCreationRequest) (*api.Event, error) {
	// Validate dates
	if req.Spec.EndDate.Before(req.Spec.StartDate) {
		return nil, pkgerrors.BadRequest("End date must be after start date", nil)
	}

	// Validate activity exists if provided
	if req.Spec.ActivityId != nil {
		if _, err := s.activitiesRepo.GetByID(ctx, tenantID, campID, *req.Spec.ActivityId); err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, pkgerrors.BadRequest("Activity not found", err)
			}
			return nil, pkgerrors.InternalServerError("Failed to validate activity", err)
		}
	}

	// Validate program exists if provided
	if req.Spec.ProgramId != nil {
		if _, err := s.programsRepo.GetByID(ctx, tenantID, campID, *req.Spec.ProgramId); err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, pkgerrors.BadRequest("Program not found", err)
			}
			return nil, pkgerrors.InternalServerError("Failed to validate program", err)
		}
	}

	// Validate location exists if provided
	if req.Spec.LocationId != nil {
		if _, err := s.locationsRepo.GetByID(ctx, tenantID, campID, *req.Spec.LocationId); err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, pkgerrors.BadRequest("Location not found", err)
			}
			return nil, pkgerrors.InternalServerError("Failed to validate location", err)
		}
	}

	// Serialize JSONB fields
	var groupIDsJSON json.RawMessage
	if req.Spec.GroupIds != nil {
		groupIDsJSON, _ = json.Marshal(req.Spec.GroupIds)
	}

	var excludeStaffIDsJSON json.RawMessage
	if req.Spec.ExcludeStaffIds != nil {
		excludeStaffIDsJSON, _ = json.Marshal(req.Spec.ExcludeStaffIds)
	}

	var excludeCamperIDsJSON json.RawMessage
	if req.Spec.ExcludeCamperIds != nil {
		excludeCamperIDsJSON, _ = json.Marshal(req.Spec.ExcludeCamperIds)
	}

	var requiredStaffJSON json.RawMessage
	if req.Spec.RequiredStaff != nil {
		requiredStaffJSON, _ = json.Marshal(req.Spec.RequiredStaff)
	}

	var recurrenceRuleJSON json.RawMessage
	if req.Spec.RecurrenceRule != nil {
		recurrenceRuleJSON, _ = json.Marshal(req.Spec.RecurrenceRule)
	}

	// Create domain event
	event := &domain.Event{
		TenantID:           tenantID,
		CampID:             campID,
		Name:               req.Meta.Name,
		Description:        utils.PtrToString(req.Meta.Description),
		StartDate:          req.Spec.StartDate,
		EndDate:            req.Spec.EndDate,
		LocationID:         req.Spec.LocationId,
		Capacity:           req.Spec.Capacity,
		ColorID:            req.Spec.ColorId,
		ProgramID:          req.Spec.ProgramId,
		ActivityID:         req.Spec.ActivityId,
		GroupIDs:           groupIDsJSON,
		ExcludeStaffIDs:    excludeStaffIDsJSON,
		ExcludeCamperIDs:   excludeCamperIDsJSON,
		RequiredStaff:      requiredStaffJSON,
		RecurrenceID:       req.Spec.RecurrenceId,
		IsRecurrenceParent: req.Spec.IsRecurrenceParent != nil && *req.Spec.IsRecurrenceParent,
		RecurrenceRule:     recurrenceRuleJSON,
	}

	if err := s.repo.Create(ctx, event); err != nil {
		return nil, pkgerrors.InternalServerError("Failed to create event", err)
	}

	apiEvent := event.ToAPI()
	return &apiEvent, nil
}

// CreateRecurringSeries creates a series of recurring events
func (s *eventsService) CreateRecurringSeries(ctx context.Context, tenantID, campID uuid.UUID, req *api.EventCreationRequest, startDate, endDate time.Time) ([]api.Event, error) {
	// Validate request
	if req.Spec.RecurrenceRule == nil {
		return nil, pkgerrors.BadRequest("Recurrence rule is required", nil)
	}

	// Validate dates
	if endDate.Before(startDate) {
		return nil, pkgerrors.BadRequest("End date must be after start date", nil)
	}

	// Validate activity exists if provided
	if req.Spec.ActivityId != nil {
		if _, err := s.activitiesRepo.GetByID(ctx, tenantID, campID, *req.Spec.ActivityId); err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, pkgerrors.BadRequest("Activity not found", err)
			}
			return nil, pkgerrors.InternalServerError("Failed to validate activity", err)
		}
	}

	// Validate program exists if provided
	if req.Spec.ProgramId != nil {
		if _, err := s.programsRepo.GetByID(ctx, tenantID, campID, *req.Spec.ProgramId); err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, pkgerrors.BadRequest("Program not found", err)
			}
			return nil, pkgerrors.InternalServerError("Failed to validate program", err)
		}
	}

	// Validate location exists if provided
	if req.Spec.LocationId != nil {
		if _, err := s.locationsRepo.GetByID(ctx, tenantID, campID, *req.Spec.LocationId); err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, pkgerrors.BadRequest("Location not found", err)
			}
			return nil, pkgerrors.InternalServerError("Failed to validate location", err)
		}
	}

	// Generate recurrence ID for the series
	recurrenceID := uuid.New()
	duration := endDate.Sub(startDate)

	// Generate occurrence dates
	occurrenceDates := generateRecurrenceDates(startDate, req.Spec.RecurrenceRule)

	if len(occurrenceDates) == 0 {
		return nil, pkgerrors.BadRequest("No occurrences generated from recurrence rule", nil)
	}

	// Create events batch
	events := make([]*domain.Event, len(occurrenceDates))
	for i, occStart := range occurrenceDates {
		occEnd := occStart.Add(duration)

		// Serialize JSONB fields
		var groupIDsJSON json.RawMessage
		if req.Spec.GroupIds != nil {
			groupIDsJSON, _ = json.Marshal(req.Spec.GroupIds)
		}

		var excludeStaffIDsJSON json.RawMessage
		if req.Spec.ExcludeStaffIds != nil {
			excludeStaffIDsJSON, _ = json.Marshal(req.Spec.ExcludeStaffIds)
		}

		var excludeCamperIDsJSON json.RawMessage
		if req.Spec.ExcludeCamperIds != nil {
			excludeCamperIDsJSON, _ = json.Marshal(req.Spec.ExcludeCamperIds)
		}

		var requiredStaffJSON json.RawMessage
		if req.Spec.RequiredStaff != nil {
			requiredStaffJSON, _ = json.Marshal(req.Spec.RequiredStaff)
		}

		var recurrenceRuleJSON json.RawMessage
		if i == 0 {
			// Only parent stores the rule
			recurrenceRuleJSON, _ = json.Marshal(req.Spec.RecurrenceRule)
		}

		events[i] = &domain.Event{
			TenantID:           tenantID,
			CampID:             campID,
			Name:               req.Meta.Name,
			Description:        utils.PtrToString(req.Meta.Description),
			StartDate:          occStart,
			EndDate:            occEnd,
			LocationID:         req.Spec.LocationId,
			Capacity:           req.Spec.Capacity,
			ColorID:            req.Spec.ColorId,
			ProgramID:          req.Spec.ProgramId,
			ActivityID:         req.Spec.ActivityId,
			GroupIDs:           groupIDsJSON,
			ExcludeStaffIDs:    excludeStaffIDsJSON,
			ExcludeCamperIDs:   excludeCamperIDsJSON,
			RequiredStaff:      requiredStaffJSON,
			RecurrenceID:       &recurrenceID,
			IsRecurrenceParent: i == 0,
			RecurrenceRule:     recurrenceRuleJSON,
		}
	}

	// Save batch
	if err := s.repo.CreateBatch(ctx, events); err != nil {
		return nil, pkgerrors.InternalServerError("Failed to create recurring events", err)
	}

	// Convert to API format
	apiEvents := make([]api.Event, len(events))
	for i, event := range events {
		apiEvents[i] = event.ToAPI()
	}

	return apiEvents, nil
}

// Update updates event(s) based on scope
func (s *eventsService) Update(ctx context.Context, tenantID, campID, id uuid.UUID, req *api.EventUpdateRequest, updateScope string) (*api.Event, error) {
	// Get existing event
	existingEvent, err := s.repo.GetByID(ctx, tenantID, campID, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, pkgerrors.NotFound("Event not found", err)
		}
		return nil, pkgerrors.InternalServerError("Failed to get event", err)
	}

	// Handle different scopes
	switch updateScope {
	case "single":
		return s.updateSingleEvent(ctx, tenantID, campID, existingEvent, req)
	case "all":
		return s.updateAllInSeries(ctx, tenantID, campID, existingEvent, req)
	case "future":
		return s.updateFutureInSeries(ctx, tenantID, campID, existingEvent, req)
	default:
		return nil, pkgerrors.BadRequest("Invalid update scope", nil)
	}
}

// Delete deletes event(s) based on scope
func (s *eventsService) Delete(ctx context.Context, tenantID, campID, id uuid.UUID, deleteScope string) error {
	// Get existing event
	existingEvent, err := s.repo.GetByID(ctx, tenantID, campID, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return pkgerrors.NotFound("Event not found", err)
		}
		return pkgerrors.InternalServerError("Failed to get event", err)
	}

	// Handle different scopes
	switch deleteScope {
	case "single":
		return s.repo.Delete(ctx, tenantID, campID, id)
	case "all":
		if existingEvent.RecurrenceID != nil {
			return s.repo.DeleteByRecurrenceID(ctx, tenantID, campID, *existingEvent.RecurrenceID)
		}
		return s.repo.Delete(ctx, tenantID, campID, id)
	case "future":
		if existingEvent.RecurrenceID != nil {
			return s.repo.DeleteByRecurrenceIDAfterDate(ctx, tenantID, campID, *existingEvent.RecurrenceID, existingEvent.StartDate)
		}
		return s.repo.Delete(ctx, tenantID, campID, id)
	default:
		return pkgerrors.BadRequest("Invalid delete scope", nil)
	}
}

// Helper methods for update scopes
func (s *eventsService) updateSingleEvent(ctx context.Context, tenantID, campID uuid.UUID, existing *domain.Event, req *api.EventUpdateRequest) (*api.Event, error) {
	// Validate dates
	if req.Spec.EndDate.Before(req.Spec.StartDate) {
		return nil, pkgerrors.BadRequest("End date must be after start date", nil)
	}

	// Break recurrence link if not parent
	if !existing.IsRecurrenceParent {
		existing.RecurrenceID = nil
		existing.RecurrenceRule = nil
	}

	// Apply updates
	existing.Name = req.Meta.Name
	existing.Description = utils.PtrToString(req.Meta.Description)
	existing.StartDate = req.Spec.StartDate
	existing.EndDate = req.Spec.EndDate
	existing.LocationID = req.Spec.LocationId
	existing.Capacity = req.Spec.Capacity
	existing.ColorID = req.Spec.ColorId
	existing.ProgramID = req.Spec.ProgramId
	existing.ActivityID = req.Spec.ActivityId

	// Update JSONB fields
	if req.Spec.GroupIds != nil {
		existing.GroupIDs, _ = json.Marshal(req.Spec.GroupIds)
	}
	if req.Spec.ExcludeStaffIds != nil {
		existing.ExcludeStaffIDs, _ = json.Marshal(req.Spec.ExcludeStaffIds)
	}
	if req.Spec.ExcludeCamperIds != nil {
		existing.ExcludeCamperIDs, _ = json.Marshal(req.Spec.ExcludeCamperIds)
	}
	if req.Spec.RequiredStaff != nil {
		existing.RequiredStaff, _ = json.Marshal(req.Spec.RequiredStaff)
	}

	if err := s.repo.Update(ctx, tenantID, campID, existing); err != nil {
		return nil, pkgerrors.InternalServerError("Failed to update event", err)
	}

	// Fetch updated event
	updatedEvent, err := s.repo.GetByID(ctx, tenantID, campID, existing.ID)
	if err != nil {
		return nil, pkgerrors.InternalServerError("Failed to get updated event", err)
	}

	apiEvent := updatedEvent.ToAPI()
	return &apiEvent, nil
}

func (s *eventsService) updateAllInSeries(ctx context.Context, tenantID, campID uuid.UUID, existing *domain.Event, req *api.EventUpdateRequest) (*api.Event, error) {
	if existing.RecurrenceID == nil {
		// Not a recurring event, just update single
		return s.updateSingleEvent(ctx, tenantID, campID, existing, req)
	}

	// Get all events in series
	seriesEvents, err := s.repo.GetByRecurrenceID(ctx, tenantID, campID, *existing.RecurrenceID)
	if err != nil {
		return nil, pkgerrors.InternalServerError("Failed to get recurrence series", err)
	}

	// Update all events
	for i := range seriesEvents {
		event := &seriesEvents[i]
		event.Name = req.Meta.Name
		event.Description = utils.PtrToString(req.Meta.Description)
		event.LocationID = req.Spec.LocationId
		event.Capacity = req.Spec.Capacity
		event.ColorID = req.Spec.ColorId
		event.ProgramID = req.Spec.ProgramId
		event.ActivityID = req.Spec.ActivityId

		// Update JSONB fields
		if req.Spec.GroupIds != nil {
			event.GroupIDs, _ = json.Marshal(req.Spec.GroupIds)
		}
		if req.Spec.ExcludeStaffIds != nil {
			event.ExcludeStaffIDs, _ = json.Marshal(req.Spec.ExcludeStaffIds)
		}
		if req.Spec.ExcludeCamperIds != nil {
			event.ExcludeCamperIDs, _ = json.Marshal(req.Spec.ExcludeCamperIds)
		}
		if req.Spec.RequiredStaff != nil {
			event.RequiredStaff, _ = json.Marshal(req.Spec.RequiredStaff)
		}

		if err := s.repo.Update(ctx, tenantID, campID, event); err != nil {
			return nil, pkgerrors.InternalServerError(fmt.Sprintf("Failed to update event %s", event.ID), err)
		}
	}

	// Return the original event
	updatedEvent, err := s.repo.GetByID(ctx, tenantID, campID, existing.ID)
	if err != nil {
		return nil, pkgerrors.InternalServerError("Failed to get updated event", err)
	}

	apiEvent := updatedEvent.ToAPI()
	return &apiEvent, nil
}

func (s *eventsService) updateFutureInSeries(ctx context.Context, tenantID, campID uuid.UUID, existing *domain.Event, req *api.EventUpdateRequest) (*api.Event, error) {
	if existing.RecurrenceID == nil {
		// Not a recurring event, just update single
		return s.updateSingleEvent(ctx, tenantID, campID, existing, req)
	}

	// Get all events in series
	seriesEvents, err := s.repo.GetByRecurrenceID(ctx, tenantID, campID, *existing.RecurrenceID)
	if err != nil {
		return nil, pkgerrors.InternalServerError("Failed to get recurrence series", err)
	}

	// Update only future events (including current)
	for i := range seriesEvents {
		event := &seriesEvents[i]
		if event.StartDate.Before(existing.StartDate) {
			continue
		}

		event.Name = req.Meta.Name
		event.Description = utils.PtrToString(req.Meta.Description)
		event.LocationID = req.Spec.LocationId
		event.Capacity = req.Spec.Capacity
		event.ColorID = req.Spec.ColorId
		event.ProgramID = req.Spec.ProgramId
		event.ActivityID = req.Spec.ActivityId

		// Update JSONB fields
		if req.Spec.GroupIds != nil {
			event.GroupIDs, _ = json.Marshal(req.Spec.GroupIds)
		}
		if req.Spec.ExcludeStaffIds != nil {
			event.ExcludeStaffIDs, _ = json.Marshal(req.Spec.ExcludeStaffIds)
		}
		if req.Spec.ExcludeCamperIds != nil {
			event.ExcludeCamperIDs, _ = json.Marshal(req.Spec.ExcludeCamperIds)
		}
		if req.Spec.RequiredStaff != nil {
			event.RequiredStaff, _ = json.Marshal(req.Spec.RequiredStaff)
		}

		if err := s.repo.Update(ctx, tenantID, campID, event); err != nil {
			return nil, pkgerrors.InternalServerError(fmt.Sprintf("Failed to update event %s", event.ID), err)
		}
	}

	// Return the original event
	updatedEvent, err := s.repo.GetByID(ctx, tenantID, campID, existing.ID)
	if err != nil {
		return nil, pkgerrors.InternalServerError("Failed to get updated event", err)
	}

	apiEvent := updatedEvent.ToAPI()
	return &apiEvent, nil
}

// generateRecurrenceDates generates dates for recurring events based on the recurrence rule
// This is a simplified implementation - you may want to use the frontend logic
func generateRecurrenceDates(startDate time.Time, rule *api.RecurrenceRule) []time.Time {
	dates := []time.Time{startDate}
	maxOccurrences := 365 // Safety limit

	if rule.Occurrences != nil && *rule.Occurrences > 0 {
		maxOccurrences = *rule.Occurrences
	}

	currentDate := startDate
	for len(dates) < maxOccurrences {
		var nextDate time.Time

		switch rule.Frequency {
		case "daily":
			nextDate = currentDate.AddDate(0, 0, rule.Interval)
		case "weekly":
			if rule.DaysOfWeek != nil && len(*rule.DaysOfWeek) > 0 {
				nextDate = getNextWeeklyDate(currentDate, *rule.DaysOfWeek, rule.Interval)
			} else {
				nextDate = currentDate.AddDate(0, 0, 7*rule.Interval)
			}
		case "monthly":
			nextDate = currentDate.AddDate(0, rule.Interval, 0)
		default:
			break
		}

		// Check end conditions
		if rule.EndType == "on" && rule.EndDate != nil {
			if nextDate.After(*rule.EndDate) {
				break
			}
		}

		if rule.EndType == "after" && rule.Occurrences != nil {
			if len(dates) >= *rule.Occurrences {
				break
			}
		}

		dates = append(dates, nextDate)
		currentDate = nextDate
	}

	return dates
}

// getNextWeeklyDate finds the next date for weekly recurrence
func getNextWeeklyDate(currentDate time.Time, daysOfWeek []int, interval int) time.Time {
	currentDay := int(currentDate.Weekday())

	// Find the next day in the current week
	for _, day := range daysOfWeek {
		if day > currentDay {
			daysToAdd := day - currentDay
			return currentDate.AddDate(0, 0, daysToAdd)
		}
	}

	// Move to the next interval week and use the first selected day
	if len(daysOfWeek) > 0 {
		daysUntilNextWeek := 7 - currentDay + daysOfWeek[0]
		weeksToSkip := interval - 1
		return currentDate.AddDate(0, 0, daysUntilNextWeek+weeksToSkip*7)
	}

	return currentDate.AddDate(0, 0, 7*interval)
}
