package tags

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"server/utils"
)

type Principles struct {
	Tag string `json:"tag"`
}

func getPrinciples(db *sql.DB) ([]Principles, error) {
	// Load JSON query configurations
	tagsJson, err := utils.LoadQueries("tags.json")
	if err != nil {
		utils.Logger.Print(err)
		return nil, err
	}

	query := tagsJson.Principles

	// Execute the query
	rows, err := db.Query(query)
	if err != nil {
		utils.Logger.Print(err)
		return nil, err
	}
	defer rows.Close()

	// Process the results
	var principles []Principles
	for rows.Next() {
		var principle Principles
		if err := rows.Scan(&principle.Tag); err != nil {
			return nil, err
		}
		principles = append(principles, principle)
	}

	// Check for errors from iterating over rows
	if err := rows.Err(); err != nil {
		return nil, err
	}

	// If no rows were found, return a slice with a single "none" value
	if len(principles) == 0 {
		return []Principles{{Tag: "none"}}, nil
	}

	return principles, nil
}

func TagsPrinciples(w http.ResponseWriter, r *http.Request, db *sql.DB) {

	principles, err := getPrinciples(db)
	if err != nil {
		http.Error(w, "Server error", http.StatusInternalServerError)
		utils.Logger.Printf("Error getting principles: %v", err)
		return
	}

	// Define Content-Type
	w.Header().Set("Content-Type", "application/json")

	err = json.NewEncoder(w).Encode(principles)
	if err != nil {
		http.Error(w, "Error encoding JSON", http.StatusInternalServerError)
		utils.Logger.Printf("Error encoding JSON: %v", err)
	}

}
