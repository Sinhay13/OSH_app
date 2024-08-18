package entries

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"server/utils"
)

// Entries struct
type Entries struct {
	Message string `json:"message"`
	Date    string `json:"date"`
	Country string `json:"country"`
	City    string `json:"city"`
}

// Get last message from DB
func getLastMessageFromDB(db *sql.DB, tag string) (Entries, error) {
	// Load the JSON with queries
	entriesJson, err := utils.LoadQueries("entries.json")
	if err != nil {
		return Entries{}, err
	}

	query := entriesJson.LastMessage

	// Prepare the query to return message, date, country, and city
	var entry Entries

	err = db.QueryRow(query, tag).Scan(&entry.Message, &entry.Date, &entry.Country, &entry.City)
	if err != nil {
		if err == sql.ErrNoRows {
			// No rows found, return default values
			return Entries{
				Message: "No previous message",
				Date:    "?",
				Country: "?",
				City:    "?",
			}, nil
		}
		// Some other error
		return Entries{}, err
	}

	return entry, nil
}

// Get last or next message relative to a specified date from DB
func getMessageRelativeToDateFromDB(db *sql.DB, tag, date, action string) (Entries, error) {
	// Load the JSON with queries
	entriesJson, err := utils.LoadQueries("entries.json")
	if err != nil {
		return Entries{}, err
	}

	// Define a map for query selection
	queries := map[string]string{
		"previous": entriesJson.LastMessageBeforeDate,
		"next":     entriesJson.NextMessageAfterDate,
	}

	// Select the appropriate query
	query, ok := queries[action]
	if !ok {
		return Entries{}, fmt.Errorf("invalid action: %s", action)
	}

	// Execute the query
	var entry Entries
	err = db.QueryRow(query, tag, date).Scan(&entry.Message, &entry.Date, &entry.Country, &entry.City)
	if err != nil {
		if err == sql.ErrNoRows {
			// No rows found, return default values
			return Entries{
				Message: "No message",
				Date:    "?",
				Country: "?",
				City:    "?",
			}, nil
		}
		// Some other error
		return Entries{}, err
	}

	return entry, nil
}

// Handler to get the last or next message
func GetLastMessage(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	tag := r.URL.Query().Get("tag")
	if tag == "" {
		utils.Logger.Println("Tag name is missing")
		http.Error(w, "Tag name is required", http.StatusBadRequest)
		return
	}

	var entry Entries
	var err error

	date := r.URL.Query().Get("date")
	action := r.URL.Query().Get("action")

	if date == "" {
		entry, err = getLastMessageFromDB(db, tag)
	} else {
		if action == "" {
			utils.Logger.Println("Action type is missing")
			http.Error(w, "Action type is required", http.StatusBadRequest)
			return
		}
		entry, err = getMessageRelativeToDateFromDB(db, tag, date, action)
	}

	if err != nil {
		utils.Logger.Print(err)
		http.Error(w, "Error retrieving message", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json")

	// Prepare the response
	response := map[string]interface{}{
		"ok":      true,
		"message": entry.Message,
		"date":    entry.Date,
		"country": entry.Country,
		"city":    entry.City,
	}

	// Write the response
	if err := json.NewEncoder(w).Encode(response); err != nil {
		utils.Logger.Printf("Error encoding response: %v\n", err)
		http.Error(w, "Error encoding response", http.StatusInternalServerError)
	}
}
