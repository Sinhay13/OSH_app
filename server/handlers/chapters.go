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
	mux.HandleFunc("/chapters/new", utils.CorsMiddleware(func(w http.ResponseWriter, r *http.Request) {
		chapters.NewChapter(w, r, db)
	}))

	// check is first chapter+ CORS (checks.go)
	mux.HandleFunc("/chapters/first", utils.CorsMiddleware(func(w http.ResponseWriter, r *http.Request) {
		chapters.IsFirstChapter(w, r, db)
	}))

	// check is one year ago+ CORS (checks.go)
	mux.HandleFunc("/chapters/year", utils.CorsMiddleware(func(w http.ResponseWriter, r *http.Request) {
		chapters.IsOneYearAgo(w, r, db)
	}))

}