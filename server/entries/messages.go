package entries

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"server/utils"
	"strconv"
)

// Entries in function of id struct
type EntriesID struct {
	Message string `json:"message"`
	Date    string `json:"date"`
	Country string `json:"country"`
	City    string `json:"city"`
	EntryID int    `Json:"entry_id"`
}

func GetMessageFromID(w http.ResponseWriter, r *http.Request, db *sql.DB) {

	// Get data
	entryID := r.URL.Query().Get("id")
	if entryID == "" {
		utils.Logger.Println("entry_id is missing")
		http.Error(w, "entry_id is missing", http.StatusBadRequest)
		return
	}

	// Convert string to int
	entryIdInt, err := strconv.Atoi(entryID)
	if err != nil {
		utils.Logger.Println("Error converting entry_id to int:", err)
		http.Error(w, "Invalid entry_id", http.StatusBadRequest)
		return
	}

	// Load the JSON with queries
	entriesJson, err := utils.LoadQueries("entries.json")
	if err != nil {
		utils.Logger.Println("Error loading queries:", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	// Prepare query
	query := entriesJson.GetMessageFromID

	// Request SQL
	var entry EntriesID
	err = db.QueryRow(query, entryIdInt).Scan(&entry.Message, &entry.Date, &entry.Country, &entry.City, &entry.EntryID)
	if err != nil {
		utils.Logger.Println("Error getting message from ID:", err)
		http.Error(w, "Message not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	// Prepare the response
	response := map[string]interface{}{
		"ok":      true,
		"message": entry.Message,
		"date":    entry.Date,
		"country": entry.Country,
		"city":    entry.City,
		"entryID": entry.EntryID,
	}

	// Write the response
	if err := json.NewEncoder(w).Encode(response); err != nil {
		utils.Logger.Printf("Error encoding response: %v\n", err)
		http.Error(w, "Error encoding response", http.StatusInternalServerError)
	}
}

// Message List struct
type MessagesList struct {
	EntryID     int    `json:"entry_id"`
	ChapterName string `json:"chapter_name"`
	City        string `json:"city"`
	Country     string `json:"country"`
	Date        string `json:"date"`
}

func GetMessagesList(w http.ResponseWriter, r *http.Request, db *sql.DB) {

	// Get data
	tag := r.URL.Query().Get("tag")
	if tag == "" {
		utils.Logger.Println("tag is missing")
		http.Error(w, "tag is missing", http.StatusBadRequest)
		return
	}

	page := r.URL.Query().Get("page")
	if page == "" {
		utils.Logger.Println("page is missing")
		http.Error(w, "page is missing", http.StatusBadRequest)
		return
	}

	// Convert page to int
	pageNumber, err := strconv.Atoi(page)
	if err != nil {
		utils.Logger.Println("Error converting page to int:", err)
		http.Error(w, "Invalid page number", http.StatusBadRequest)
		return
	}
	offset := (pageNumber - 1) * 5 // Adjust this if you have a different limit per page

	// Load the JSON with queries
	entriesJson, err := utils.LoadQueries("entries.json")
	if err != nil {
		utils.Logger.Println("Error loading queries:", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	// Execute the query
	rows, err := db.Query(entriesJson.GetMessagesList, tag, offset)
	if err != nil {
		utils.Logger.Println("Error executing query:", err)
		http.Error(w, "Error executing query", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	// Process the results
	var messagesList []MessagesList
	for rows.Next() {
		var messageList MessagesList
		if err := rows.Scan(&messageList.EntryID, &messageList.ChapterName, &messageList.City, &messageList.Country, &messageList.Date); err != nil {
			utils.Logger.Println("Error scanning rows:", err)
			http.Error(w, "Error processing results", http.StatusInternalServerError)
			return
		}
		messagesList = append(messagesList, messageList)
	}

	// Check for errors from iterating over rows
	if err := rows.Err(); err != nil {
		utils.Logger.Println("Error iterating rows:", err)
		http.Error(w, "Error processing results", http.StatusInternalServerError)
		return
	}

	// Define Content-Type
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	// Encode the response
	err = json.NewEncoder(w).Encode(messagesList)
	if err != nil {
		utils.Logger.Printf("Error encoding JSON: %v", err)
		http.Error(w, "Error encoding JSON", http.StatusInternalServerError)
	}
}
