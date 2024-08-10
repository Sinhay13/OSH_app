package chapters

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"server/utils"
)

// countRows function takes a database connection and counts the number of rows in the 'chapters' table.
func CountRows(db *sql.DB) (int, error) {
	var count int

	// Load queries from JSON file
	chaptersJson, err := utils.LoadQueries("chapters.json")
	if err != nil {
		return 0, err
	}

	// Execute the count query
	err = db.QueryRow(chaptersJson.Count).Scan(&count)
	if err != nil {
		return 0, err
	}

	return count, nil
}

// Create new chapterName:
func createChapterName(count int) (string, error) {
	var chapterName string

	if count == 0 {
		chapterName = "chapter_0"
	} else {
		chapterName = fmt.Sprintf("chapter_%d", count)
	}

	return chapterName, nil
}

// insert chapterName inside chapters
func insertChapterNameInsideChapters(chapterName string, db *sql.DB) error {
	// Load queries from JSON file
	chaptersJson, err := utils.LoadQueries("chapters.json")
	if err != nil {

		return err
	}

	// get date:
	opened := utils.DateNow()

	// Execute the insert query
	_, err = db.Exec(chaptersJson.Insert_chapters, chapterName, opened)
	if err != nil {
		return err
	}

	return nil
}

// insert title inside the last chapter
func insertTitle(title string, db *sql.DB) error {

	// Load queries from JSON file
	chaptersJson, err := utils.LoadQueries("chapters.json")
	if err != nil {

		return err
	}

	// get the last chapter
	var chapterName string
	err = db.QueryRow(chaptersJson.Get_last_chapter).Scan(&chapterName)
	if err != nil {
		return err
	}

	// update with title
	_, err = db.Exec(chaptersJson.Title_chapters, title, chapterName)
	if err != nil {
		return err
	}

	return nil
}

func NewChapter(w http.ResponseWriter, r *http.Request, db *sql.DB) {

	// count row inside chapters table
	count, err := CountRows(db)
	if err != nil {
		utils.Logger.Printf("countRows newChapter : %v\n", err)
		return
	}

	// if not first chapter add a title in the previous chapter
	if count != 0 {
		title := r.URL.Query().Get("title")
		if title == "" {
			utils.Logger.Println("title is missing to create a new chapter")
			return
		}

		err = insertTitle(title, db)
		if err != nil {
			utils.Logger.Printf("title newChapter : %v\n", err)
			return
		}
	}

	// create new chapterName
	chapterName, err := createChapterName(count)
	if err != nil {
		utils.Logger.Printf("createChapterName newChapter : %v\n", err)
		return
	}

	// insert ne chapter inside chapters
	err = insertChapterNameInsideChapters(chapterName, db)
	if err != nil {
		utils.Logger.Printf("insertChapterNameInsideChapters newChapter : %v\n", err)
		return
	}

	w.WriteHeader(http.StatusOK)

	// Prepare the response
	response := map[string]interface{}{
		"ok":      true,
		"message": " new chapter created successfully",
	}
	w.Header().Set("Content-Type", "application/json")

	// Write the response
	if err := json.NewEncoder(w).Encode(response); err != nil {
		utils.Logger.Printf("Error encoding response: %v\n", err)
	}
}
