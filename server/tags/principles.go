package tags

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"server/utils"
)

// Get list of principles //

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

	return principles, nil
}

func TagsPrinciples(w http.ResponseWriter, r *http.Request, db *sql.DB) {

	principles, err := getPrinciples(db)
	if err != nil {
		http.Error(w, "Server error", http.StatusInternalServerError)
		utils.Logger.Printf("Error getting principles: %v", err)
		return
	}
	principles = append(principles, Principles{Tag: "none"})

	// Define Content-Type
	w.Header().Set("Content-Type", "application/json")

	err = json.NewEncoder(w).Encode(principles)
	if err != nil {
		http.Error(w, "Error encoding JSON", http.StatusInternalServerError)
		utils.Logger.Printf("Error encoding JSON: %v", err)
	}

}

// Check if principle is using //

func countPrinciples(db *sql.DB, tag string) (int, error) {

	// Load JSON query configurations
	tagsJson, err := utils.LoadQueries("tags.json")
	if err != nil {
		utils.Logger.Print(err)
		return 0, err
	}

	query := tagsJson.CheckPrinciplesTags
	var result int

	err = db.QueryRow(query, tag).Scan(&result)
	if err != nil {
		return 0, err
	}

	return result, nil

}

func CheckPrinciples(w http.ResponseWriter, r *http.Request, db *sql.DB) {

	tag := r.URL.Query().Get("tag")
	if tag == "" {
		utils.Logger.Println("Tag name is needed")
		return
	}

	result, err := countPrinciples(db, tag)
	if err != nil {
		utils.Logger.Printf("Error SQL request to count principles using : %v\n", err)
		return
	}

	w.WriteHeader(http.StatusOK)

	// Prepare the response
	response := map[string]interface{}{
		"ok":     true,
		"result": result,
	}
	w.Header().Set("Content-Type", "application/json")

	// Write the response
	if err := json.NewEncoder(w).Encode(response); err != nil {
		utils.Logger.Printf("Error encoding response: %v\n", err)
	}

}
