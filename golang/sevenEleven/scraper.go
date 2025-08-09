package seveneleven

import (
	"bytes"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/PuerkitoBio/goquery"
)

func GetAllCities(client *http.Client) ([]string, error) {
	var cities []string
	req, err := http.NewRequest("GET", "https://www.ibon.com.tw/mobile/retail_inquiry.aspx#gsc.tab=0", nil)
	if err != nil {
		return nil, err
	}

	res, err := client.Do(req)
	if err != nil {
		return nil, err
	}

	defer res.Body.Close()

	doc, err := goquery.NewDocumentFromReader(res.Body)
	if err != nil {
		return nil, err
	}

	doc.Find("#Class1 option").Each(func(i int, s *goquery.Selection) {
		// For each item found, get the band and title
		city := strings.TrimSpace(s.Text())
		cities = append(cities, city)
	})

	return cities, nil
}

func GetStoresByCity(client *http.Client, city string) ([][]string, error) {
	var stores [][]string
	formData := fmt.Sprintf("strTargetField=COUNTY&strKeyWords=%s", city)
	req, err := http.NewRequest("POST", "https://www.ibon.com.tw/mobile/retail_inquiry_ajax.aspx", bytes.NewReader([]byte(formData)))
	req.Header.Add("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8")

	if err != nil {
		return nil, err
	}

	res, err := client.Do(req)
	if err != nil {
		return nil, err
	}

	defer res.Body.Close()

	doc, err := goquery.NewDocumentFromReader(res.Body)
	if err != nil {
		return nil, err
	}

	doc.Find("table tr").Each(func(i int, s *goquery.Selection) {
		var store []string
		s.Children().Each(func(j int, s *goquery.Selection) {
			store = append(store, strings.TrimSpace(s.Text()))
		})
		if len(store) == 3 {
			stores = append(stores, store)
		}
	})

	fmt.Println("Done:", city)
	return stores[1:], nil
}

func WriteToCsvFile(stores [][]string) {
	filename := "sevenEleven.csv"
	file, err := os.Create(filename)
	if err != nil {
		log.Fatal(err)
	}

	file.Write([]byte("店號;店名;地址\n"))
	for _, store := range stores {
		storeCsvString := strings.Join(store, ";")
		file.Write([]byte(storeCsvString + "\n"))
	}
}
