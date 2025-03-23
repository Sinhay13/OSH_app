package system

import (
	"database/sql"
	"net/http"
	"server/utils"
	"strconv"
	"time"
)

// 1. Check if the date is in the good format and in the form "-12-31"
// 2. compare to the current year need to n-1 only
// 3. execute the query

// Function to check if date is ok :
func checkDate(date string) bool {

	yearSuffix := "-12-31"

	currentYear := time.Now().Year()

	previousYear := currentYear - 1

	previousYearStr := strconv.Itoa(previousYear)

	expectedDate := previousYearStr + yearSuffix

	return date == expectedDate

}

// Main function to clear system
func ResetSystem(w http.ResponseWriter, r *http.Request, db *sql.DB) {

	// Get the date
	date := r.URL.Query().Get("date")
	if date == "" {
		utils.Logger.Println("Date parameter is missing in the request")
		http.Error(w, "Date is required", http.StatusBadRequest)
		return
	}

	// Check date :
	result := checkDate(date)

	if result {

		// Load queries from JSON
		systemJson, err := utils.LoadQueries("system.json")
		if err != nil {
			http.Error(w, "Error loading queries", http.StatusInternalServerError)
			utils.Logger.Printf("Failed to load queries: %v\n", err)
			return
		}
		query := systemJson.ResetSystem

		// execute the reset :
		_, err = db.Exec(query)
		if err != nil {
			utils.Logger.Printf("Failed to execute reset query: %v\n", err)
			http.Error(w, "Failed to reset system", http.StatusInternalServerError)
			return
		}

		utils.Logger.Println("System reset completed successfully")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("System reset completed successfully"))

	} else {
		utils.Logger.Printf("Invalid date provided:%s\n", date)
		http.Error(w, "Invalid date format: YYYY-12-31 (previous year)", http.StatusBadRequest)
	}
}
