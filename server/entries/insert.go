package entries

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"server/utils"
)

func getDataForNewEntry(w http.ResponseWriter, r *http.Request) (tag string, city string, country string, message string, date string, err error) {

	// extract data
	data, err := utils.ExtractData(w, r)
	if err != nil {
		utils.Logger.Print("Error extracting data: ", err)
		return "", "", "", "", "", err
	}

	if one, ok := data["tag"].(string); ok {
		tag = one
	} else {
		utils.Logger.Print("Tag not found")
		return "", "", "", "", "", fmt.Errorf("tag not found")
	}

	if two, ok := data["city"].(string); ok {
		city = two
	} else {
		utils.Logger.Print("City not found")
		return "", "", "", "", "", fmt.Errorf("city not found")
	}

	if three, ok := data["country"].(string); ok {
		country = three
	} else {
		utils.Logger.Print("Country not found")
		return "", "", "", "", "", fmt.Errorf("country not found")
	}

	if four, ok := data["message"].(string); ok {
		message = four
	} else {
		utils.Logger.Print("Message not found")
		return "", "", "", "", "", fmt.Errorf("message not found")
	}

	if five, ok := data["date"].(string); ok {
		date = five
	} else {
		utils.Logger.Print("Date not found")
		return "", "", "", "", "", fmt.Errorf("date not found")
	}

	return tag, city, country, message, date, nil
}

// send data to the DB
func sendDataToTheDB(db *sql.DB, tag string, city string, country string, message string, date string) error {

	// get last chapter name :
	chaptersJson, err := utils.LoadQueries("chapters.json")
	if err != nil {
		return err
	}
	var chapterName string
	err = db.QueryRow(chaptersJson.Get_last_chapter).Scan(&chapterName)
	if err != nil {
		return err
	}

	//insert new entry :
	entriesJson, err := utils.LoadQueries("entries.json")
	if err != nil {
		return err
	}
	_, err = db.Exec(entriesJson.InsertNewEntry, chapterName, tag, date, country, city, message)
	if err != nil {
		return err
	}
	return nil

}

func InsertNewEntry(w http.ResponseWriter, r *http.Request, db *sql.DB) {

	// Call getDataForNewEntry to extract data
	tag, city, country, message, date, err := getDataForNewEntry(w, r)
	if err != nil {
		// Error already logged and returned in getDataForNewEntry
		return
	}

	// send new entry :
	err = sendDataToTheDB(db, tag, city, country, message, date)
	if err != nil {
		utils.Logger.Printf("Error to insert new entry inside db : %v\n", err)
		return
	}

	w.WriteHeader(http.StatusOK)

	// Prepare the response
	response := map[string]interface{}{
		"ok":      true,
		"message": " new entry added successfully",
	}
	w.Header().Set("Content-Type", "application/json")

	// Write the response
	if err := json.NewEncoder(w).Encode(response); err != nil {
		utils.Logger.Printf("Error encoding response: %v\n", err)
	}

}
