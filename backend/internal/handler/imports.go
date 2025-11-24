package handler

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/google/uuid"
	"github.com/tbechar/camp-manager-backend/internal/domain"
	"github.com/tbechar/camp-manager-backend/internal/service"
	pkgcontext "github.com/tbechar/camp-manager-backend/pkg/context"
	"github.com/tbechar/camp-manager-backend/pkg/errors"
)

const (
	maxUploadSize = 10 << 20 // 10 MB
)

// ImportsHandler handles import-related HTTP requests
type ImportsHandler struct {
	service service.ImportService
}

// NewImportsHandler creates a new imports handler
func NewImportsHandler(service service.ImportService) *ImportsHandler {
	return &ImportsHandler{
		service: service,
	}
}

// ValidateImport handles POST /api/v1/camps/{camp_id}/imports/{entity_type}/validate
func (h *ImportsHandler) ValidateImport(w http.ResponseWriter, r *http.Request, campID, entityType string) {
	// Extract tenant ID from context
	tenantIDStr, err := pkgcontext.ExtractTenantID(r.Context())
	if err != nil {
		errors.WriteError(w, errors.Unauthorized("Tenant ID not found in context", err))
		return
	}

	tenantUUID, err := uuid.Parse(tenantIDStr)
	if err != nil {
		errors.WriteError(w, errors.BadRequest("Invalid tenant ID", err))
		return
	}

	campUUID, err := uuid.Parse(campID)
	if err != nil {
		errors.WriteError(w, errors.BadRequest("Invalid camp ID", err))
		return
	}

	// Validate entity type
	entityTypeEnum := domain.ImportEntityType(entityType)
	if !isValidEntityType(entityTypeEnum) {
		errors.WriteError(w, errors.BadRequest(fmt.Sprintf("Invalid entity type: %s", entityType), nil))
		return
	}

	// Parse multipart form
	r.Body = http.MaxBytesReader(w, r.Body, maxUploadSize)
	if err := r.ParseMultipartForm(maxUploadSize); err != nil {
		errors.WriteError(w, errors.BadRequest("File too large or invalid", err))
		return
	}

	// Get file from form
	file, _, err := r.FormFile("file")
	if err != nil {
		errors.WriteError(w, errors.BadRequest("No file provided", err))
		return
	}
	defer file.Close()

	// Call service
	result, err := h.service.ValidateImport(r.Context(), tenantUUID, campUUID, entityTypeEnum, file)
	if err != nil {
		errors.WriteError(w, err)
		return
	}

	// Write response
	if err := errors.WriteJSON(w, http.StatusOK, result); err != nil {
		errors.WriteError(w, errors.InternalServerError("Failed to write response", err))
		return
	}
}

// StartImport handles POST /api/v1/camps/{camp_id}/imports/{entity_type}
func (h *ImportsHandler) StartImport(w http.ResponseWriter, r *http.Request, campID, entityType string) {
	// Extract tenant ID from context
	tenantIDStr, err := pkgcontext.ExtractTenantID(r.Context())
	if err != nil {
		errors.WriteError(w, errors.Unauthorized("Tenant ID not found in context", err))
		return
	}

	tenantUUID, err := uuid.Parse(tenantIDStr)
	if err != nil {
		errors.WriteError(w, errors.BadRequest("Invalid tenant ID", err))
		return
	}

	campUUID, err := uuid.Parse(campID)
	if err != nil {
		errors.WriteError(w, errors.BadRequest("Invalid camp ID", err))
		return
	}

	// Validate entity type
	entityTypeEnum := domain.ImportEntityType(entityType)
	if !isValidEntityType(entityTypeEnum) {
		errors.WriteError(w, errors.BadRequest(fmt.Sprintf("Invalid entity type: %s", entityType), nil))
		return
	}

	// Get mode from query parameters (default: create)
	modeStr := r.URL.Query().Get("mode")
	if modeStr == "" {
		modeStr = "create"
	}
	mode := domain.ImportMode(modeStr)
	if mode != domain.ImportModeCreate && mode != domain.ImportModeUpsert {
		errors.WriteError(w, errors.BadRequest(fmt.Sprintf("Invalid mode: %s (must be create or upsert)", modeStr), nil))
		return
	}

	// Parse multipart form
	r.Body = http.MaxBytesReader(w, r.Body, maxUploadSize)
	if err := r.ParseMultipartForm(maxUploadSize); err != nil {
		errors.WriteError(w, errors.BadRequest("File too large or invalid", err))
		return
	}

	// Get file from form
	file, fileHeader, err := r.FormFile("file")
	if err != nil {
		errors.WriteError(w, errors.BadRequest("No file provided", err))
		return
	}
	defer file.Close()

	// Call service
	job, err := h.service.StartImport(r.Context(), tenantUUID, campUUID, entityTypeEnum, mode, file, fileHeader.Filename)
	if err != nil {
		errors.WriteError(w, err)
		return
	}

	// Write response
	if err := errors.WriteJSON(w, http.StatusAccepted, job); err != nil {
		errors.WriteError(w, errors.InternalServerError("Failed to write response", err))
		return
	}
}

// GetImportStatus handles GET /api/v1/camps/{camp_id}/imports/{job_id}
func (h *ImportsHandler) GetImportStatus(w http.ResponseWriter, r *http.Request, campID, jobID string) {
	// Extract tenant ID from context
	tenantIDStr, err := pkgcontext.ExtractTenantID(r.Context())
	if err != nil {
		errors.WriteError(w, errors.Unauthorized("Tenant ID not found in context", err))
		return
	}

	tenantUUID, err := uuid.Parse(tenantIDStr)
	if err != nil {
		errors.WriteError(w, errors.BadRequest("Invalid tenant ID", err))
		return
	}

	jobUUID, err := uuid.Parse(jobID)
	if err != nil {
		errors.WriteError(w, errors.BadRequest("Invalid job ID", err))
		return
	}

	// Call service
	job, err := h.service.GetImportStatus(r.Context(), tenantUUID, jobUUID)
	if err != nil {
		errors.WriteError(w, err)
		return
	}

	// Write response
	if err := errors.WriteJSON(w, http.StatusOK, job); err != nil {
		errors.WriteError(w, errors.InternalServerError("Failed to write response", err))
		return
	}
}

// ListImportJobs handles GET /api/v1/camps/{camp_id}/imports
func (h *ImportsHandler) ListImportJobs(w http.ResponseWriter, r *http.Request, campID string) {
	// Extract tenant ID from context
	tenantIDStr, err := pkgcontext.ExtractTenantID(r.Context())
	if err != nil {
		errors.WriteError(w, errors.Unauthorized("Tenant ID not found in context", err))
		return
	}

	tenantUUID, err := uuid.Parse(tenantIDStr)
	if err != nil {
		errors.WriteError(w, errors.BadRequest("Invalid tenant ID", err))
		return
	}

	campUUID, err := uuid.Parse(campID)
	if err != nil {
		errors.WriteError(w, errors.BadRequest("Invalid camp ID", err))
		return
	}

	// Parse pagination parameters
	limit := 50
	offset := 0

	if limitStr := r.URL.Query().Get("limit"); limitStr != "" {
		fmt.Sscanf(limitStr, "%d", &limit)
	}
	if offsetStr := r.URL.Query().Get("offset"); offsetStr != "" {
		fmt.Sscanf(offsetStr, "%d", &offset)
	}

	// Call service
	jobs, total, err := h.service.ListImportJobs(r.Context(), tenantUUID, campUUID, limit, offset)
	if err != nil {
		errors.WriteError(w, err)
		return
	}

	// Create response
	response := map[string]interface{}{
		"items":  jobs,
		"total":  total,
		"limit":  limit,
		"offset": offset,
	}

	// Write response
	if err := errors.WriteJSON(w, http.StatusOK, response); err != nil {
		errors.WriteError(w, errors.InternalServerError("Failed to write response", err))
		return
	}
}

// GetTemplate handles GET /api/v1/camps/{camp_id}/imports/{entity_type}/template
func (h *ImportsHandler) GetTemplate(w http.ResponseWriter, r *http.Request, campID, entityType string) {
	// Validate entity type
	entityTypeEnum := domain.ImportEntityType(entityType)
	if !isValidEntityType(entityTypeEnum) {
		errors.WriteError(w, errors.BadRequest(fmt.Sprintf("Invalid entity type: %s", entityType), nil))
		return
	}

	// Generate CSV template based on entity type
	var csvContent string
	switch entityTypeEnum {
	case domain.ImportEntityTypeCampers:
		csvContent = "name,description,birthday,gender,sessionName,groupNames\n"
		csvContent += "John Doe,Returning camper,2010-05-15,male,Session 1,\"Group A,Group B\"\n"
		csvContent += "Jane Smith,,2011-08-22,female,Session 1,Group A\n"
	case domain.ImportEntityTypeStaffMembers:
		csvContent = "name,description,birthday,gender,roleName,phone,certificationNames,groupNames\n"
		csvContent += "Alice Johnson,Head counselor,1995-03-10,female,Counselor,555-0100,\"CPR,First Aid\",Group A\n"
	case domain.ImportEntityTypeGroups:
		csvContent = "name,description,sessionName,housingRoomName\n"
		csvContent += "Cabin 1,Boys cabin,Session 1,Room 101\n"
		csvContent += "Activity Group A,Swimming group,Session 1,\n"
	default:
		errors.WriteError(w, errors.BadRequest(fmt.Sprintf("No template available for entity type: %s", entityType), nil))
		return
	}

	// Set headers for CSV download
	w.Header().Set("Content-Type", "text/csv")
	w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=%s_import_template.csv", entityType))

	// Write CSV content
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(csvContent))
}

// isValidEntityType checks if the entity type is valid
func isValidEntityType(entityType domain.ImportEntityType) bool {
	switch entityType {
	case domain.ImportEntityTypeCampers, domain.ImportEntityTypeStaffMembers, domain.ImportEntityTypeGroups:
		return true
	default:
		return false
	}
}

// Helper function to parse entity type from URL
func parseEntityType(path string) string {
	parts := strings.Split(path, "/")
	for i, part := range parts {
		if part == "imports" && i+1 < len(parts) {
			return parts[i+1]
		}
	}
	return ""
}

