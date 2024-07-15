package utils

import (
	"log"
	"net/http"
	"os"
	"time"
)

func CorsMiddleware(h http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// CORS
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		// Optional request
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		h.ServeHTTP(w, r)
	}
}

// Get current Time :
func TimeNow() string {
	return time.Now().Format("2006-01-02 15:04:05")
}

// Logger //
var Logger *log.Logger

func init() {
	Logger = log.New(os.Stdout, "", log.LstdFlags)
}
