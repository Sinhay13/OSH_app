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
	Count             string `json:"count"`
	Insert_chapters   string `json:"insert_chapters"`
	Get_last_chapter  string `json:"get_last_chapter"`
	Title_chapters    string `json:"title_chapters"`
	Select            string `json:"select"`
	Get_list_chapters string `json:"get_list_chapters"`
	Get_title         string `json:"get_title"`

	// entries :
	LastMessage                      string `json:"last_message"`
	InsertNewEntry                   string `json:"insert_new_entry"`
	LastMessageBeforeDate            string `json:"last_message_before_date"`
	NextMessageAfterDate             string `json:"next_message_after_date"`
	CountAllEntries                  string `json:"count_all_entries"`
	CountEntriesPerChapter           string `json:"count_entries_per_chapter"`
	GetMessagesList                  string `json:"get_messages_list"`
	GetMessagesListFilteredByChapter string `json:"get_messages_list_filtered_by_chapter"`
	GetMessageFromID                 string `json:"get_message_from_id"`
	GetTagFromID                     string `json:"get_tag_from_id"`

	//tags:
	ActiveList            string `json:"active_list"`
	ActiveListPrinciple   string `json:"active_list_principle"`
	ActiveListNone        string `json:"active_list_none"`
	InsertNewTag          string `json:"insert_new_tag"`
	InsertNewTagPrinciple string `json:"insert_new_tag_principle"`
	Principles            string `json:"principles"`
	CountTags             string `json:"count_tags"`
	FilteredTags          string `json:"filtered_tags"`
	CheckPrinciplesTags   string `json:"check_principles_tags"`
	DisableTag            string `json:"disable_tag"`
	EnableTag             string `json:"enable_tag"`
	UpdateTag             string `json:"update_tag"`
	CheckIfTagInactive    string `json:"check_if_tag_inactive"`
	ReadComment           string `json:"read_comment"`
	SaveComment           string `json:"save_comment"`
	TagSystem             string `json:"tag_system"`
	TagType               string `json:"tag_type"`

	//reminds:
	InsertRemind      string `json:"insert_remind"`
	GetCurrentReminds string `json:"get_current_reminds"`

	// system :
	CountSystemEntries    string `json:"count_system_entries"`
	ActiveTagCheck        string `json:"active_tag_check"`
	PassiveTagCheck       string `json:"passive_tag_check"`
	UpdateSystem          string `json:"update_system"`
	SelectPreviousResults string `json:"select_previous_results"`
	GetLastDate           string `json:"get_last_date"`
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
