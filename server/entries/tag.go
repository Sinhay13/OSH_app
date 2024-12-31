package entries

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"server/utils"
	"strconv"
)

func GetTagFromID(w http.ResponseWriter, r *http.Request, db *sql.DB) {

	// Get data
	entryID := r.URL.Query().Get("id")
	if entryID == "" {
		utils.Logger.Println("entry_id is missing")
		http.Error(w, "entry_id is missing", http.StatusBadRequest)
		return
	}

	// Convert string to int
	entryIdInt, err := strconv.Atoi(entryID)
	if err != nil {
		utils.Logger.Println("Error converting entry_id to int:", err)
		http.Error(w, "Invalid entry_id", http.StatusBadRequest)
		return
	}

	// Load the JSON with queries
	entriesJson, err := utils.LoadQueries("entries.json")
	if err != nil {

		utils.Logger.Println("Error loading queries:", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	// Prepare query
	query := entriesJson.GetTagFromID

	// SQL request
	var tag string
	err = db.QueryRow(query, entryIdInt).Scan(&tag)
	if err != nil {
		utils.Logger.Println("Error getting tag from ID:", err)
		http.Error(w, "Tag not found", http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json")

	// Prepare the response
	response := map[string]interface{}{
		"ok":  true,
		"tag": tag,
	}

	// Write the response
	if err := json.NewEncoder(w).Encode(response); err != nil {
		utils.Logger.Printf("Error encoding response: %v\n", err)
		http.Error(w, "Error encoding response", http.StatusInternalServerError)
	}

}
