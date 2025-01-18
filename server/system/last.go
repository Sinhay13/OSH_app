package system

import (
	"database/sql"
	"encoding/json"
	"fmt"
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

// Get data in function of date ( by default last date)

type LastData struct {
	Date        string `json:"date"`
	Tag         string `json:"tag"`
	Observation string `json:"observation"`
	Result      string `json:"result"`
	Principle   string `json:"principle"`
}

// get principle
func getPrinciple(tag string, db *sql.DB) (string, error) {
	tagsJson, err := utils.LoadQueries("tags.json")
	if err != nil {
		return "", fmt.Errorf("error loading queries: %v", err)
	}

	var principle string
	err = db.QueryRow(tagsJson.GetPrinciple, tag).Scan(&principle)
	if err != nil {
		return "", fmt.Errorf("error getting principle: %v", err)
	}

	return principle, nil
}

//

// Function general
func GetLastData(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	date := r.URL.Query().Get("date")
	if date == "" {
		utils.Logger.Println("date is needed")
		http.Error(w, "date is needed", http.StatusBadRequest)
		return
	}

	systemJson, err := utils.LoadQueries("system.json")
	if err != nil {
		handleError(w, "Error loading queries", http.StatusInternalServerError, err)
		return
	}

	query := systemJson.GetLastData

	// Execute the query
	rows, err := db.Query(query, date)
	if err != nil {
		handleError(w, "Error executing query", http.StatusInternalServerError, err)
		return
	}
	defer rows.Close()

	var results []LastData
	for rows.Next() {
		var data LastData
		// Scan the row into our struct
		err := rows.Scan(&data.Date, &data.Tag, &data.Observation, &data.Result)
		if err != nil {
			handleError(w, "Error scanning row", http.StatusInternalServerError, err)
			return
		}

		// Get principle for this tag
		principle, err := getPrinciple(data.Tag, db)
		if err != nil {
			handleError(w, "Error getting principle", http.StatusInternalServerError, err)
			return
		}
		data.Principle = principle

		results = append(results, data)
	}

	// Check for errors from iterating over rows
	if err = rows.Err(); err != nil {
		handleError(w, "Error iterating rows", http.StatusInternalServerError, err)
		return
	}

	// Return the results as JSON
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(results); err != nil {
		utils.Logger.Printf("Error encoding response: %v\n", err)
	}
}
