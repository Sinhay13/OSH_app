package system

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"server/utils"
)

// Struct of the full data
type FullData struct {
	Date        string `json:"date"`
	Tag         string `json:"tag"`
	Observation string `json:"observation"`
	Result      string `json:"result"`
}

// Function General
func FullResult(w http.ResponseWriter, r *http.Request, db *sql.DB) {

	tag := r.URL.Query().Get("tag")
	if tag == "" {

		utils.Logger.Println("tag name is needed")
		http.Error(w, "tag name is needed", http.StatusBadRequest)
		return
	}

	systemJson, err := utils.LoadQueries("system.json")
	if err != nil {
		handleError(w, "Error loading queries", http.StatusInternalServerError, err)
		return
	}

	query := systemJson.GetFullResult

	rows, err := db.Query(query, tag)
	if err != nil {
		handleError(w, "Error executing query", http.StatusInternalServerError, err)
		return
	}
	defer rows.Close()

	var results []FullData
	for rows.Next() {
		var data FullData
		err := rows.Scan(&data.Date, &data.Tag, &data.Observation, &data.Result)
		if err != nil {
			handleError(w, "Error getting principle", http.StatusInternalServerError, err)
			return
		}
		results = append(results, data)
	}

	if err = rows.Err(); err != nil {
		handleError(w, "Error iterating rows", http.StatusInternalServerError, err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(results); err != nil {
		utils.Logger.Printf("Error encoding response: %v\n", err)
	}
}
