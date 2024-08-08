package chapters

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"server/utils"
	"strings"
)

// countRows function takes a database connection and counts the number of rows in the 'chapters' table.
func countRows(db *sql.DB) (int, error) {
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

// Create new tableName:
func createTableName(count int) (string, error) {
	var tableName string

	if count == 0 {
		tableName = "chapter_0"
	} else {
		number := count - 1
		tableName = fmt.Sprintf("chapter_%d", number)
	}

	return tableName, nil
}

// Prepare and execute new sql query to create new chapter
func prepareAndRunQuery(tableName string, db *sql.DB) error {

	// Load queries from JSON file
	chaptersSchemaJson, err := utils.LoadQueries("chapter_model.json")
	if err != nil {
		return err
	}

	// Replace {table_name} with the actual tableName
	query := chaptersSchemaJson.Chapter_model
	query = strings.Replace(query, "{table_name}", tableName, -1)

	// Run the query
	_, err = db.Exec(query)
	if err != nil {
		return err
	}

	return nil
}

// insert tableName inside chapters
func insertTableNameInsideChapters(tableName string, db *sql.DB) error {
	// Load queries from JSON file
	chaptersJson, err := utils.LoadQueries("chapters.json")
	if err != nil {

		return err
	}

	// Execute the insert query
	_, err = db.Exec(chaptersJson.Insert_chapters, tableName)
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
	var tableName string
	err = db.QueryRow(chaptersJson.Get_last_chapter).Scan(&tableName)
	if err != nil {
		return err
	}

	// update with title
	_, err = db.Exec(chaptersJson.Title_chapters, title)
	if err != nil {
		return err
	}

	return nil
}

func NewChapter(w http.ResponseWriter, r *http.Request, db *sql.DB) {

	// count row inside chapters table
	count, err := countRows(db)
	if err != nil {
		utils.Logger.Print(err)
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
			utils.Logger.Print(err)
			return
		}
	}

	// create new tableName
	tableName, err := createTableName(count)
	if err != nil {
		utils.Logger.Print(err)
		return
	}

	// create new chapter table
	err = prepareAndRunQuery(tableName, db)
	if err != nil {
		utils.Logger.Print(err)
		return
	}

	// insert ne chapter inside chapters
	err = insertTableNameInsideChapters(tableName, db)
	if err != nil {
		utils.Logger.Print(err)
		return
	}

	w.WriteHeader(http.StatusOK)

	// Prepare the response
	response := map[string]interface{}{
		"ok":      true,
		"message": " new chapter created successfully",
	}
	w.Header().Set("Content-Type", "application/json")

	// write the response
	json.NewEncoder(w).Encode(response)
}
