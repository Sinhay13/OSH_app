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

	// get list of chapter + CORS (list.go)
	mux.HandleFunc("/chapters/list", utils.CorsMiddleware(func(w http.ResponseWriter, r *http.Request) {
		chapters.ListChapters(w, r, db)
	}))

	// check if chapter exists + CORS (checks.go)
	mux.HandleFunc("/chapters/check", utils.CorsMiddleware(func(w http.ResponseWriter, r *http.Request) {
		chapters.CheckChapter(w, r, db)
	}))

	// chapter name list (list.go)
	mux.HandleFunc("/chapters/list/names", utils.CorsMiddleware(func(w http.ResponseWriter, r *http.Request) {
		chapters.GetChaptersNameList(w, r, db)
	}))

	// get chapter title (list.go)
	mux.HandleFunc("/chapters/title", utils.CorsMiddleware(func(w http.ResponseWriter, r *http.Request) {
		chapters.GetChapterTitle(w, r, db)
	}))

}
