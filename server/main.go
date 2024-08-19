package main

import (
	"context"
	"net/http"
	"os"
	"os/signal"
	"server/handlers"
	"server/oltar"
	"server/utils"
	"syscall"
	"time"

	_ "github.com/mattn/go-sqlite3"
)

func main() {

	// start Oltar database //
	dbPath := "oltar.db"
	db, err := oltar.InitDB(dbPath)
	if err != nil {
		utils.Logger.Fatal(err)
	}
	defer db.Close()

	// Create a new ServeMux//
	mux := http.NewServeMux()

	// Handler for Endpoints //
	handlers.RegisterChaptersEndpoints(mux, db)
	handlers.RegisterTagsEndpoints(mux, db)
	handlers.RegisterEntriesEndpoints(mux, db)
	handlers.RegisterRemindsEndpoints(mux, db)
	handlers.RegisterSystemEndpoints(mux, db)

	// Manage connection //

	// Start the HTTP server with the ServeMux as the router
	port := "2323"

	utils.Logger.Printf("Server listening on :%s...", port)

	srv := &http.Server{
		Addr:    ":" + port,
		Handler: mux, // Use the ServeMux as the router
	}

	// Start the server in a goroutine
	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			utils.Logger.Fatalf("ListenAndServe error: %v", err)
		}
	}()

	// Wait for interrupt signal to gracefully shutdown the server
	stopChan := make(chan os.Signal, 1)
	signal.Notify(stopChan, os.Interrupt, syscall.SIGTERM)

	<-stopChan // wait for stop signal
	utils.Logger.Println("No new connection accepted")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second) // time to close server
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		utils.Logger.Fatalf("Server Shutdown Failed:%+v", err)
	}
	utils.Logger.Println("Server Exited Properly")

}
