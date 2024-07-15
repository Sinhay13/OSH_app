package utils

import (
	"encoding/json"
	"os"
	"path/filepath"
)

type Queries struct {

	//schema oltar DB
	Schema string `json:"schema"`
}

// To load queries :
func LoadQueries(filename string) (Queries, error) {
	var queries Queries

	filePath := filepath.Join("..", "sql", filename)

	fileContent, err := os.ReadFile(filePath)
	if err != nil {
		return queries, err
	}

	err = json.Unmarshal(fileContent, &queries)
	if err != nil {
		return queries, err
	}

	return queries, nil
}
