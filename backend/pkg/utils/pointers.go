package utils

// StringToPtr converts a string to a pointer.
// Returns nil if the string is empty.
func StringToPtr(s string) *string {
	if s == "" {
		return nil
	}
	return &s
}

// PtrToString converts a string pointer to a string.
// Returns empty string if the pointer is nil.
func PtrToString(s *string) string {
	if s == nil {
		return ""
	}
	return *s
}

// BoolToPtr converts a bool to a pointer.
func BoolToPtr(b bool) *bool {
	return &b
}

// PtrToBool converts a bool pointer to a bool.
// Returns false if the pointer is nil.
func PtrToBool(b *bool) bool {
	if b == nil {
		return false
	}
	return *b
}

// IntToPtr converts an int to a pointer.
func IntToPtr(i int) *int {
	return &i
}

// PtrToInt converts an int pointer to an int.
// Returns 0 if the pointer is nil.
func PtrToInt(i *int) int {
	if i == nil {
		return 0
	}
	return *i
}

// Int64ToPtr converts an int64 to a pointer.
func Int64ToPtr(i int64) *int64 {
	return &i
}

// PtrToInt64 converts an int64 pointer to an int64.
// Returns 0 if the pointer is nil.
func PtrToInt64(i *int64) int64 {
	if i == nil {
		return 0
	}
	return *i
}
