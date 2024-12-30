package reminds

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"server/utils"
)

// Error helper function
func handleError(w http.ResponseWriter, errMsg string, status int, err error) {
	utils.Logger.Println(errMsg, err)
	http.Error(w, errMsg, status)
}

func TakeAction(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	tag := r.URL.Query().Get("tag")
	if tag == "" {
		handleError(w, "Tag parameter is required", http.StatusBadRequest, nil)
		return
	}

	// Load queries
	chaptersJson, err := utils.LoadQueries("chapters.json")
	if err != nil {
		handleError(w, "Failed to load chapters.json", http.StatusInternalServerError, err)
		return
	}

	entriesJson, err := utils.LoadQueries("entries.json")
	if err != nil {
		handleError(w, "Failed to load entries.json", http.StatusInternalServerError, err)
		return
	}

	remindsJson, err := utils.LoadQueries("reminds.json")
	if err != nil {
		handleError(w, "Failed to load reminds.json", http.StatusInternalServerError, err)
		return
	}

	// Retrieve the last chapter
	queryChapters := chaptersJson.Get_last_chapter
	var chapterName string
	err = db.QueryRow(queryChapters).Scan(&chapterName)
	if err != nil {
		handleError(w, "Failed to retrieve the last chapter", http.StatusInternalServerError, err)
		return
	}

	// Insert message entry
	message := fmt.Sprintf("## You need to take action Samurai for the tag: %s!", tag)
	queryEntry := entriesJson.InsertNewEntry
	result, err := db.Exec(queryEntry, chapterName, "侍Reminds", utils.TimeNow(), "Oltar", "OSH", message)
	if err != nil {
		handleError(w, "Failed to insert new entry", http.StatusInternalServerError, err)
		return
	}

	// Retrieve the new entry ID
	entryID, err := result.LastInsertId()
	if err != nil {
		handleError(w, "Failed to get last insert ID", http.StatusInternalServerError, err)
		return
	}

	// Insert reminder
	remindTitle := fmt.Sprintf("Action required for the tag: %s!", tag)
	queryRemind := remindsJson.InsertRemind
	_, err = db.Exec(queryRemind, entryID, utils.DateNow(), "unique", remindTitle)
	if err != nil {
		handleError(w, "Failed to insert remind", http.StatusInternalServerError, err)
		return
	}

	// Respond with success
	response := map[string]interface{}{
		"ok":      true,
		"message": "New entry and remind added successfully",
	}
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(response); err != nil {
		handleError(w, "Error encoding response", http.StatusInternalServerError, err)
	}
}
