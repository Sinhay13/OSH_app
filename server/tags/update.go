package tags

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"server/utils"
	"strconv"
)

func extractDataToUpdate(w http.ResponseWriter, r *http.Request) (int, int, string, string, error) {

	data, err := utils.ExtractData(w, r)
	if err != nil {
		utils.Logger.Print("Error extracting data: ", err)
		return 0, 0, "", "", err
	}

	var isSystem, isPrinciple int
	var principleTag, tag string

	if val, ok := data["is_system"]; ok {
		isSystem, err = strconv.Atoi(fmt.Sprintf("%v", val))
		if err != nil {
			utils.Logger.Print("Error converting isSystem to int: ", err)
			return 0, 0, "", "", err
		}
	} else {
		utils.Logger.Println("isSystem not found in data")
		return 0, 0, "", "", err
	}

	if val, ok := data["is_principle"]; ok {
		isPrinciple, err = strconv.Atoi(fmt.Sprintf("%v", val))
		if err != nil {
			utils.Logger.Print("Error converting isPrinciple to int: ", err)
			return 0, 0, "", "", err
		}
	} else {
		utils.Logger.Println("isPrinciple not found in data")
		return 0, 0, "", "", err
	}

	if val, ok := data["principle_tag"]; ok {
		principleTag = fmt.Sprintf("%v", val)
	} else {
		utils.Logger.Println("principle not found in data")
		return 0, 0, "", "", err
	}

	if val, ok := data["tag"]; ok {
		tag = fmt.Sprintf("%v", val)
	} else {
		utils.Logger.Println("tag not found in data")
		return 0, 0, "", "", err
	}

	return isSystem, isPrinciple, principleTag, tag, nil

}

func updateTagSQL(db *sql.DB, isSystem int, isPrinciple int, principleTag string, tag string) error {

	tagsJson, err := utils.LoadQueries("tags.json")
	if err != nil {
		return err
	}

	query := tagsJson.UpdateTag

	timeNow := utils.TimeNow()

	_, err = db.Exec(query, isPrinciple, isSystem, sql.NullString{
		String: principleTag,
		Valid:  principleTag != "none",
	}, timeNow, tag)
	if err != nil {
		return err
	}
	return nil
}

func UpdateTag(w http.ResponseWriter, r *http.Request, db *sql.DB) {

	isSystem, isPrinciple, principleTag, tag, err := extractDataToUpdate(w, r)
	if err != nil {
		return
	}

	err = updateTagSQL(db, isSystem, isPrinciple, principleTag, tag)
	if err != nil {
		utils.Logger.Printf("Error to update tag in SQL : %v\n", err)
	}

	// Prepare the response
	response := map[string]interface{}{
		"ok":      true,
		"message": " Tag updated !",
	}
	w.Header().Set("Content-Type", "application/json")

	// Write the response
	if err := json.NewEncoder(w).Encode(response); err != nil {
		utils.Logger.Printf("Error encoding response: %v\n", err)
	}

}