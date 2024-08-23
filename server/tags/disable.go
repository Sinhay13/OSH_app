package tags

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"server/utils"
)

func DisableTag(w http.ResponseWriter, r *http.Request, db *sql.DB) {

	tagsJson, err := utils.LoadQueries("tags.json")
	if err != nil {
		utils.Logger.Printf("Error loading queries: %v\n", err)
		return
	}

	tag := r.URL.Query().Get("tag")
	if tag == "" {
		utils.Logger.Println("Tag name is needed")
		return
	}

	timeNow := utils.TimeNow()

	query := tagsJson.DisableTag

	_, err = db.Exec(query, timeNow, tag)
	if err != nil {
		utils.Logger.Printf("Error to disable tag : %v\n", err)
		return
	}

	w.WriteHeader(http.StatusOK)

	// Prepare the response
	response := map[string]interface{}{
		"ok":      true,
		"message": "Tag disabled successfully",
	}
	w.Header().Set("Content-Type", "application/json")

	// Write the response
	if err := json.NewEncoder(w).Encode(response); err != nil {
		utils.Logger.Printf("Error encoding response: %v\n", err)
	}

}
