package tags

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"server/utils"
	"time"
)

type TagsFiltered struct {
	Tag          string    `json:"tag"`
	Comment      *string   `json:"comment"`
	IsPrinciple  int       `json:"is_principle"`
	PrincipleTag *string   `json:"principle_tag"`
	Active       int       `json:"active"`
	IsSystem     int       `json:"is_system"`
	CreatedTime  time.Time `json:"created_time"`
	UpdatedTime  time.Time `json:"updated_time"`
}

type TagsFilteredResponse struct {
	Tag          string  `json:"tag"`
	Comment      *string `json:"comment"`
	IsPrinciple  int     `json:"is_principle"`
	PrincipleTag *string `json:"principle_tag"`
	Active       int     `json:"active"`
	IsSystem     int     `json:"is_system"`
	CreatedTime  string  `json:"created_time"`
	UpdatedTime  string  `json:"updated_time"`
}

// Date format for parsing
const timeFormat = "2006-01-02 15:04:05"

// Convert string to time.Time
func parseTime(value string) (time.Time, error) {
	return time.Parse(timeFormat, value)
}

// Convert time.Time to string
func formatTime(value time.Time) string {
	return value.Format(timeFormat)
}

// Extract data from JSON
func extractFilters(w http.ResponseWriter, r *http.Request) (*int, *int, *string, error) {

	data, err := utils.ExtractData(w, r)
	if err != nil {
		utils.Logger.Print("Error extracting data: ", err)
		return nil, nil, nil, err
	}

	var isSystem, isPrinciple *int
	var principleTag *string

	//  isSystem
	if one, ok := data["isSystem"].(string); ok {
		var intValue int
		_, err := fmt.Sscanf(one, "%d", &intValue)
		if err != nil {
			utils.Logger.Print("Error parsing isSystem: ", err)
			return nil, nil, nil, err
		}
		isSystem = &intValue
	} else {
		utils.Logger.Print("isSystem not found or is null")
	}

	// isPrinciple
	if two, ok := data["isPrinciple"].(string); ok {
		var intValue int
		_, err := fmt.Sscanf(two, "%d", &intValue)
		if err != nil {
			utils.Logger.Print("Error parsing isPrinciple: ", err)
			return nil, nil, nil, err
		}
		isPrinciple = &intValue
	} else {
		utils.Logger.Print("isPrinciple not found or is null")
	}

	// principleTag
	if three, ok := data["principleTag"].(string); ok {
		principleTag = &three
	} else {
		utils.Logger.Print("principleTag not found or is null")
	}

	return isSystem, isPrinciple, principleTag, nil
}

func prepareSQL(isSystem *int, isPrinciple *int, principleTag *string) (string, []interface{}, error) {

	// Load JSON queries
	tagsJson, err := utils.LoadQueries("tags.json")
	if err != nil {
		return "", nil, err
	}

	query := tagsJson.FilteredTagsEnabled
	var params []interface{}

	// Add filters to query based on provided arguments
	if isSystem != nil {
		query += " AND is_system = ?"
		params = append(params, *isSystem)
	}

	if isPrinciple != nil {
		query += " AND is_principle = ?"
		params = append(params, *isPrinciple)
	}

	if principleTag != nil {
		if *principleTag == "none" {
			query += " AND principle_tag IS NULL"
		} else {
			query += " AND principle_tag = ?"
			params = append(params, *principleTag)
		}
	}

	return query, params, nil
}

// Convert time.Time to string when preparing response
func GetTagsEnabledFilteredList(w http.ResponseWriter, r *http.Request, db *sql.DB) {

	// get data:
	isSystem, isPrinciple, principleTag, err := extractFilters(w, r)
	if err != nil {
		utils.Logger.Printf("Error extracting data to filter: %v\n", err)
		return
	}

	// get final query:
	query, params, err := prepareSQL(isSystem, isPrinciple, principleTag)
	if err != nil {
		utils.Logger.Printf("Error preparing SQL query to filter enabled tags: %v\n", err)
		return
	}

	// run SQL
	rows, err := db.Query(query, params...)
	if err != nil {
		utils.Logger.Printf("Error executing SQL query: %v\n", err)
		http.Error(w, "Error executing SQL query", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	// prepare slice
	var tags []TagsFiltered

	// get results
	for rows.Next() {
		var tag TagsFiltered
		var createdTimeStr, updatedTimeStr string

		if err := rows.Scan(
			&tag.Tag,
			&tag.Comment,
			&tag.IsPrinciple,
			&tag.PrincipleTag,
			&tag.Active,
			&tag.IsSystem,
			&createdTimeStr,
			&updatedTimeStr,
		); err != nil {
			utils.Logger.Printf("Error scanning row: %v\n", err)
			http.Error(w, "Error processing query result", http.StatusInternalServerError)
			return
		}

		// Parse string timestamps to time.Time
		var parseError error
		tag.CreatedTime, parseError = parseTime(createdTimeStr)
		if parseError != nil {
			utils.Logger.Printf("Error parsing created_time: %v\n", parseError)
			http.Error(w, "Error processing query result", http.StatusInternalServerError)
			return
		}

		tag.UpdatedTime, parseError = parseTime(updatedTimeStr)
		if parseError != nil {
			utils.Logger.Printf("Error parsing updated_time: %v\n", parseError)
			http.Error(w, "Error processing query result", http.StatusInternalServerError)
			return
		}

		tags = append(tags, tag)
	}

	// Check for errors
	if err := rows.Err(); err != nil {
		utils.Logger.Printf("Error during rows iteration: %v\n", err)
		http.Error(w, "Error processing query result", http.StatusInternalServerError)
		return
	}

	// Convert to response type
	var responseTags []TagsFilteredResponse
	for _, tag := range tags {
		responseTags = append(responseTags, TagsFilteredResponse{
			Tag:          tag.Tag,
			Comment:      tag.Comment,
			IsPrinciple:  tag.IsPrinciple,
			PrincipleTag: tag.PrincipleTag,
			Active:       tag.Active,
			IsSystem:     tag.IsSystem,
			CreatedTime:  formatTime(tag.CreatedTime),
			UpdatedTime:  formatTime(tag.UpdatedTime),
		})
	}

	// Send to the front
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(responseTags); err != nil {
		utils.Logger.Printf("Error encoding JSON response: %v\n", err)
		http.Error(w, "Error generating response", http.StatusInternalServerError)
		return
	}
}
