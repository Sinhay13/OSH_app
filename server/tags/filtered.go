package tags

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"server/utils"
	"strconv"
	"strings"
)

type TagsFiltered struct {
	Tag          string  `json:"tag"`
	Comment      string  `json:"comment"`
	IsPrinciple  int     `json:"is_principle"`
	PrincipleTag *string `json:"principle_tag"`
	Active       int     `json:"active"`
	IsSystem     int     `json:"is_system"`
	SystemType   string  `json:"system_type"`
	CreatedTime  string  `json:"created_time"`
	UpdatedTime  string  `json:"updated_time"`
}

// Extract data from JSON
func extractFilters(w http.ResponseWriter, r *http.Request) (int, int, int, string, string, error) {
	data, err := utils.ExtractData(w, r)
	if err != nil {
		utils.Logger.Printf("Error extracting data: %v", err)
		return 0, 0, 0, "", "", err
	}

	var active, isSystem, isPrinciple int
	var principleTag, systemType string

	if val, ok := data["active"]; ok {
		active, err = strconv.Atoi(fmt.Sprintf("%v", val))
		if err != nil {
			utils.Logger.Printf("Invalid value for 'active': %v", err)
			return 0, 0, 0, "", "", err
		}
	} else {
		utils.Logger.Println("'active' not found in data")
		active = 0
	}

	if val, ok := data["isSystem"]; ok {
		isSystem, err = strconv.Atoi(fmt.Sprintf("%v", val))
		if err != nil {
			utils.Logger.Printf("Invalid value for 'isSystem': %v", err)
			return 0, 0, 0, "", "", err
		}
	} else {
		utils.Logger.Println("'isSystem' not found in data")
		isSystem = 0
	}

	if val, ok := data["isPrinciple"]; ok {
		isPrinciple, err = strconv.Atoi(fmt.Sprintf("%v", val))
		if err != nil {
			utils.Logger.Printf("Invalid value for 'isPrinciple': %v", err)
			return 0, 0, 0, "", "", err
		}
	} else {
		utils.Logger.Println("'isPrinciple' not found in data")
		isPrinciple = 0
	}

	if val, ok := data["principle"]; ok {
		principleTag = fmt.Sprintf("%v", val)
	} else {
		utils.Logger.Println("'principle' not found in data")
		principleTag = ""
	}

	if val, ok := data["systemType"]; ok {
		systemType = fmt.Sprintf("%v", val)
	} else {
		utils.Logger.Println("'systemType' not found in data")
		systemType = ""
	}

	return active, isSystem, isPrinciple, principleTag, systemType, nil
}

// Prepare SQL query
func prepareSQL(active, isSystem, isPrinciple int, principleTag, systemType string) (string, []interface{}, error) {
	tagsJson, err := utils.LoadQueries("tags.json")
	if err != nil {
		return "", nil, fmt.Errorf("failed to load queries: %w", err)
	}

	query := tagsJson.FilteredTags
	var params []interface{}
	var conditions []string

	// Build conditions
	if principleTag != "all" {
		if principleTag == "none" {
			conditions = append(conditions, "principle_tag IS NULL")
		} else {
			conditions = append(conditions, "principle_tag = ?")
			params = append(params, principleTag)
		}
	}

	if systemType != "all" {
		conditions = append(conditions, "system_type = ?")
		params = append(params, systemType)
	}

	if active != 10 {
		conditions = append(conditions, "active = ?")
		params = append(params, active)
	}

	if isSystem != 10 {
		conditions = append(conditions, "is_system = ?")
		params = append(params, isSystem)
	}

	if isPrinciple != 10 {
		conditions = append(conditions, "is_principle = ?")
		params = append(params, isPrinciple)
	}

	// Combine conditions
	if len(conditions) > 0 {
		query += " WHERE " + strings.Join(conditions, " AND ")
	}

	query += " ORDER BY updated_time ASC"
	return query, params, nil
}

// Fetch filtered tags
func GetTagsFilteredList(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	active, isSystem, isPrinciple, principleTag, systemType, err := extractFilters(w, r)
	if err != nil {
		http.Error(w, "Failed to extract filters", http.StatusBadRequest)
		return
	}

	query, params, err := prepareSQL(active, isSystem, isPrinciple, principleTag, systemType)
	if err != nil {
		http.Error(w, "Failed to prepare SQL query", http.StatusInternalServerError)
		return
	}

	rows, err := db.Query(query, params...)
	if err != nil {
		http.Error(w, "Error executing SQL query", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var tags []TagsFiltered
	for rows.Next() {
		var tag TagsFiltered
		if err := rows.Scan(&tag.Tag, &tag.Comment, &tag.IsPrinciple, &tag.PrincipleTag, &tag.Active, &tag.IsSystem, &tag.CreatedTime, &tag.UpdatedTime, &tag.SystemType); err != nil {
			http.Error(w, "Error scanning row", http.StatusInternalServerError)
			return
		}
		tags = append(tags, tag)
	}

	if err := rows.Err(); err != nil {
		http.Error(w, "Error iterating over rows", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(tags)
}
