package tags

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"server/utils"
)

func CheckIfTagInactive(w http.ResponseWriter, r *http.Request, db *sql.DB) {

	// call json
	tagsJson, err := utils.LoadQueries("tags.json")
	if err != nil {
		http.Error(w, "Error loading queries", http.StatusInternalServerError)
		utils.Logger.Println(err)
	}

	query := tagsJson.CheckIfTagInactive

	tag := r.URL.Query().Get("name")
	if tag == "" {
		utils.Logger.Println("Tag name is missing")
		http.Error(w, "Tag name is required", http.StatusBadRequest)
		return
	}

	var result int
	err = db.QueryRow(query, tag).Scan(&result)
	if err != nil {
		utils.Logger.Println(err)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json")

	// Prepare the response
	response := map[string]interface{}{
		"ok":     true,
		"result": result,
	}

	// Write the response
	if err := json.NewEncoder(w).Encode(response); err != nil {
		utils.Logger.Printf("Error encoding response: %v\n", err)
		http.Error(w, "Error encoding response", http.StatusInternalServerError)
	}
}
