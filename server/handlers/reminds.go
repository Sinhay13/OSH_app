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
}
