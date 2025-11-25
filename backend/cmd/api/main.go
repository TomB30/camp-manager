package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"
	chi_middleware "github.com/go-chi/chi/v5/middleware"
	"github.com/joho/godotenv"
	"go.uber.org/zap"

	"github.com/tbechar/camp-manager-backend/internal/api"
	"github.com/tbechar/camp-manager-backend/internal/config"
	"github.com/tbechar/camp-manager-backend/internal/database"
	"github.com/tbechar/camp-manager-backend/internal/domain"
	"github.com/tbechar/camp-manager-backend/internal/handler"
	"github.com/tbechar/camp-manager-backend/internal/middleware"
	"github.com/tbechar/camp-manager-backend/internal/repository"
	"github.com/tbechar/camp-manager-backend/internal/service"
	"github.com/tbechar/camp-manager-backend/internal/worker"
	"github.com/tbechar/camp-manager-backend/pkg/csvimport"
	"github.com/tbechar/camp-manager-backend/pkg/csvimport/entities"
	"github.com/tbechar/camp-manager-backend/pkg/logger"
)

func main() {
	// Load .env file if it exists (optional)
	_ = godotenv.Load()

	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Failed to load configuration: %v\n", err)
		os.Exit(1)
	}

	// Initialize logger
	log, err := logger.New(cfg.Logging.Level, cfg.Logging.Format)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Failed to initialize logger: %v\n", err)
		os.Exit(1)
	}
	defer log.Sync()

	log.Info("Starting camp-manager-backend",
		zap.String("version", "0.1.0"),
		zap.String("port", cfg.Server.Port),
	)

	// Connect to database
	db, err := database.New(&cfg.Database, database.GetGORMLogLevel(cfg.Logging.Level))
	if err != nil {
		log.Fatal("Failed to connect to database", zap.Error(err))
	}
	defer db.Close()

	log.Info("Database connection established",
		zap.String("host", cfg.Database.Host),
		zap.String("database", cfg.Database.Name),
	)

	// Run database migrations
	if err := db.RunMigrations(); err != nil {
		log.Fatal("Failed to run database migrations", zap.Error(err))
	}
	log.Info("Database migrations completed successfully")

	// Seed database with demo data
	if err := db.SeedData(); err != nil {
		log.Fatal("Failed to seed database", zap.Error(err))
	}
	log.Info("Database seeded successfully",
		zap.String("demo_email", "admin@democamp.com"),
		zap.String("demo_password", "password123"),
	)

	// Initialize repositories for import worker
	importJobsRepo := repository.NewImportJobsRepository(db)
	sessionsRepo := repository.NewSessionsRepository(db)
	groupsRepo := repository.NewGroupsRepository(db)
	campersRepo := repository.NewCampersRepository(db)
	
	// Create validators and mappers for import entities
	camperValidator := entities.NewCamperImportValidator(sessionsRepo, groupsRepo)
	camperMapper := entities.NewCamperImportMapper(sessionsRepo, groupsRepo)
	
	validators := map[domain.ImportEntityType]csvimport.EntityValidator{
		domain.ImportEntityTypeCampers: camperValidator,
	}
	
	mappers := map[domain.ImportEntityType]csvimport.EntityMapper{
		domain.ImportEntityTypeCampers: camperMapper,
	}
	
	// Initialize campers service for import worker
	campersService := service.NewCampersService(campersRepo, sessionsRepo, groupsRepo)
	
	// Initialize import worker
	importWorker := worker.NewImportWorker(
		importJobsRepo,
		validators,
		mappers,
		campersService,
		worker.ImportWorkerConfig{
			PollInterval: 10 * time.Second,
			BatchSize:    100,
		},
	)
	
	// Start import worker in background
	workerCtx, workerCancel := context.WithCancel(context.Background())
	defer workerCancel()
	go importWorker.Start(workerCtx)
	
	log.Info("Import worker started")

	// Initialize and start cleanup worker (if enabled)
	if cfg.Cleanup.Enabled {
		cleanupWorker := worker.NewCleanupWorker(
			importJobsRepo,
			worker.CleanupWorkerConfig{
				PollInterval:         cfg.Cleanup.PollInterval,
				SuccessRetentionDays: cfg.Cleanup.SuccessRetentionDays,
				FailedRetentionDays:  cfg.Cleanup.FailedRetentionDays,
			},
		)
		go cleanupWorker.Start(workerCtx)
		log.Info("Cleanup worker started",
			zap.Duration("poll_interval", cfg.Cleanup.PollInterval),
			zap.Int("success_retention_days", cfg.Cleanup.SuccessRetentionDays),
			zap.Int("failed_retention_days", cfg.Cleanup.FailedRetentionDays),
		)
	} else {
		log.Info("Cleanup worker disabled")
	}

	// Initialize handlers
	h := handler.NewHandler(db, cfg)
	healthHandler := handler.NewHealthHandler(db)

	// Initialize JWT middleware
	jwtService := domain.NewJWTService(cfg.JWT.SecretKey)
	authMiddleware := middleware.NewAuthMiddleware(jwtService)
	authorizationMiddleware := middleware.NewAuthorizationMiddleware()

	// Setup router
	r := chi.NewRouter()

	// CORS middleware - must be before other middleware
	corsMiddleware := middleware.NewCORSMiddleware(middleware.CORSConfig{
		AllowedOrigins: middleware.ParseAllowedOrigins(cfg.CORS.AllowedOrigins),
	})
	r.Use(corsMiddleware)

	// Global middleware
	r.Use(chi_middleware.RequestID)
	r.Use(chi_middleware.RealIP)
	r.Use(chi_middleware.Logger)
	r.Use(chi_middleware.Recoverer)
	r.Use(chi_middleware.Timeout(60 * time.Second))

	// Public routes
	r.Get("/health", healthHandler.Handle)

	// Protected API routes (require authentication and authorization)
	r.Group(func(r chi.Router) {
		r.Use(authMiddleware.Authenticate)
		r.Use(authorizationMiddleware.Authorize)

		// Register all OpenAPI-generated routes
		api.HandlerFromMux(h, r)
	})
	// Auth routes (public - no authentication)
	r.Post("/api/v1/auth/login", h.Login)
	r.Post("/api/v1/auth/signup", h.Signup)

	// Create HTTP server
	srv := &http.Server{
		Addr:         cfg.Server.GetAddress(),
		Handler:      r,
		ReadTimeout:  cfg.Server.ReadTimeout,
		WriteTimeout: cfg.Server.WriteTimeout,
	}

	// Start server in a goroutine
	go func() {
		log.Info("Server starting", zap.String("address", srv.Addr))
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatal("Server failed to start", zap.Error(err))
		}
	}()

	// Wait for interrupt signal to gracefully shutdown the server
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Info("Server shutting down...")
	
	// Stop workers (import and cleanup)
	workerCancel()
	log.Info("Workers stopped")

	// Graceful shutdown with timeout
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatal("Server forced to shutdown", zap.Error(err))
	}

	log.Info("Server exited gracefully")
}
