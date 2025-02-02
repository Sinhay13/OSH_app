package tags

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"server/utils"
)

// TagSystem struct represents a tag system entry
type TagSystem struct {
	Tag string `json:"tag"`
}

// TagSystemList retrieves the tag system list
func TagSystemList(w http.ResponseWriter, r *http.Request, db *sql.DB) {

	// Close the request body when done
	defer r.Body.Close()

	// Get the principle
	principle := r.URL.Query().Get("principle")
	if principle == "" {
		utils.Logger.Println("principle is missing")
		http.Error(w, "principle is missing", http.StatusBadRequest)
		return
	}

	// Load queries
	tagsJson, err := utils.LoadQueries("tags.json")
	if err != nil {
		utils.Logger.Printf("Failed to load queries: %v", err)
		http.Error(w, "Failed to load queries", http.StatusInternalServerError)
		return
	}

	// Prepare and execute query
	stmt, err := db.Prepare(tagsJson.TagSystem)
	if err != nil {
		utils.Logger.Printf("Error preparing query: %v", err)
		http.Error(w, "Error preparing query", http.StatusInternalServerError)
		return
	}
	defer stmt.Close()

	rows, err := stmt.Query(principle)
	if err != nil {
		utils.Logger.Printf("Error executing query: %v", err)
		http.Error(w, "Error executing query", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	// Scan rows into a slice
	var tags []TagSystem
	for rows.Next() {
		var tag TagSystem
		if err := rows.Scan(&tag.Tag); err != nil {
			utils.Logger.Printf("Error scanning row: %v", err)
			http.Error(w, "Error scanning row", http.StatusInternalServerError)
			return
		}
		tags = append(tags, tag)
	}

	if err := rows.Err(); err != nil {
		utils.Logger.Printf("Error finalizing rows: %v", err)
		http.Error(w, "Error finalizing rows", http.StatusInternalServerError)
		return
	}

	// Define Content-Type and encode response
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(tags); err != nil {
		utils.Logger.Printf("Error encoding JSON: %v", err)
		http.Error(w, "Error encoding JSON", http.StatusInternalServerError)
		return
	}
}

// Get the type of a tag
func TagSystemType(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	// Close the request body when done
	defer r.Body.Close()

	// Get the tag from query parameters
	tag := r.URL.Query().Get("tag")
	if tag == "" {
		utils.Logger.Println("tag is missing")
		http.Error(w, "tag is missing", http.StatusBadRequest)
		return
	}

	// Load queries from tags.json
	tagsJson, err := utils.LoadQueries("tags.json")
	if err != nil {
		utils.Logger.Printf("Failed to load queries: %v", err)
		http.Error(w, "Failed to load queries", http.StatusInternalServerError)
		return
	}

	// Prepare and execute query
	stmt, err := db.Prepare(tagsJson.TagType)
	if err != nil {
		utils.Logger.Printf("Error preparing query: %v", err)
		http.Error(w, "Error preparing query", http.StatusInternalServerError)
		return
	}
	defer stmt.Close()

	// Execute query and fetch the result
	var systemType string
	err = stmt.QueryRow(tag).Scan(&systemType)
	if err != nil {
		if err == sql.ErrNoRows {
			utils.Logger.Printf("No results found for tag: %s", tag)
			http.Error(w, "No results found", http.StatusNotFound)
		} else {
			utils.Logger.Printf("Error executing query: %v", err)
			http.Error(w, "Error executing query", http.StatusInternalServerError)
		}
		return
	}

	// Return the result as a response
	w.Header().Set("Content-Type", "application/json")
	response := map[string]string{"type": systemType}
	if err := json.NewEncoder(w).Encode(response); err != nil {
		utils.Logger.Printf("Error encoding response: %v", err)
		http.Error(w, "Error encoding response", http.StatusInternalServerError)
		return
	}
}
