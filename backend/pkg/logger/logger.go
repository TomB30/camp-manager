package logger

import (
	"fmt"

	"go.uber.org/zap"
)

// Logger wraps zap.Logger for structured logging
type Logger struct {
	*zap.Logger
}

// New creates a new logger based on the provided level and format
func New(level, format string) (*Logger, error) {
	var zapConfig zap.Config

	// Determine log level
	var logLevel zap.AtomicLevel
	switch level {
	case "debug":
		logLevel = zap.NewAtomicLevelAt(zap.DebugLevel)
	case "info":
		logLevel = zap.NewAtomicLevelAt(zap.InfoLevel)
	case "warn":
		logLevel = zap.NewAtomicLevelAt(zap.WarnLevel)
	case "error":
		logLevel = zap.NewAtomicLevelAt(zap.ErrorLevel)
	default:
		logLevel = zap.NewAtomicLevelAt(zap.InfoLevel)
	}

	// Configure based on format
	if format == "json" {
		zapConfig = zap.NewProductionConfig()
	} else {
		zapConfig = zap.NewDevelopmentConfig()
	}

	zapConfig.Level = logLevel

	zapLogger, err := zapConfig.Build()
	if err != nil {
		return nil, fmt.Errorf("failed to build logger: %w", err)
	}

	return &Logger{Logger: zapLogger}, nil
}

// Info logs an info message
func (l *Logger) Info(msg string, fields ...zap.Field) {
	l.Logger.Info(msg, fields...)
}

// Debug logs a debug message
func (l *Logger) Debug(msg string, fields ...zap.Field) {
	l.Logger.Debug(msg, fields...)
}

// Warn logs a warning message
func (l *Logger) Warn(msg string, fields ...zap.Field) {
	l.Logger.Warn(msg, fields...)
}

// Error logs an error message
func (l *Logger) Error(msg string, fields ...zap.Field) {
	l.Logger.Error(msg, fields...)
}

// Fatal logs a fatal message and exits
func (l *Logger) Fatal(msg string, fields ...zap.Field) {
	l.Logger.Fatal(msg, fields...)
}

// With creates a child logger with additional fields
func (l *Logger) With(fields ...zap.Field) *Logger {
	return &Logger{Logger: l.Logger.With(fields...)}
}

// Sync flushes any buffered log entries
func (l *Logger) Sync() error {
	return l.Logger.Sync()
}

