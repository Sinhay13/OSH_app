package tags

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"server/utils"
	"strconv"
)

func extractDataToUpdate(w http.ResponseWriter, r *http.Request) (int, int, int, string, string, string, error) {

	data, err := utils.ExtractData(w, r)
	if err != nil {
		utils.Logger.Print("Error extracting data: ", err)
		return 0, 0, 0, "", "", "", err
	}

	var active, isSystem, isPrinciple int
	var principleTag, tag, system_type string

	if val, ok := data["active"]; ok {
		active, err = strconv.Atoi(fmt.Sprintf("%v", val))
		if err != nil {
			utils.Logger.Print("Error converting active to int: ", err)
			return 0, 0, 0, "", "", "", err
		}
	} else {
		utils.Logger.Println("isSystem not found in data")
		return 0, 0, 0, "", "", "", err
	}

	if val, ok := data["is_system"]; ok {
		isSystem, err = strconv.Atoi(fmt.Sprintf("%v", val))
		if err != nil {
			utils.Logger.Print("Error converting isSystem to int: ", err)
			return 0, 0, 0, "", "", "", err
		}
	} else {
		utils.Logger.Println("isSystem not found in data")
		return 0, 0, 0, "", "", "", err
	}

	if val, ok := data["is_principle"]; ok {
		isPrinciple, err = strconv.Atoi(fmt.Sprintf("%v", val))
		if err != nil {
			utils.Logger.Print("Error converting isPrinciple to int: ", err)
			return 0, 0, 0, "", "", "", err
		}
	} else {
		utils.Logger.Println("isPrinciple not found in data")
		return 0, 0, 0, "", "", "", err
	}

	if val, ok := data["principle_tag"]; ok {
		principleTag = fmt.Sprintf("%v", val)
	} else {
		utils.Logger.Println("principle not found in data")
		return 0, 0, 0, "", "", "", err
	}

	if val, ok := data["tag"]; ok {
		tag = fmt.Sprintf("%v", val)
	} else {
		utils.Logger.Println("tag not found in data")
		return 0, 0, 0, "", "", "", err
	}

	if val, ok := data["system_type"]; ok {
		system_type = fmt.Sprintf("%v", val)
	} else {
		utils.Logger.Println("system type not found in data")
		return 0, 0, 0, "", "", "", err
	}

	return active, isSystem, isPrinciple, principleTag, tag, system_type, nil

}

func updateTagSQL(db *sql.DB, active int, isSystem int, isPrinciple int, principleTag string, tag string, system_type string) error {

	tagsJson, err := utils.LoadQueries("tags.json")
	if err != nil {
		return err
	}

	query := tagsJson.UpdateTag

	timeNow := utils.TimeNow()

	_, err = db.Exec(query, active, isPrinciple, isSystem, sql.NullString{
		String: principleTag,
		Valid:  principleTag != "none",
	}, timeNow, system_type, tag)
	if err != nil {
		return err
	}
	return nil
}

func UpdateTag(w http.ResponseWriter, r *http.Request, db *sql.DB) {

	active, isSystem, isPrinciple, principleTag, tag, system_type, err := extractDataToUpdate(w, r)
	if err != nil {
		return
	}

	err = updateTagSQL(db, active, isSystem, isPrinciple, principleTag, tag, system_type)
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
