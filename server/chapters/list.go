package chapters

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"server/utils"
)

// chapter struct
type Chapters struct {
	ChapterName string  `json:"chapter_name"`
	Title       *string `json:"title"`
	Opened      string  `json:"opened"`
}

func getChapters(db *sql.DB) ([]Chapters, error) {

	//Call Json
	chaptersJson, err := utils.LoadQueries("chapters.json")
	if err != nil {
		utils.Logger.Print(err)
	}

	rows, err := db.Query(chaptersJson.Select)
	if err != nil {
		utils.Logger.Print(err)
		return nil, err
	}
	defer rows.Close()

	var chapters []Chapters
	for rows.Next() {
		var chapter Chapters
		if err := rows.Scan(&chapter.ChapterName, &chapter.Title, &chapter.Opened); err != nil {
			utils.Logger.Print(err)
			return nil, err
		}
		chapters = append(chapters, chapter)

	}
	// Check for any error that might have occurred during iteration
	if err = rows.Err(); err != nil {
		utils.Logger.Print(err)
		return nil, err
	}

	return chapters, nil

}

func ListChapters(w http.ResponseWriter, r *http.Request, db *sql.DB) {

	chaptersList, err := getChapters(db)
	if err != nil {
		http.Error(w, "Server error", http.StatusInternalServerError)
		utils.Logger.Printf("Error getting tables: %v", err)
		return
	}

	// Define Content-Type
	w.Header().Set("Content-Type", "application/json")

	err = json.NewEncoder(w).Encode(chaptersList)
	if err != nil {
		http.Error(w, "Error encoding JSON", http.StatusInternalServerError)
		utils.Logger.Printf("Error encoding JSON: %v", err)
	}

}

// GetChaptersNameList retrieves the list of chapter names from the database and writes to the HTTP response
func GetChaptersNameList(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	// Load the SQL queries from chapters.json
	queries, err := utils.LoadQueries("chapters.json")
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to load queries: %v", err), http.StatusInternalServerError)
		return
	}

	// Execute the query
	rows, err := db.Query(queries.Get_list_chapters)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to execute query: %v", err), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	// Create slice to store chapter names
	var chapters []string

	// Iterate through the results
	for rows.Next() {
		var chapterName string
		if err := rows.Scan(&chapterName); err != nil {
			http.Error(w, fmt.Sprintf("Failed to scan row: %v", err), http.StatusInternalServerError)
			return
		}
		chapters = append(chapters, chapterName)
	}

	if err = rows.Err(); err != nil {
		http.Error(w, fmt.Sprintf("Error during rows iteration: %v", err), http.StatusInternalServerError)
		return
	}

	// Define Content-Type and write JSON response
	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(chapters)
	if err != nil {
		http.Error(w, "Error encoding JSON", http.StatusInternalServerError)
		utils.Logger.Printf("Error encoding JSON: %v", err)
		return
	}
}
