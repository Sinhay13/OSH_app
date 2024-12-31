package reminds

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"server/utils"
	"strconv"
)

func DeleteRemind(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	// Load queries from JSON
	remindsJson, err := utils.LoadQueries("reminds.json")
	if err != nil {
		http.Error(w, "Error loading queries", http.StatusInternalServerError)
		utils.Logger.Println(err)
		return
	}
	query := remindsJson.DeleteRemind

	// Get the "id" from the URL query parameters
	entry_id := r.URL.Query().Get("id")
	if entry_id == "" {
		utils.Logger.Println("ID is missing")
		http.Error(w, "ID is required", http.StatusBadRequest)
		return
	}

	// Convert entry_id to int
	id, err := strconv.Atoi(entry_id)
	if err != nil {
		utils.Logger.Println("Invalid ID format")
		http.Error(w, "Invalid ID format", http.StatusBadRequest)
		return
	}

	// Execute the delete query
	_, err = db.Exec(query, id)
	if err != nil {
		utils.Logger.Println("Error executing delete query:", err)
		http.Error(w, "Error deleting remind", http.StatusInternalServerError)
		return
	}

	// Set response headers
	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json")

	// Prepare and send the response
	response := map[string]interface{}{
		"ok": true,
	}

	// Write the response
	if err := json.NewEncoder(w).Encode(response); err != nil {
		utils.Logger.Printf("Error encoding response: %v\n", err)
		http.Error(w, "Error encoding response", http.StatusInternalServerError)
	}
}
