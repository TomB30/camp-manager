package csvimport

import (
	"encoding/csv"
	"fmt"
	"io"
	"strings"
)

// ParseCSV parses a CSV file and returns a slice of row maps
// Each map contains column name -> value pairs
func ParseCSV(reader io.Reader) ([]map[string]string, []string, error) {
	csvReader := csv.NewReader(reader)
	csvReader.TrimLeadingSpace = true

	// Read header row
	headers, err := csvReader.Read()
	if err != nil {
		if err == io.EOF {
			return nil, nil, fmt.Errorf("CSV file is empty")
		}
		return nil, nil, fmt.Errorf("failed to read CSV header: %w", err)
	}

	// Trim and validate headers
	for i, header := range headers {
		headers[i] = strings.TrimSpace(header)
		if headers[i] == "" {
			return nil, nil, fmt.Errorf("column %d has empty header", i+1)
		}
	}

	// Check for duplicate headers
	headerSet := make(map[string]bool)
	for _, header := range headers {
		if headerSet[header] {
			return nil, nil, fmt.Errorf("duplicate header column: %s", header)
		}
		headerSet[header] = true
	}

	// Read all data rows
	var rows []map[string]string
	lineNumber := 1 // Start at 1 for header

	for {
		record, err := csvReader.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			return nil, nil, fmt.Errorf("failed to read CSV row %d: %w", lineNumber+1, err)
		}

		lineNumber++

		// Skip empty rows
		isEmpty := true
		for _, field := range record {
			if strings.TrimSpace(field) != "" {
				isEmpty = false
				break
			}
		}
		if isEmpty {
			continue
		}

		// Ensure row has correct number of columns
		if len(record) != len(headers) {
			return nil, nil, fmt.Errorf("row %d has %d columns, expected %d", lineNumber, len(record), len(headers))
		}

		// Create row map
		rowMap := make(map[string]string)
		for i, value := range record {
			rowMap[headers[i]] = strings.TrimSpace(value)
		}

		rows = append(rows, rowMap)
	}

	if len(rows) == 0 {
		return nil, nil, fmt.Errorf("CSV file contains no data rows")
	}

	return rows, headers, nil
}

// ValidateHeaders checks if the CSV contains all required headers
func ValidateHeaders(headers []string, required []string, optional []string) error {
	headerSet := make(map[string]bool)
	for _, header := range headers {
		headerSet[header] = true
	}

	// Check required headers
	var missing []string
	for _, req := range required {
		if !headerSet[req] {
			missing = append(missing, req)
		}
	}

	if len(missing) > 0 {
		return fmt.Errorf("missing required columns: %s", strings.Join(missing, ", "))
	}

	// Check for unknown headers
	validHeaders := make(map[string]bool)
	for _, h := range required {
		validHeaders[h] = true
	}
	for _, h := range optional {
		validHeaders[h] = true
	}

	var unknown []string
	for _, header := range headers {
		if !validHeaders[header] {
			unknown = append(unknown, header)
		}
	}

	if len(unknown) > 0 {
		return fmt.Errorf("unknown columns: %s", strings.Join(unknown, ", "))
	}

	return nil
}

