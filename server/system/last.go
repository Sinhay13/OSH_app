package system

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"server/utils"
)

func GetLastDate(w http.ResponseWriter, r *http.Request, db *sql.DB) {

	// Call json
	systemJson, err := utils.LoadQueries("system.json")
	if err != nil {
		handleError(w, "Error loading queries", http.StatusInternalServerError, err)
		return
	}

	query := systemJson.GetLastDate

	var date string
	err = db.QueryRow(query).Scan(&date)
	if err != nil {
		utils.Logger.Printf("Error running query: %v\n", err)
		return
	}

	response := map[string]string{"last": date}
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(response); err != nil {
		utils.Logger.Printf("Error encoding response: %v\n", err)
	}

}
