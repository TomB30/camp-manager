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

// ListPrograms handles GET /programs
func (h *ProgramsHandler) ListPrograms(w http.ResponseWriter, r *http.Request, params api.ListProgramsParams) {
	// TODO: Implement listing programs with pagination and search
}

// CreateProgram handles POST /programs
func (h *ProgramsHandler) CreateProgram(w http.ResponseWriter, r *http.Request) {
	// TODO: Implement program creation
}

// GetProgramById handles GET /programs/{id}
func (h *ProgramsHandler) GetProgramById(w http.ResponseWriter, r *http.Request, id api.Id) {
	// TODO: Implement get program by ID
}

// UpdateProgramById handles PUT /programs/{id}
func (h *ProgramsHandler) UpdateProgramById(w http.ResponseWriter, r *http.Request, id api.Id) {
	// TODO: Implement program update
}

// DeleteProgramById handles DELETE /programs/{id}
func (h *ProgramsHandler) DeleteProgramById(w http.ResponseWriter, r *http.Request, id api.Id) {
	// TODO: Implement program deletion
}

