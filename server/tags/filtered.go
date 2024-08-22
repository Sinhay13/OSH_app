package tags

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"server/utils"
	"strconv"
)

type TagsFiltered struct {
	Tag          string  `json:"tag"`
	Comment      string  `json:"comment"`
	IsPrinciple  int     `json:"is_principle"`
	PrincipleTag *string `json:"principle_tag"`
	Active       int     `json:"active"`
	IsSystem     int     `json:"is_system"`
	CreatedTime  string  `json:"created_time"`
	UpdatedTime  string  `json:"updated_time"`
}

// Extract data from JSON
func extractFilters(w http.ResponseWriter, r *http.Request) (int, int, string, error) {

	data, err := utils.ExtractData(w, r)
	if err != nil {
		utils.Logger.Print("Error extracting data: ", err)
		return 0, 0, "", err
	}

	var isSystem, isPrinciple int
	var principleTag string

	if val, ok := data["isSystem"]; ok {
		isSystem, err = strconv.Atoi(fmt.Sprintf("%v", val))
		if err != nil {
			utils.Logger.Print("Error converting isSystem to int: ", err)
			return 0, 0, "", err
		}
	} else {
		utils.Logger.Println("isSystem not found in data")
	}

	if val, ok := data["isPrinciple"]; ok {
		isPrinciple, err = strconv.Atoi(fmt.Sprintf("%v", val))
		if err != nil {
			utils.Logger.Print("Error converting isPrinciple to int: ", err)
			return 0, 0, "", err
		}
	} else {
		utils.Logger.Println("isPrinciple not found in data")
	}

	if val, ok := data["principle"]; ok {
		principleTag = fmt.Sprintf("%v", val)
	} else {
		utils.Logger.Println("principle not found in data")
	}

	return isSystem, isPrinciple, principleTag, nil
}

// Prepare SQL query
func prepareSQL(isSystem int, isPrinciple int, principleTag string) (string, []interface{}, error) {
	tagsJson, err := utils.LoadQueries("tags.json")
	if err != nil {
		return "", nil, err
	}

	query := tagsJson.FilteredTagsEnabled
	var params []interface{}

	if isSystem != 10 {
		query += " AND is_system = ?"
		params = append(params, isSystem)
	}

	if isPrinciple != 10 {
		query += " AND is_principle = ?"
		params = append(params, isPrinciple)
	}

	if principleTag != "all" {
		if principleTag == "none" {
			query += " AND principle_tag IS NULL"
		} else {
			query += " AND principle_tag = ?"
			params = append(params, principleTag)
		}
	}

	return query, params, nil
}

// Fetch filtered tags
func GetTagsEnabledFilteredList(w http.ResponseWriter, r *http.Request, db *sql.DB) {

	isSystem, isPrinciple, principleTag, err := extractFilters(w, r)
	if err != nil {
		utils.Logger.Printf("Error extracting data to filter: %v\n", err)
		return
	}

	query, params, err := prepareSQL(isSystem, isPrinciple, principleTag)
	if err != nil {
		utils.Logger.Printf("Error preparing SQL query to filter enabled tags: %v\n", err)
		return
	}

	rows, err := db.Query(query, params...)
	if err != nil {
		utils.Logger.Printf("Error executing SQL query: %v\n", err)
		http.Error(w, "Error executing SQL query", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var tags []TagsFiltered

	for rows.Next() {
		var tag TagsFiltered

		// Scanning the date fields as strings
		if err := rows.Scan(
			&tag.Tag,
			&tag.Comment,
			&tag.IsPrinciple,
			&tag.PrincipleTag,
			&tag.Active,
			&tag.IsSystem,
			&tag.CreatedTime,
			&tag.UpdatedTime,
		); err != nil {
			utils.Logger.Printf("Error scanning row: %v\n", err)
			http.Error(w, "Error processing query result", http.StatusInternalServerError)
			return
		}

		tags = append(tags, tag)
	}

	if err := rows.Err(); err != nil {
		utils.Logger.Printf("Error during row iteration: %v\n", err)
		http.Error(w, "Error during row iteration", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(tags); err != nil {
		utils.Logger.Printf("Error encoding response as JSON: %v\n", err)
		http.Error(w, "Error encoding response as JSON", http.StatusInternalServerError)
	}
}
