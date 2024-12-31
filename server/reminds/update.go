package reminds

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"server/utils"
	"strconv"
)

func UpdateDateRemind(w http.ResponseWriter, r *http.Request, db *sql.DB) {

	// Load queries from JSON
	remindsJson, err := utils.LoadQueries("reminds.json")
	if err != nil {
		http.Error(w, "Error loading queries", http.StatusInternalServerError)
		utils.Logger.Println(err)
		return
	}
	query := remindsJson.UpdateRemindDate

	// Get the "id" and new date from the URL query parameters
	entry_id := r.URL.Query().Get("id")
	if entry_id == "" {
		utils.Logger.Println("ID is missing")
		http.Error(w, "ID is required", http.StatusBadRequest)
		return
	}
	date := r.URL.Query().Get("date")
	if date == "" {
		utils.Logger.Println("Date is missing")
		http.Error(w, "Date is required", http.StatusBadRequest)
		return
	}

	// Convert entry_id to int
	id, err := strconv.Atoi(entry_id)
	if err != nil {
		utils.Logger.Println("Invalid ID format")
		http.Error(w, "Invalid ID format", http.StatusBadRequest)
		return
	}

	// Execute the delete query
	_, err = db.Exec(query, date, id)
	if err != nil {
		utils.Logger.Println("Error executing delete query:", err)
		http.Error(w, "Error deleting remind", http.StatusInternalServerError)
		return
	}

	// Set response headers
	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json")

	// Prepare and send the response
	response := map[string]interface{}{
		"ok": true,
	}

	// Write the response
	if err := json.NewEncoder(w).Encode(response); err != nil {
		utils.Logger.Printf("Error encoding response: %v\n", err)
		http.Error(w, "Error encoding response", http.StatusInternalServerError)
	}

}

// Update remind

func getUpdatedData(w http.ResponseWriter, r *http.Request) (date_remind, repeat, title string, message_id int, err error) {
	// Extract data
	data, err := utils.ExtractData(w, r)
	if err != nil {
		utils.Logger.Printf("Error extracting data: %v\n", err)
		http.Error(w, "Invalid input data", http.StatusBadRequest)
		return "", "", "", 0, err
	}

	requiredFields := []string{"date_remind", "repeat", "title", "message_id"}
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
		return "", "", "", 0, fmt.Errorf("%s", errMsg)
	}

	// Convert message_id to int if it's a string, float, or int
	switch v := data["message_id"].(type) {
	case int:
		message_id = v
	case string:
		var errConv error
		message_id, errConv = strconv.Atoi(v) // Convert string to int
		if errConv != nil {
			errMsg := fmt.Sprintf("Invalid message_id: %v", errConv)
			utils.Logger.Print(errMsg)
			http.Error(w, errMsg, http.StatusBadRequest)
			return "", "", "", 0, fmt.Errorf("%s", errMsg)
		}
	case float64:
		message_id = int(v) // Convert float to int
	case float32:
		message_id = int(v) // Convert float to int
	default:
		errMsg := fmt.Sprintf("message_id should be either an int, string, or float, but got %T", v)
		utils.Logger.Print(errMsg)
		http.Error(w, errMsg, http.StatusBadRequest)
		return "", "", "", 0, fmt.Errorf("%s", errMsg)
	}

	// Return the values
	return data["date_remind"].(string), data["repeat"].(string), data["title"].(string), message_id, nil
}

func UpdateRemind(w http.ResponseWriter, r *http.Request, db *sql.DB) {

	// Extract data
	date_remind, repeat, title, message_id, err := getUpdatedData(w, r)
	if err != nil {
		return
	}

	// Load Queries
	remindsJson, err := utils.LoadQueries("reminds.json")
	if err != nil {
		utils.Logger.Printf("Error loading queries: %v\n", err)
		http.Error(w, "Server error", http.StatusInternalServerError)
		return
	}

	query := remindsJson.UpdateRemind
	if query == "" {
		utils.Logger.Print("update remind query is empty")
		http.Error(w, "update remind query not found", http.StatusInternalServerError)
		return
	}

	// Execute Query
	_, err = db.Exec(query, date_remind, repeat, title, message_id)
	if err != nil {
		utils.Logger.Printf("Database execution error: %v\n", err)
		http.Error(w, "Failed to update remind", http.StatusInternalServerError)
		return
	}

	// Send Response
	response := map[string]interface{}{
		"ok":      true,
		"message": "Remind updated !",
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(response); err != nil {
		utils.Logger.Printf("Error encoding response: %v\n", err)
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
	}

}
