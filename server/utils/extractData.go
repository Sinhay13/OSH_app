package utils

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
)

// ExtractData processes an HTTP request to extract data from its body.
// It supports both JSON and multipart?form-data content types.
// Returns a map of expected data or an error if the content type is not supported
func ExtractData(w http.ResponseWriter, r *http.Request) (map[string]interface{}, error) {

	// Initialize an empty map to store the extracted data.
	data := make(map[string]interface{})

	// Retrieve the content type of the request
	contentType := r.Header.Get("Content-type")

	// Check if the request method is POST. If not, return an error.
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}

	// If the content type contains "application/json", read the request body and unmarshal it into the data map.
	if strings.Contains(contentType, "application/json") {

		body, err := io.ReadAll(r.Body)
		if err != nil {
			Logger.Print(err)
			return nil, err
		}
		err = json.Unmarshal(body, &data)
		if err != nil {
			Logger.Print(err)
			return nil, err
		}
		// If the content type contains "multipart/form-data", parse the multipart form and extract the values.
	} else if strings.Contains(contentType, "multipart/form-data") {

		err := r.ParseMultipartForm(0)
		if err != nil {
			Logger.Print(err)
			return nil, err
		}
		for k, v := range r.MultipartForm.Value {
			if len(v) > 0 {
				data[k] = v[0] // Use the first value of the slice for each key.
			}
		}
		// If the content type is neither JSON nor multipart/form-data, return an error.
	} else {
		Logger.Println("content type not accepted")
		return nil, fmt.Errorf("content type not accepted")
	}
	// Return the extracted data map.
	return data, nil
}
