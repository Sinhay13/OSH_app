package reminds

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"server/utils"
	"strconv"
)

func getDataToUpdateReminds(w http.ResponseWriter, r *http.Request) (remind_date, repeat, remind_title string, entry_id int, err error) {
	// Extract data
	data, err := utils.ExtractData(w, r)
	if err != nil {
		utils.Logger.Printf("Error extracting data: %v\n", err)
		http.Error(w, "Invalid input data", http.StatusBadRequest)
		return "", "", "", 0, err
	}

	requiredFields := []string{"remind_date", "repeat", "remind_title", "entry_id"}
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

	// Convert entry_id to int if it's a string, float, or int
	switch v := data["entry_id"].(type) {
	case int:
		entry_id = v
	case string:
		var errConv error
		entry_id, errConv = strconv.Atoi(v) // Convert string to int
		if errConv != nil {
			errMsg := fmt.Sprintf("Invalid entry_id: %v", errConv)
			utils.Logger.Print(errMsg)
			http.Error(w, errMsg, http.StatusBadRequest)
			return "", "", "", 0, fmt.Errorf("%s", errMsg)
		}
	case float64:
		entry_id = int(v) // Convert float to int
	case float32:
		entry_id = int(v) // Convert float to int
	default:
		errMsg := fmt.Sprintf("entry_id should be either an int, string, or float, but got %T", v)
		utils.Logger.Print(errMsg)
		http.Error(w, errMsg, http.StatusBadRequest)
		return "", "", "", 0, fmt.Errorf("%s", errMsg)
	}

	// Return the values
	return data["remind_date"].(string), data["repeat"].(string), data["remind_title"].(string), entry_id, nil
}

func InsertNewRemind(w http.ResponseWriter, r *http.Request, db *sql.DB) {

	// Extract data
	remind_date, repeat, remind_title, entry_id, err := getDataToUpdateReminds(w, r)
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

	query := remindsJson.InsertRemind
	if query == "" {
		utils.Logger.Print("insert remind query is empty")
		http.Error(w, "Insert remind query not found", http.StatusInternalServerError)
		return
	}

	// Execute Query
	_, err = db.Exec(query, entry_id, remind_date, repeat, remind_title)
	if err != nil {
		utils.Logger.Printf("Database execution error: %v\n", err)
		http.Error(w, "Failed to add new remind", http.StatusInternalServerError)
		return
	}

	// Send Response
	response := map[string]interface{}{
		"ok":      true,
		"message": "Remind Added !",
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(response); err != nil {
		utils.Logger.Printf("Error encoding response: %v\n", err)
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
	}

}
