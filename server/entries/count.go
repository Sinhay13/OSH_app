package entries

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"server/utils"
)

// count all entries
func countAllEntries(db *sql.DB, query string) (int, error) {

	var nb int
	err := db.QueryRow(query).Scan(&nb)
	if err != nil {
		return 0, err
	}
	return nb, nil

}

// count entries per chapter
func countEntriesPerChapter(db *sql.DB, query string, chapterName string) (int, error) {

	var nb int
	err := db.QueryRow(query, chapterName).Scan(&nb)
	if err != nil {
		return 0, err
	}
	return nb, nil
}

// Handler
func CountEntries(w http.ResponseWriter, r *http.Request, db *sql.DB) {

	// init variables
	var query string
	var nb int
	var err error

	// call json
	entriesJson, err := utils.LoadQueries("entries.json")
	if err != nil {
		http.Error(w, "Error loading queries", http.StatusInternalServerError)
		utils.Logger.Println(err)
	}

	// check if the url content ChapterName
	chapterName := r.URL.Query().Get("name")
	if chapterName == "" {
		query = entriesJson.CountAllEntries

		nb, err = countAllEntries(db, query)
		if err != nil {
			http.Error(w, "Error counting all entries", http.StatusInternalServerError)
			utils.Logger.Print(err)
			return
		}
	} else {
		query = entriesJson.CountEntriesPerChapter
		nb, err = countEntriesPerChapter(db, query, chapterName)
		if err != nil {
			http.Error(w, "Error counting entries per chapter", http.StatusInternalServerError)
			utils.Logger.Print(err)
			return
		}
	}

	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json")

	// Prepare the response
	response := map[string]interface{}{
		"ok":    true,
		"count": nb,
	}

	// Write the response
	if err := json.NewEncoder(w).Encode(response); err != nil {
		utils.Logger.Printf("Error encoding response: %v\n", err)
		http.Error(w, "Error encoding response", http.StatusInternalServerError)
	}

}
