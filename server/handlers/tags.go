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

	// get  filtered active tags list+ CORS (filtered.go)
	mux.HandleFunc("/tags/list/filtered", utils.CorsMiddleware(func(w http.ResponseWriter, r *http.Request) {
		tags.GetTagsEnabledFilteredList(w, r, db)
	}))

	// get  principles + CORS (principles.go)
	mux.HandleFunc("/tags/principles", utils.CorsMiddleware(func(w http.ResponseWriter, r *http.Request) {
		tags.TagsPrinciples(w, r, db)
	}))

	// insert new tag + CORS (insert.go)
	mux.HandleFunc("/tags/new", utils.CorsMiddleware(func(w http.ResponseWriter, r *http.Request) {
		tags.InsertNewTag(w, r, db)
	}))

	// count tags + CORS (count.go)
	mux.HandleFunc("/tags/count", utils.CorsMiddleware(func(w http.ResponseWriter, r *http.Request) {
		tags.CountTags(w, r, db)
	}))

}
