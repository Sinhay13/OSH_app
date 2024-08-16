package entries

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"server/utils"
)

func getLastMessageFromDB(db *sql.DB, tag string) (string, error) {
	// Load the JSON with queries
	entriesJson, err := utils.LoadQueries("entries.json")
	if err != nil {
		return "", err
	}

	query := entriesJson.LastMessage

	// Execute the query
	var message string
	err = db.QueryRow(query, tag).Scan(&message)
	if err != nil {
		if err == sql.ErrNoRows {
			// No rows found
			return "No previous message", nil
		}
		// Some other error
		return "", err
	}

	return message, nil
}

func GetLastMessage(w http.ResponseWriter, r *http.Request, db *sql.DB) {

	tag := r.URL.Query().Get("tag")
	if tag == "" {
		utils.Logger.Println("tag name is missing to create a new tag")
		return
	}

	message, err := getLastMessageFromDB(db, tag)
	if err != nil {
		utils.Logger.Print(err)
		return
	}

	w.WriteHeader(http.StatusOK)

	// Prepare the response
	response := map[string]interface{}{
		"ok":      true,
		"message": message,
	}
	w.Header().Set("Content-Type", "application/json")

	// Write the response
	if err := json.NewEncoder(w).Encode(response); err != nil {
		utils.Logger.Printf("Error encoding response: %v\n", err)
	}

}
