package tags

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"server/utils"
)

func sendTagToDB(db *sql.DB, principle string, tag string) error {

	timeNow := utils.TimeNow()

	// Load queries from JSON file
	tagsJson, err := utils.LoadQueries("tags.json")
	if err != nil {

		return err
	}
	if principle == "all" || principle == "none" {
		query := tagsJson.InsertNewTag
		_, err = db.Exec(query, tag, timeNow, timeNow)
		if err != nil {
			return err
		}
	} else {
		query := tagsJson.InsertNewTagPrinciple
		_, err = db.Exec(query, tag, timeNow, timeNow, principle)
		if err != nil {
			return err
		}
	}
	return nil
}

func InsertNewTag(w http.ResponseWriter, r *http.Request, db *sql.DB) {

	principle := r.URL.Query().Get("principle")
	if principle == "" {
		utils.Logger.Println("principle name is missing to create a new tag")
		return
	}

	tag := r.URL.Query().Get("tag")
	if tag == "" {
		utils.Logger.Println("tag name is missing to create a new tag")
		return
	}

	err := sendTagToDB(db, principle, tag)
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
