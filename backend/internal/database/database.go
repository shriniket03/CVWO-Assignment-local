package database

import (
	"database/sql"
	"fmt"
	_ "github.com/lib/pq"
	"os"
	"net/url"
	"github.com/joho/godotenv"
	"log"
)

func GoDotEnvVariable(key string) string {
	// err := godotenv.Load("/etc/secrets/.env")
	err := godotenv.Load("../.env")
	if err != nil {
	  log.Fatalf("Error loading .env file")
	}
	return os.Getenv(key)
}

type Database struct {
	Ref *sql.DB
}

func GetDB() (*Database, error) {
	psqlInfo := GoDotEnvVariable("DATABASE_URI")
	conn, _ := url.Parse(psqlInfo)
	conn.RawQuery = "sslmode=verify-ca;sslrootcert=ca.pem"

	db, err := sql.Open("postgres", conn.String())

	if err != nil {
		return nil, err
	}

	err = db.Ping()
	if err != nil {
  		return nil, err
	}
	fmt.Println("Successfully connected!")
	if err != nil {
		return nil, err
	}

	_, err = InitTables(db)
	if err != nil {
		return nil, err
	}
	return &Database{Ref:db}, nil
}

func InitTables(db *sql.DB) (string, error) {
	queryUser := `CREATE TABLE IF NOT EXISTS Users (
		id SERIAL PRIMARY KEY,
		name TEXT NOT NULL, 
		username TEXT NOT NULL, 
		password TEXT NOT NULL
		)`

	_, err := db.Exec(queryUser)
	
	if err != nil {
		return "", err
	}

	queryPost := `CREATE TABLE IF NOT EXISTS Posts (
		id SERIAL PRIMARY KEY,
		author INT, 
		tag TEXT NOT NULL, 
		content TEXT NOT NULL,
		category TEXT NOT NULL,
		likes INT,
		time BIGINT, 
		CONSTRAINT fk_Author FOREIGN KEY(author) REFERENCES Users(id)
		)`
	
	_, err = db.Exec(queryPost)
	
	if err != nil {
		return "", err
	}

	queryComment := `CREATE TABLE IF NOT EXISTS Comments (
		id SERIAL PRIMARY KEY,
		author INT, 
		post INT, 
		content TEXT NOT NULL,
		time BIGINT, 
		CONSTRAINT fk_Author FOREIGN KEY(author) REFERENCES Users(id),
		CONSTRAINT fk_Post FOREIGN KEY(post) REFERENCES Posts(id)
		)`
	
	_, err = db.Exec(queryComment)

	if err != nil {
		return "", err
	}
	

	return "success", nil
}