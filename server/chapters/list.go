package chapters

import (
	"database/sql"
	"encoding/json"
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
