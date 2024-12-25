package system

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"server/utils"
)

func CheckDateTag(w http.ResponseWriter, r *http.Request, db *sql.DB) {

	// call Json
	systemJson, err := utils.LoadQueries("system.json")
	if err != nil {
		http.Error(w, "Error loading queries", http.StatusInternalServerError)
		utils.Logger.Println(err)
		return
	}

	// prepare query
	query := systemJson.CountSystemEntries

	// get data from the call
	date := r.URL.Query().Get("date")
	if date == "" {
		http.Error(w, "Date parameter is required", http.StatusBadRequest)
		utils.Logger.Println("Missing required date parameter")
		return
	}
	tag := r.URL.Query().Get("tag")
	if tag == "" {
		http.Error(w, "Tag parameter is required", http.StatusBadRequest)
		utils.Logger.Println("Missing required tag parameter")
		return
	}

	// run query
	var nb int
	err = db.QueryRow(query, date, tag).Scan(&nb)
	if err != nil {
		http.Error(w, "Database query failed", http.StatusInternalServerError)
		utils.Logger.Println("Database error:", err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	// Prepare the response
	response := map[string]interface{}{
		"ok":    true,
		"count": nb,
	}

	// Write the response
	if err := json.NewEncoder(w).Encode(response); err != nil {
		utils.Logger.Printf("Error encoding response: %v\n", err)
		http.Error(w, "Error encoding response", http.StatusInternalServerError)
	}

}
