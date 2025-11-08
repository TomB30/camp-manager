package domain

import (
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

const (
	// TokenExpiration is the default JWT token expiration time (24 hours)
	TokenExpiration = 24 * time.Hour
	// RefreshTokenExpiration is the default refresh token expiration time (7 days)
	RefreshTokenExpiration = 7 * 24 * time.Hour
)

// JWTClaims represents the custom claims in a JWT token
type JWTClaims struct {
	UserID      string       `json:"userId"`
	TenantID    string       `json:"tenantId"`
	Email       string       `json:"email"`
	AccessRules []AccessRule `json:"accessRules"`
	jwt.RegisteredClaims
}

// JWTService handles JWT token operations
type JWTService struct {
	secretKey []byte
}

// NewJWTService creates a new JWT service with the given secret key
func NewJWTService(secretKey string) *JWTService {
	return &JWTService{
		secretKey: []byte(secretKey),
	}
}

// GenerateToken creates a new JWT token for a user
func (s *JWTService) GenerateToken(userID, tenantID, email string, accessRules []AccessRule) (string, error) {
	now := time.Now()
	claims := &JWTClaims{
		UserID:      userID,
		TenantID:    tenantID,
		Email:       email,
		AccessRules: accessRules,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(now.Add(TokenExpiration)),
			IssuedAt:  jwt.NewNumericDate(now),
			NotBefore: jwt.NewNumericDate(now),
			ID:        uuid.New().String(),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(s.secretKey)
	if err != nil {
		return "", fmt.Errorf("failed to sign JWT token: %w", err)
	}

	return tokenString, nil
}

// ValidateToken validates a JWT token and returns the claims
func (s *JWTService) ValidateToken(tokenString string) (*JWTClaims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &JWTClaims{}, func(token *jwt.Token) (interface{}, error) {
		// Validate the signing method
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return s.secretKey, nil
	})

	if err != nil {
		return nil, fmt.Errorf("failed to parse JWT token: %w", err)
	}

	if claims, ok := token.Claims.(*JWTClaims); ok && token.Valid {
		return claims, nil
	}

	return nil, fmt.Errorf("invalid JWT token")
}

// GenerateRefreshToken creates a new refresh token for a user
func (s *JWTService) GenerateRefreshToken(userID, tenantID string) (string, error) {
	now := time.Now()
	claims := &JWTClaims{
		UserID:   userID,
		TenantID: tenantID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(now.Add(RefreshTokenExpiration)),
			IssuedAt:  jwt.NewNumericDate(now),
			NotBefore: jwt.NewNumericDate(now),
			ID:        uuid.New().String(),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(s.secretKey)
	if err != nil {
		return "", fmt.Errorf("failed to sign refresh token: %w", err)
	}

	return tokenString, nil
}
