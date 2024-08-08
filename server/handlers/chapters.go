package handlers

import (
	"database/sql"
	"net/http"
	"server/chapters"
	"server/utils"
)

func RegisterChaptersEndpoints(mux *http.ServeMux, db *sql.DB) {
	// Endpoints for chapters :

	// create new chapter+ CORS (insert.go)
	mux.HandleFunc("/new", utils.CorsMiddleware(func(w http.ResponseWriter, r *http.Request) {
		chapters.NewChapter(w, r, db)
	}))

}
