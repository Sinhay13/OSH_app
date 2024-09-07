package tags

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"server/utils"
)

// Tag struct
type Tags struct {
	Tag string `json:"tag"`
}

func getTags(db *sql.DB, principle string) ([]Tags, error) {
	// Load JSON query configurations
	tagsJson, err := utils.LoadQueries("tags.json")
	if err != nil {
		utils.Logger.Print(err)
		return nil, err
	}

	var query string

	// Determine the query based on listType
	if principle == "all" {
		query = tagsJson.ActiveList
	} else if principle == "none" {
		query = tagsJson.ActiveListNone
	} else {
		query = tagsJson.ActiveListPrinciple
	}

	// Execute the query
	var rows *sql.Rows
	if principle == "all" || principle == "none" {
		rows, err = db.Query(query)
	} else {
		rows, err = db.Query(query, principle)
	}
	if err != nil {
		utils.Logger.Print(err)
		return nil, err
	}
	defer rows.Close()

	// Process the results
	var tags []Tags
	for rows.Next() {
		var tag Tags
		if err := rows.Scan(&tag.Tag); err != nil {
			return nil, err
		}
		tags = append(tags, tag)
	}

	// Check for errors from iterating over rows
	if err := rows.Err(); err != nil {
		return nil, err
	}

	return tags, nil
}

// Get active Tags
func TagsListActive(w http.ResponseWriter, r *http.Request, db *sql.DB) {

	principle := r.URL.Query().Get("principle")
	if principle == "" {
		utils.Logger.Println("principle name is needed")
		http.Error(w, "principle name is needed", http.StatusBadRequest)
		return
	}

	tagsList, err := getTags(db, principle)
	if err != nil {
		http.Error(w, "Server error", http.StatusInternalServerError)
		utils.Logger.Printf("Error getting tags: %v", err)
		return
	}

	// Define Content-Type
	w.Header().Set("Content-Type", "application/json")

	err = json.NewEncoder(w).Encode(tagsList)
	if err != nil {
		http.Error(w, "Error encoding JSON", http.StatusInternalServerError)
		utils.Logger.Printf("Error encoding JSON: %v", err)
	}
}
