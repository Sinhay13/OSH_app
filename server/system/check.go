package system

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"server/utils"
)

// Response helper function
func respondJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(data); err != nil {
		utils.Logger.Printf("Error encoding response: %v\n", err)
		http.Error(w, "Error encoding response", http.StatusInternalServerError)
	}
}

// Error helper function
func handleError(w http.ResponseWriter, errMsg string, status int, err error) {
	utils.Logger.Println(errMsg, err)
	http.Error(w, errMsg, status)
}

// CheckDateTag handles counting entries by date and tag
func CheckDateTag(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	systemJson, err := utils.LoadQueries("system.json")
	if err != nil {
		handleError(w, "Error loading queries", http.StatusInternalServerError, err)
		return
	}

	date := r.URL.Query().Get("date")
	tag := r.URL.Query().Get("tag")
	if date == "" || tag == "" {
		handleError(w, "Date and Tag parameters are required", http.StatusBadRequest, nil)
		return
	}

	var count int
	err = db.QueryRow(systemJson.CountSystemEntries, date, tag).Scan(&count)
	if err != nil {
		handleError(w, "Database query failed", http.StatusInternalServerError, err)
		return
	}

	respondJSON(w, http.StatusOK, map[string]interface{}{
		"ok":    true,
		"count": count,
	})
}

// CheckActiveTag determines the status of a tag
func CheckActiveTag(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	systemJson, err := utils.LoadQueries("system.json")
	if err != nil {
		handleError(w, "Error loading queries", http.StatusInternalServerError, err)
		return
	}

	tag := r.URL.Query().Get("tag")
	if tag == "" {
		handleError(w, "Tag parameter is required", http.StatusBadRequest, nil)
		return
	}

	var result string
	err = db.QueryRow(systemJson.ActiveTagCheck, tag).Scan(&result)
	if err != nil {
		if err == sql.ErrNoRows {
			result = "green" // Default status
		} else {
			handleError(w, "Database query failed", http.StatusInternalServerError, err)
			return
		}
	}

	respondJSON(w, http.StatusOK, map[string]interface{}{
		"ok":     true,
		"result": result,
	})
}

// CheckPassiveTag counts passive tag occurrences
func CheckPassiveTag(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	systemJson, err := utils.LoadQueries("system.json")
	if err != nil {
		handleError(w, "Error loading queries", http.StatusInternalServerError, err)
		return
	}

	tag := r.URL.Query().Get("tag")
	if tag == "" {
		handleError(w, "Tag parameter is required", http.StatusBadRequest, nil)
		return
	}

	var count int
	err = db.QueryRow(systemJson.PassiveTagCheck, tag).Scan(&count)
	if err != nil {
		handleError(w, "Database query failed", http.StatusInternalServerError, err)
		return
	}

	respondJSON(w, http.StatusOK, map[string]interface{}{
		"ok":    true,
		"count": count,
	})
}
