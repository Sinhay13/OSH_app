package chapters

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"server/utils"
)

// check if is first chapter
func IsFirstChapter(w http.ResponseWriter, r *http.Request, db *sql.DB) {

	count, err := CountRows(db)
	if err != nil {
		utils.Logger.Printf("countRows isFirstChapter : %v\n", err)
		return
	}

	if count != 0 {
		utils.Logger.Println("It is not the first chapter")
		return
	}

	w.WriteHeader(http.StatusOK)

	// Prepare the response
	response := map[string]interface{}{
		"ok":      true,
		"message": "is first chapter",
	}
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

		// Load queries from JSON file
		chaptersJson, err := utils.LoadQueries("chapters.json")
		if err != nil {
			utils.Logger.Printf("Error loading queries: %v\n", err)
			return
		}

		var row sql.NullString

		// Execute the query to check if the last entry is one year ago
		err = db.QueryRow(chaptersJson.One_year_ago).Scan(&row)
		if err != nil {
			utils.Logger.Printf("isOneYearAgo error running query: %v\n", err)
			return
		}

		if !row.Valid { // Check if the row is NULL (using sql.NullString)
			w.WriteHeader(http.StatusNoContent)
			return
		}
	}

	w.WriteHeader(http.StatusOK)

	// Prepare the response
	response := map[string]interface{}{
		"ok":      true,
		"message": "is one year ago",
	}
	w.Header().Set("Content-Type", "application/json")

	// Write the response
	if err := json.NewEncoder(w).Encode(response); err != nil {
		utils.Logger.Printf("Error encoding response: %v\n", err)
	}
}
