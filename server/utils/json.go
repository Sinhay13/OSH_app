package utils

import (
	"encoding/json"
	"os"
	"path/filepath"
)

type Queries struct {

	//schema oltar DB
	Schema string `json:"schema"`

	//chapters:
	Count            string `json:"count"`
	Insert_chapters  string `json:"insert_chapters"`
	Get_last_chapter string `json:"get_last_chapter"`
	Title_chapters   string `json:"title_chapters"`
	One_year_ago     string `json:"one_year_ago"`
	Select           string `json:"select"`

	//tags:
	FullList     string `json:"full_List"`
	ActiveList   string `json:"active_List"`
	NonList      string `json:"non_List"`
	InsertNewTag string `json:"insert_new_tag"`

	// entries :
	LastMessage    string `json:"last_message"`
	InsertNewEntry string `json:"insert_new_entry"`
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
