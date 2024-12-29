package system

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"server/utils"
)

func getDataToUpdateSystem(w http.ResponseWriter, r *http.Request) (date, tag, observation, result string, err error) {
	// Extract data
	data, err := utils.ExtractData(w, r)
	if err != nil {
		utils.Logger.Printf("Error extracting data: %v\n", err)
		http.Error(w, "Invalid input data", http.StatusBadRequest)
		return "", "", "", "", err
	}

	requiredFields := []string{"date", "tag", "observation", "result"}
	missingFields := []string{}

	for _, field := range requiredFields {
		if _, exists := data[field]; !exists {
			missingFields = append(missingFields, field)
		}
	}

	if len(missingFields) > 0 {
		errMsg := fmt.Sprintf("Missing fields: %v", missingFields)
		utils.Logger.Print(errMsg)
		http.Error(w, errMsg, http.StatusBadRequest)
		return "", "", "", "", fmt.Errorf(errMsg)
	}

	return data["date"].(string), data["tag"].(string), data["observation"].(string), data["result"].(string), nil
}

func UpdateSystem(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	// Extract data
	date, tag, observation, result, err := getDataToUpdateSystem(w, r)
	if err != nil {
		return
	}

	// Load Queries
	SystemJson, err := utils.LoadQueries("system.json")
	if err != nil {
		utils.Logger.Printf("Error loading queries: %v\n", err)
		http.Error(w, "Server error", http.StatusInternalServerError)
		return
	}

	query := SystemJson.UpdateSystem
	if query == "" {
		utils.Logger.Print("UpdateSystem query is empty")
		http.Error(w, "System update query not found", http.StatusInternalServerError)
		return
	}

	// Execute Query
	_, err = db.Exec(query, date, tag, observation, result)
	if err != nil {
		utils.Logger.Printf("Database execution error: %v\n", err)
		http.Error(w, "Failed to update the system", http.StatusInternalServerError)
		return
	}

	// Send Response
	response := map[string]interface{}{
		"ok":      true,
		"message": "System updated",
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(response); err != nil {
		utils.Logger.Printf("Error encoding response: %v\n", err)
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
	}
}
