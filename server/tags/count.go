package tags

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"server/utils"
)

func getActiveAndInactiveTags(db *sql.DB) (int, int, error) {

	// Load JSON query configurations
	tagsJson, err := utils.LoadQueries("tags.json")
	if err != nil {
		utils.Logger.Print(err)
		return 0, 0, err
	}

	var activeTags int
	var inactiveTags int

	query := tagsJson.CountTags

	// for active tag
	err = db.QueryRow(query, 1).Scan(&activeTags)
	if err != nil {
		return 0, 0, err
	}

	// for active tag
	err = db.QueryRow(query, 0).Scan(&inactiveTags)
	if err != nil {
		return 0, 0, err
	}

	return activeTags, inactiveTags, nil

}

func CountTags(w http.ResponseWriter, r *http.Request, db *sql.DB) {

	active, inactive, err := getActiveAndInactiveTags(db)
	if err != nil {
		http.Error(w, "Error counting tags", http.StatusInternalServerError)
		utils.Logger.Print(err)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json")

	// Prepare the response
	response := map[string]interface{}{
		"ok":       true,
		"active":   active,
		"inactive": inactive,
	}

	// Write the response
	if err := json.NewEncoder(w).Encode(response); err != nil {
		utils.Logger.Printf("Error encoding response: %v\n", err)
		http.Error(w, "Error encoding response", http.StatusInternalServerError)
	}

}
