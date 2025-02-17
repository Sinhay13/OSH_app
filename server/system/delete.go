package system

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"server/utils"
)

func DeleteSystem(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	//utils.Logger.Printf("DeleteSystem called with URL: %s\n", r.URL.String())

	// Load queries from JSON
	systemJson, err := utils.LoadQueries("system.json")
	if err != nil {
		http.Error(w, "Error loading queries", http.StatusInternalServerError)
		utils.Logger.Printf("Failed to load queries: %v\n", err)
		return
	}
	query := systemJson.DeleteEntrySystem
	//utils.Logger.Printf("Delete query loaded: %s\n", query)

	// Get date
	date := r.URL.Query().Get("date")
	if date == "" {
		utils.Logger.Println("date parameter is missing in the request")
		http.Error(w, "Date is required", http.StatusBadRequest)
		return
	}

	// Get tag
	tag := r.URL.Query().Get("tag")
	if tag == "" {
		utils.Logger.Println("tag parameter is missing in the request")
		http.Error(w, "Tag is required", http.StatusBadRequest)
		return
	}

	// Execute the delete query
	result, err := db.Exec(query, date, tag)
	if err != nil {
		utils.Logger.Printf("Error executing delete query with date=%s and tag=%s: %v\n", date, tag, err)
		http.Error(w, "Error deleting system", http.StatusInternalServerError)
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		utils.Logger.Printf("Delete query completed but no records were found/deleted for date=%s and tag=%s\n", date, tag)
	} else {
		//utils.Logger.Printf("Successfully deleted system entry. Rows affected: %d\n", rowsAffected)
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
	} else {
		//utils.Logger.Println("Successfully sent response for delete operation")
	}
}
