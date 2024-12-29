package system

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"server/utils"
)

type SystemSelect struct {
	Date        string `json:"date"`
	Tag         string `json:"tag"`
	Observation string `json:"observation"`
	Result      string `json:"result"`
}

func GetPreviousResults(w http.ResponseWriter, r *http.Request, db *sql.DB) {

	// Get tag
	tag := r.URL.Query().Get("tag")
	if tag == "" {
		handleError(w, "Tag parameter is required", http.StatusBadRequest, nil)
		return
	}

	// Call json
	systemJson, err := utils.LoadQueries("system.json")
	if err != nil {
		handleError(w, "Error loading queries", http.StatusInternalServerError, err)
		return
	}

	query := systemJson.SelectPreviousResults

	rows, err := db.Query(query, tag)
	if err != nil {
		http.Error(w, "Error executing SQL query", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var tags []SystemSelect
	for rows.Next() {
		var tag SystemSelect
		if err := rows.Scan(&tag.Date, &tag.Tag, &tag.Observation, &tag.Result); err != nil {
			http.Error(w, "Error scanning row", http.StatusInternalServerError)
			return
		}
		tags = append(tags, tag)
	}

	if err := rows.Err(); err != nil {
		http.Error(w, "Error iterating over rows", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(tags)

}
