package handler

import (
	"net/http"

	"github.com/tbechar/camp-manager-backend/internal/api"
	"github.com/tbechar/camp-manager-backend/internal/service"
)

// ProgramsHandler handles program-related HTTP requests
type ProgramsHandler struct {
	service service.ProgramsService
}

// NewProgramsHandler creates a new programs handler
func NewProgramsHandler(service service.ProgramsService) *ProgramsHandler {
	return &ProgramsHandler{
		service: service,
	}
}

// ListPrograms handles GET /api/v1/camps/{camp_id}/programs
func (h *ProgramsHandler) ListPrograms(w http.ResponseWriter, r *http.Request, campId api.CampId, params api.ListProgramsParams) {
	// TODO: Implement listing programs with pagination and search
	// Use campId to filter programs for the specific camp
}

// CreateProgram handles POST /api/v1/camps/{camp_id}/programs
func (h *ProgramsHandler) CreateProgram(w http.ResponseWriter, r *http.Request, campId api.CampId) {
	// TODO: Implement program creation
	// Use campId to associate program with the specific camp
}

// GetProgramById handles GET /api/v1/camps/{camp_id}/programs/{id}
func (h *ProgramsHandler) GetProgramById(w http.ResponseWriter, r *http.Request, campId api.CampId, id api.Id) {
	// TODO: Implement get program by ID
	// Use campId to ensure program belongs to the specified camp
}

// UpdateProgramById handles PUT /api/v1/camps/{camp_id}/programs/{id}
func (h *ProgramsHandler) UpdateProgramById(w http.ResponseWriter, r *http.Request, campId api.CampId, id api.Id) {
	// TODO: Implement program update
	// Use campId to ensure program belongs to the specified camp
}

// DeleteProgramById handles DELETE /api/v1/camps/{camp_id}/programs/{id}
func (h *ProgramsHandler) DeleteProgramById(w http.ResponseWriter, r *http.Request, campId api.CampId, id api.Id) {
	// TODO: Implement program deletion
	// Use campId to ensure program belongs to the specified camp
}

