package handlers

import (
	"database/sql"
	"net/http"
	"server/tags"
	"server/utils"
)

func RegisterTagsEndpoints(mux *http.ServeMux, db *sql.DB) {
	// Endpoints for tags :

	// get  full tags list+ CORS (list.go)
	mux.HandleFunc("/tags/list/full", utils.CorsMiddleware(func(w http.ResponseWriter, r *http.Request) {
		tags.TagsListFull(w, r, db)
	}))

	// get  active tags list+ CORS (list.go)
	mux.HandleFunc("/tags/list/active", utils.CorsMiddleware(func(w http.ResponseWriter, r *http.Request) {
		tags.TagsListActive(w, r, db)
	}))

	// get  non active tags list+ CORS (list.go)
	mux.HandleFunc("/tags/list/non", utils.CorsMiddleware(func(w http.ResponseWriter, r *http.Request) {
		tags.TagsListNon(w, r, db)
	}))

	// insert new tag + CORS (insert.go)
	mux.HandleFunc("/tags/new", utils.CorsMiddleware(func(w http.ResponseWriter, r *http.Request) {
		tags.InsertNewTag(w, r, db)
	}))

}
