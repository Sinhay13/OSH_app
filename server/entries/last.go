package entries

import (
	"database/sql"
	"encoding/json"
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
	var message, date, country, city string

	err = db.QueryRow(query, tag).Scan(&message, &date, &country, &city)
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

	return Entries{Message: message, Date: date, Country: country, City: city}, nil
}

// Get last message before a specified date from DB
func getLastMessageBeforeDateFromDB(db *sql.DB, tag string, oldDate string) (Entries, error) {
	// Load the JSON with queries
	entriesJson, err := utils.LoadQueries("entries.json")
	if err != nil {
		return Entries{}, err
	}

	query := entriesJson.LastMessageBeforeDate

	// Prepare the query to return message, date, country, and city
	var message, date, country, city string

	err = db.QueryRow(query, tag, tag, oldDate).Scan(&message, &date, &country, &city)
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

	return Entries{Message: message, Date: date, Country: country, City: city}, nil
}

// Handler to get the last message
func GetLastMessage(w http.ResponseWriter, r *http.Request, db *sql.DB) {

	tag := r.URL.Query().Get("tag")
	if tag == "" {
		utils.Logger.Println("Tag name is missing")
		http.Error(w, "Tag name is required", http.StatusBadRequest)
		return
	}

	var entry Entries
	var err error

	oldDate := r.URL.Query().Get("date")
	if oldDate == "" {
		entry, err = getLastMessageFromDB(db, tag)
	} else {
		entry, err = getLastMessageBeforeDateFromDB(db, tag, oldDate)
	}

	if err != nil {
		utils.Logger.Print(err)
		http.Error(w, "Error retrieving last message", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)

	// Prepare the response
	response := map[string]interface{}{
		"ok":      true,
		"message": entry.Message,
		"date":    entry.Date,
		"country": entry.Country,
		"city":    entry.City,
	}
	w.Header().Set("Content-Type", "application/json")

	// Write the response
	if err := json.NewEncoder(w).Encode(response); err != nil {
		utils.Logger.Printf("Error encoding response: %v\n", err)
		http.Error(w, "Error encoding response", http.StatusInternalServerError)
	}
}
