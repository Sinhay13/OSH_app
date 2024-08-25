package tags

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"server/utils"
)

func ReadComments(w http.ResponseWriter, r *http.Request, db *sql.DB) {

	//Get Tag name
	tag := r.URL.Query().Get("tag")
	if tag == "" {
		utils.Logger.Println("Tag name is missing")
		http.Error(w, "Tag name is required", http.StatusBadRequest)
		return
	}

	// Load the JSON with queries
	tagsJson, err := utils.LoadQueries("tags.json")
	if err != nil {
		utils.Logger.Println(err)
		return
	}

	query := tagsJson.ReadComment

	var comment string
	err = db.QueryRow(query, tag).Scan(&comment)
	if err != nil {
		utils.Logger.Printf("Error to read comment: %v\n", err)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json")

	// Prepare the response
	response := map[string]interface{}{
		"ok":      true,
		"comment": comment,
	}

	// Write the response
	if err := json.NewEncoder(w).Encode(response); err != nil {
		utils.Logger.Printf("Error encoding response: %v\n", err)
		http.Error(w, "Error encoding response", http.StatusInternalServerError)
	}

}

// extract data to save :
func extractCommentAndTag(w http.ResponseWriter, r *http.Request) (string, string, error) {

	data, err := utils.ExtractData(w, r)
	if err != nil {
		utils.Logger.Print("Error extracting data: ", err)
		return "", "", err
	}

	var comment, tag string

	if val, ok := data["comment"]; ok {
		comment = fmt.Sprintf("%v", val)
	} else {
		utils.Logger.Println("comment not found in data")
		return "", "", err
	}

	if val, ok := data["tag"]; ok {
		tag = fmt.Sprintf("%v", val)
	} else {
		utils.Logger.Println("tag not found in data")
		return "", "", err
	}

	return tag, comment, nil

}

func SaveComments(w http.ResponseWriter, r *http.Request, db *sql.DB) {

	//Get data
	tag, comment, err := extractCommentAndTag(w, r)
	if err != nil {
		utils.Logger.Print("Error to extract data for saving comment: ", err)
		return
	}

	timeNow := utils.TimeNow()

	// Load the JSON with queries
	tagsJson, err := utils.LoadQueries("tags.json")
	if err != nil {
		utils.Logger.Println(err)
		return
	}

	query := tagsJson.SaveComment

	// Request SQL
	_, err = db.Exec(query, comment, timeNow, tag)
	if err != nil {
		utils.Logger.Print("Error to save comment in DB: ", err)
		return
	}

	// Prepare the response
	response := map[string]interface{}{
		"ok":      true,
		"message": " Comment Saved !",
	}
	w.Header().Set("Content-Type", "application/json")

	// Write the response
	if err := json.NewEncoder(w).Encode(response); err != nil {
		utils.Logger.Printf("Error encoding response: %v\n", err)
	}

}
