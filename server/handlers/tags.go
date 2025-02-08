package handlers

import (
	"database/sql"
	"net/http"
	"server/tags"
	"server/utils"
)

func RegisterTagsEndpoints(mux *http.ServeMux, db *sql.DB) {
	// Endpoints for tags :

	// get  active tags list+ CORS (list.go)
	mux.HandleFunc("/tags/list/active", utils.CorsMiddleware(func(w http.ResponseWriter, r *http.Request) {
		tags.TagsListActive(w, r, db)
	}))

	// get  filtered active tags list+ CORS (filtered.go)
	mux.HandleFunc("/tags/list/filtered", utils.CorsMiddleware(func(w http.ResponseWriter, r *http.Request) {
		tags.GetTagsFilteredList(w, r, db)
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

	// check principles + CORS (principles.go)
	mux.HandleFunc("/tags/principles/check", utils.CorsMiddleware(func(w http.ResponseWriter, r *http.Request) {
		tags.CheckPrinciples(w, r, db)
	}))

	// update tag + CORS (update.go)
	mux.HandleFunc("/tags/update", utils.CorsMiddleware(func(w http.ResponseWriter, r *http.Request) {
		tags.UpdateTag(w, r, db)
	}))

	// checks if tags inactive + CORS (checks.go)
	mux.HandleFunc("/tags/checks/inactive", utils.CorsMiddleware(func(w http.ResponseWriter, r *http.Request) {
		tags.CheckIfTagInactive(w, r, db)
	}))

	// read comments tags inactive + CORS (comments.go)
	mux.HandleFunc("/tags/comments/read", utils.CorsMiddleware(func(w http.ResponseWriter, r *http.Request) {
		tags.ReadComments(w, r, db)
	}))

	// save comments tags inactive + CORS (comments.go)
	mux.HandleFunc("/tags/comments/save", utils.CorsMiddleware(func(w http.ResponseWriter, r *http.Request) {
		tags.SaveComments(w, r, db)
	}))

	// save comments tags inactive + CORS (system.go)
	mux.HandleFunc("/tags/system/list", utils.CorsMiddleware(func(w http.ResponseWriter, r *http.Request) {
		tags.TagSystemList(w, r, db)
	}))

	// get the system tag of a tag + CORS (system.go)
	mux.HandleFunc("/tags/system", utils.CorsMiddleware(func(w http.ResponseWriter, r *http.Request) {
		tags.TagSystemType(w, r, db)
	}))

	// get  system tags list+ CORS (list.go)
	mux.HandleFunc("/tags/list/system", utils.CorsMiddleware(func(w http.ResponseWriter, r *http.Request) {
		tags.TagsSystem(w, r, db)
	}))
}
