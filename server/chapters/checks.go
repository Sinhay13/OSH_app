package chapters

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"server/utils"
)

func IsFirstChapter(w http.ResponseWriter, r *http.Request, db *sql.DB) {

	count, err := CountRows(db)
	if err != nil {
		utils.Logger.Printf("countRows isFirstChapter : %v\n", err)
		return
	}

	// Prepare the response
	response := map[string]interface{}{
		"ok":      count == 0, // true if count is 0, false otherwise
		"message": "is first chapter",
	}
	if count != 0 {
		response["message"] = "It is not the first chapter"
	}

	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json")

	// Write the response
	if err := json.NewEncoder(w).Encode(response); err != nil {
		utils.Logger.Printf("Error encoding response: %v\n", err)
	}
}

// check if is one year ago
func IsOneYearAgo(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	count, err := CountRows(db)
	if err != nil {
		utils.Logger.Printf("countRows isOneYearAgo : %v\n", err)
		return
	}

	if count != 0 {
		chaptersJson, err := utils.LoadQueries("chapters.json")
		if err != nil {
			utils.Logger.Printf("Error loading queries: %v\n", err)
			return
		}

		var row sql.NullString

		err = db.QueryRow(chaptersJson.One_year_ago).Scan(&row)
		if err != nil {
			utils.Logger.Printf("isOneYearAgo error running query: %v\n", err)
			return
		}

		response := map[string]bool{"found": row.Valid}
		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(response); err != nil {
			utils.Logger.Printf("Error encoding response: %v\n", err)
		}
		return
	}

	// If no rows were found or count is 0
	response := map[string]bool{"found": false}
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(response); err != nil {
		utils.Logger.Printf("Error encoding response: %v\n", err)
	}
}

// check if chapter exists
func CheckChapter(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	chaptersJson, err := utils.LoadQueries("chapters.json")
	if err != nil {
		utils.Logger.Printf("Error loading queries: %v\n", err)
		return
	}

	query := chaptersJson.Count

	var count int
	err = db.QueryRow(query).Scan(&count)
	if err != nil {
		utils.Logger.Printf("Error running query: %v\n", err)
		return
	}

	var result string

	if count == 0 {
		result = "closed"
	} else {
		result = "opened"
	}

	response := map[string]string{"status": result}
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(response); err != nil {
		utils.Logger.Printf("Error encoding response: %v\n", err)
	}
}
