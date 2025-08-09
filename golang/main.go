package main

import (
	"fmt"
	"log"
	"net/http"
	"time"

	seveneleven "github.com/King0625/web-scraping-practice/sevenEleven"
)

func main() {
	client := &http.Client{
		Timeout: 15 * time.Second,
	}

	cities, err := seveneleven.GetAllCities(client)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println(cities)

	var storesInTaiwan [][]string
	for _, city := range cities {
		stores, err := seveneleven.GetStoresByCity(client, city)
		if err != nil {
			log.Fatal(err)
		}
		storesInTaiwan = append(storesInTaiwan, stores...)
	}

	fmt.Println(len(storesInTaiwan))
	seveneleven.WriteToCsvFile(storesInTaiwan)
}
