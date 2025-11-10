package service

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"github.com/tbechar/camp-manager-backend/internal/api"
	"github.com/tbechar/camp-manager-backend/internal/domain"
	pkgerrors "github.com/tbechar/camp-manager-backend/pkg/errors"
	"gorm.io/gorm"
)

// CertificationsService defines the interface for certification business logic
type CertificationsService interface {
	// List retrieves certifications with pagination and optional search
	List(ctx context.Context, tenantID, campID uuid.UUID, limit int, offset int, search *string, filterStrings []string, sortBy *string, sortOrder string) (*api.CertificationsListResponse, error)

	// GetByID retrieves a single certification by ID
	GetByID(ctx context.Context, tenantID, campID, id uuid.UUID) (*api.Certification, error)

	// Create creates a new certification
	Create(ctx context.Context, tenantID, campID uuid.UUID, req *api.CertificationCreationRequest) (*api.Certification, error)

	// Update updates an existing certification
	Update(ctx context.Context, tenantID, campID, id uuid.UUID, req *api.CertificationUpdateRequest) (*api.Certification, error)

	// Delete deletes a certification by ID
	Delete(ctx context.Context, tenantID, campID, id uuid.UUID) error
}

// certificationsService implements CertificationsService
type certificationsService struct {
	repo CertificationsRepository
}

// NewCertificationsService creates a new certifications service
func NewCertificationsService(repo CertificationsRepository) CertificationsService {
	return &certificationsService{
		repo: repo,
	}
}

// List retrieves certifications with pagination and optional search
func (s *certificationsService) List(ctx context.Context, tenantID, campID uuid.UUID, limit int, offset int, search *string, filterStrings []string, sortBy *string, sortOrder string) (*api.CertificationsListResponse, error) {
	certifications, total, err := s.repo.List(ctx, tenantID, campID, limit, offset, search, filterStrings, sortBy, sortOrder)
	if err != nil {
		return nil, pkgerrors.BadRequest("Failed to list certifications", err)
	}

	// Convert domain certifications to API certifications
	apiCertifications := make([]api.Certification, len(certifications))
	for i, certification := range certifications {
		apiCertifications[i] = certification.ToAPI()
	}

	return &api.CertificationsListResponse{
		Items:  apiCertifications,
		Limit:  limit,
		Offset: offset,
		Total:  int(total),
	}, nil
}

// GetByID retrieves a single certification by ID
func (s *certificationsService) GetByID(ctx context.Context, tenantID, campID, id uuid.UUID) (*api.Certification, error) {
	certification, err := s.repo.GetByID(ctx, tenantID, campID, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, pkgerrors.NotFound("Certification not found", err)
		}
		return nil, pkgerrors.InternalServerError("Failed to get certification", err)
	}

	apiCertification := certification.ToAPI()
	return &apiCertification, nil
}

// Create creates a new certification
func (s *certificationsService) Create(ctx context.Context, tenantID, campID uuid.UUID, req *api.CertificationCreationRequest) (*api.Certification, error) {
	// Create domain certification from request
	certification := &domain.Certification{
		TenantID:    tenantID,
		CampID:      campID,
		Name:        req.Meta.Name,
		Description: "",
	}

	// Set description if provided
	if req.Meta.Description != nil {
		certification.Description = *req.Meta.Description
	}

	// Save to database
	if err := s.repo.Create(ctx, certification); err != nil {
		return nil, pkgerrors.InternalServerError("Failed to create certification", err)
	}

	apiCertification := certification.ToAPI()
	return &apiCertification, nil
}

// Update updates an existing certification
func (s *certificationsService) Update(ctx context.Context, tenantID, campID, id uuid.UUID, req *api.CertificationUpdateRequest) (*api.Certification, error) {
	// Check if certification exists and belongs to tenant/camp
	existingCertification, err := s.repo.GetByID(ctx, tenantID, campID, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, pkgerrors.NotFound("Certification not found", err)
		}
		return nil, pkgerrors.InternalServerError("Failed to get certification", err)
	}

	// Update fields
	existingCertification.Name = req.Meta.Name
	if req.Meta.Description != nil {
		existingCertification.Description = *req.Meta.Description
	} else {
		existingCertification.Description = ""
	}

	// Save updates
	if err := s.repo.Update(ctx, tenantID, campID, existingCertification); err != nil {
		return nil, pkgerrors.InternalServerError("Failed to update certification", err)
	}

	// Fetch updated certification to get latest timestamps
	updatedCertification, err := s.repo.GetByID(ctx, tenantID, campID, id)
	if err != nil {
		return nil, pkgerrors.InternalServerError("Failed to get updated certification", err)
	}

	apiCertification := updatedCertification.ToAPI()
	return &apiCertification, nil
}

// Delete deletes a certification by ID
func (s *certificationsService) Delete(ctx context.Context, tenantID, campID, id uuid.UUID) error {
	// Check if certification exists
	_, err := s.repo.GetByID(ctx, tenantID, campID, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return pkgerrors.NotFound("Certification not found", err)
		}
		return pkgerrors.InternalServerError("Failed to get certification", err)
	}

	// Delete the certification
	if err := s.repo.Delete(ctx, tenantID, campID, id); err != nil {
		return pkgerrors.InternalServerError("Failed to delete certification", err)
	}

	return nil
}
