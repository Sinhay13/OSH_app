package handlers

import (
	"database/sql"
	"net/http"
	"server/entries"
	"server/utils"
)

func RegisterEntriesEndpoints(mux *http.ServeMux, db *sql.DB) {
	// Endpoints for entries :

	// get last message + CORS (last.go)
	mux.HandleFunc("/entries/last", utils.CorsMiddleware(func(w http.ResponseWriter, r *http.Request) {
		entries.GetLastMessage(w, r, db)
	}))

	// insert new entry + CORS (insert.go)
	mux.HandleFunc("/entries/new", utils.CorsMiddleware(func(w http.ResponseWriter, r *http.Request) {
		entries.InsertNewEntry(w, r, db)
	}))

	// insert count entries + CORS (count.go)
	mux.HandleFunc("/entries/count", utils.CorsMiddleware(func(w http.ResponseWriter, r *http.Request) {
		entries.CountEntries(w, r, db)
	}))

	// get list of messages + CORS (messages.go)
	mux.HandleFunc("/entries/messages/list", utils.CorsMiddleware(func(w http.ResponseWriter, r *http.Request) {
		entries.GetMessagesList(w, r, db)
	}))
	// get message in function of ID + CORS (count.go)
	mux.HandleFunc("/entries/messages/message", utils.CorsMiddleware(func(w http.ResponseWriter, r *http.Request) {
		entries.GetMessageFromID(w, r, db)
	}))

}
