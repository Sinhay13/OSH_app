package handlers

import (
	"database/sql"
	"net/http"
	"server/reminds"
	"server/utils"
)

func RegisterRemindsEndpoints(mux *http.ServeMux, db *sql.DB) {

	// get previous results + CORS (action.go)
	mux.HandleFunc("/reminds/action", utils.CorsMiddleware(func(w http.ResponseWriter, r *http.Request) {
		reminds.TakeAction(w, r, db)
	}))

	// insert new remind + CORS (insert.go)
	mux.HandleFunc("/reminds/insert", utils.CorsMiddleware(func(w http.ResponseWriter, r *http.Request) {
		reminds.InsertNewRemind(w, r, db)
	}))

	// get list of current reminds + CORS (current.go)
	mux.HandleFunc("/reminds/current", utils.CorsMiddleware(func(w http.ResponseWriter, r *http.Request) {
		reminds.GetCurrentReminds(w, r, db)
	}))

	// delete remind in function of if id + CORS (delete.go)
	mux.HandleFunc("/reminds/delete", utils.CorsMiddleware(func(w http.ResponseWriter, r *http.Request) {
		reminds.DeleteRemind(w, r, db)
	}))

	// update remind date in function of id + CORS (update.go)
	mux.HandleFunc("/reminds/update/date", utils.CorsMiddleware(func(w http.ResponseWriter, r *http.Request) {
		reminds.UpdateDateRemind(w, r, db)
	}))

	// get list of pinned reminds + CORS (pinned.go)
	mux.HandleFunc("/reminds/pinned", utils.CorsMiddleware(func(w http.ResponseWriter, r *http.Request) {
		reminds.GetPinnedReminds(w, r, db)
	}))

	// get list of all reminds + CORS (all.go)
	mux.HandleFunc("/reminds/all", utils.CorsMiddleware(func(w http.ResponseWriter, r *http.Request) {
		reminds.GetAllReminds(w, r, db)
	}))

	// update remind in function of id + CORS (update.go)
	mux.HandleFunc("/reminds/update", utils.CorsMiddleware(func(w http.ResponseWriter, r *http.Request) {
		reminds.UpdateRemind(w, r, db)
	}))

}
