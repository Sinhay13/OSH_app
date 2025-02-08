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

	// check active tag + CORS (check.go)
	mux.HandleFunc("/system/check/active", utils.CorsMiddleware(func(w http.ResponseWriter, r *http.Request) {
		system.CheckActiveTag(w, r, db)
	}))

	// check passive tag + CORS (check.go)
	mux.HandleFunc("/system/check/passive", utils.CorsMiddleware(func(w http.ResponseWriter, r *http.Request) {
		system.CheckPassiveTag(w, r, db)
	}))

	// insert new entry in system + CORS (check.go)
	mux.HandleFunc("/system/insert", utils.CorsMiddleware(func(w http.ResponseWriter, r *http.Request) {
		system.UpdateSystem(w, r, db)
	}))

	// get previous results + CORS (select.go)
	mux.HandleFunc("/system/select", utils.CorsMiddleware(func(w http.ResponseWriter, r *http.Request) {
		system.GetPreviousResults(w, r, db)
	}))

	// get last date in system + CORS (last.go)
	mux.HandleFunc("/system/last", utils.CorsMiddleware(func(w http.ResponseWriter, r *http.Request) {
		system.GetLastDate(w, r, db)
	}))

	// get last data in system + CORS (last.go)
	mux.HandleFunc("/system/last-data", utils.CorsMiddleware(func(w http.ResponseWriter, r *http.Request) {
		system.GetLastData(w, r, db)
	}))

	// delete entry in system + CORS (delete.go)
	mux.HandleFunc("/system/delete", utils.CorsMiddleware(func(w http.ResponseWriter, r *http.Request) {
		system.DeleteSystem(w, r, db)
	}))

	// get full result + CORS (full.go)
	mux.HandleFunc("/system/full", utils.CorsMiddleware(func(w http.ResponseWriter, r *http.Request) {
		system.FullResult(w, r, db)
	}))

}
