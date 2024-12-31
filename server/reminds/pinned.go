package reminds

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"server/utils"
)

type PinnedReminds struct {
	EntryID     int    `json:"entry_id"`
	RemindDate  string `json:"remind_date"`
	Repeat      string `json:"repeat"`
	RemindTitle string `json:"remind_title"`
}

func GetPinnedReminds(w http.ResponseWriter, r *http.Request, db *sql.DB) {

	remindsJson, err := utils.LoadQueries("reminds.json")
	if err != nil {
		http.Error(w, "Failed to load queries", http.StatusInternalServerError)
		utils.Logger.Println("Failed to load queries:", err)
		return
	}

	query := remindsJson.GetPinnedReminds

	rows, err := db.Query(query)
	if err != nil {
		http.Error(w, "Error executing SQL query", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var reminds []PinnedReminds
	for rows.Next() {
		var remind PinnedReminds
		if err := rows.Scan(&remind.EntryID, &remind.RemindDate, &remind.Repeat, &remind.RemindTitle); err != nil {
			http.Error(w, "Error scanning row", http.StatusInternalServerError)
			return
		}
		reminds = append(reminds, remind)
	}

	if err := rows.Err(); err != nil {
		http.Error(w, "Error iterating over rows", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(reminds)

}
