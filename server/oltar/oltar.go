package oltar

import (
	"database/sql"
	"os"
	"server/utils"

	_ "github.com/mattn/go-sqlite3"
)

// init database
func InitDB(filepath string) (*sql.DB, error) {

	if _, err := os.Stat(filepath); os.IsNotExist(err) {
		// filepath does not exist we make it
		_, err := sql.Open("sqlite3", filepath)
		// we check if they are errs
		if err != nil {
			utils.Logger.Printf("Error creating DB file: %v", err)
			return nil, err
		}
		utils.Logger.Printf("Created DB file %s", filepath)
	}

	// we connect with the database:
	db, err := sql.Open("sqlite3", filepath)

	//we deal with errors:
	if err != nil {
		utils.Logger.Printf("Error opening DB: %v", err)
		return nil, err
	}

	// we check if tables exist
	tableExists, err := tableExists(db, "chapters")
	if err != nil {
		utils.Logger.Printf("Error checking tables_schema: %v", err)
		return nil, err
	}

	//we create schemas if needed :
	if !tableExists {

		if err := createSchemas(db); err != nil {
			utils.Logger.Printf("Error creating schemas: %v", err)
			return nil, err

		} else if tableExists {
			return nil, err
		}
	}
	return db, nil

}

// To check if tables already exists
func tableExists(db *sql.DB, tableName string) (bool, error) {
	row := db.QueryRow("SELECT name FROM sqlite_master WHERE type='table' AND name=?", tableName)
	var name string
	err := row.Scan(&name)
	if err != nil {
		if err == sql.ErrNoRows {
			return false, nil
		}
		return false, err
	}
	return true, nil
}

// To make schemas :
func createSchemas(db *sql.DB) error {
	schemas, err := utils.LoadQueries("schema.json")
	if err != nil {
		utils.Logger.Print(err)
		return err
	}
	_, err = db.Exec(schemas.Schema) // to get schema database
	if err != nil {
		return err
	}
	return nil
}
