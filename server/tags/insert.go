package tags

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"server/utils"
)

func sendTagToDB(db *sql.DB, tag string) error {

	timeNow := utils.TimeNow()

	// Load queries from JSON file
	tagsJson, err := utils.LoadQueries("tags.json")
	if err != nil {

		return err
	}

	_, err = db.Exec(tagsJson.InsertNewTag, tag, timeNow, timeNow)
	if err != nil {
		return err
	}

	return nil
}

func InsertNewTag(w http.ResponseWriter, r *http.Request, db *sql.DB) {

	tag := r.URL.Query().Get("tag")
	if tag == "" {
		utils.Logger.Println("tag name is missing to create a new tag")
		return
	}

	err := sendTagToDB(db, tag)
	if err != nil {
		utils.Logger.Printf("Error to insert new tag inside db : %v\n", err)
	}

	w.WriteHeader(http.StatusOK)

	// Prepare the response
	response := map[string]interface{}{
		"ok":      true,
		"message": " new tag added successfully",
	}
	w.Header().Set("Content-Type", "application/json")

	// Write the response
	if err := json.NewEncoder(w).Encode(response); err != nil {
		utils.Logger.Printf("Error encoding response: %v\n", err)
	}
}
