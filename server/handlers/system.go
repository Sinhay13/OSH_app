package handlers

import (
	"database/sql"
	"net/http"
	"server/system"
	"server/utils"
)

func RegisterSystemEndpoints(mux *http.ServeMux, db *sql.DB) {
	// Endpoints for system :

	// check date and tag + CORS (check.go)
	mux.HandleFunc("/system/list/check", utils.CorsMiddleware(func(w http.ResponseWriter, r *http.Request) {
		system.CheckDateTag(w, r, db)
	}))
}
