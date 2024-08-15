package tags

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"server/utils"
)

// tag struct
type Tags struct {
	Tag string `json:"tag"`
}

func getTags(db *sql.DB, listType string) ([]Tags, error) {
	// Load JSON query configurations
	tagsJson, err := utils.LoadQueries("tags.json")
	if err != nil {
		utils.Logger.Print(err)
		return nil, err
	}

	var query string

	// Determine the query based on listType
	switch listType {
	case "full":
		query = tagsJson.FullList
	case "active":
		query = tagsJson.ActiveList
	default:
		query = tagsJson.NonList
	}

	// Execute the query
	rows, err := db.Query(query)
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
			utils.Logger.Print(err)
			return nil, err
		}
		tags = append(tags, tag)
	}

	// Check for errors from iterating over rows
	if err := rows.Err(); err != nil {
		utils.Logger.Print(err)
		return nil, err
	}

	return tags, nil
}

// Get all Tags
func TagsListFull(w http.ResponseWriter, r *http.Request, db *sql.DB) {

	var lisType = "full"

	tagsList, err := getTags(db, lisType)
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

// Get active Tags
func TagsListActive(w http.ResponseWriter, r *http.Request, db *sql.DB) {

	var lisType = "active"

	tagsList, err := getTags(db, lisType)
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

// Get non active tags
func TagsListNon(w http.ResponseWriter, r *http.Request, db *sql.DB) {

	var lisType = "non"

	tagsList, err := getTags(db, lisType)
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
