package handlers

import (
	"database/sql"
	"net/http"
	"server/entries"
	"server/utils"
)

func RegisterEntriesEndpoints(mux *http.ServeMux, db *sql.DB) {
	// Endpoints for tags :

	// get last message + CORS (last.go)
	mux.HandleFunc("/entries/last", utils.CorsMiddleware(func(w http.ResponseWriter, r *http.Request) {
		entries.GetLastMessage(w, r, db)
	}))

}
