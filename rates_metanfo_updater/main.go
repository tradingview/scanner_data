package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"io/ioutil"
)

var pathMetainfo = flag.String("metainfo-path", "scanner_rates_metainfo.json", "path to metainfo file")
var pathQF = flag.String("qf-path", "scanner.qf.json", "path to .qf.json file")

func main() {
	flag.Parse()
	err := syncFundamentalPriceType()
	if err != nil {
		panic(err)
	}
}

func readMetaJSON(path string) (map[string]interface{}, error) {
	data, err := ioutil.ReadFile(path)
	if err != nil {
		return nil, err
	}
	obj := map[string]interface{}{}
	err = json.Unmarshal(data, &obj)
	if err != nil {
		return nil, err
	}
	return obj, nil
}

func readQfJSON(path string) ([]map[string]interface{}, error) {
	data, err := ioutil.ReadFile(path)
	if err != nil {
		return nil, err
	}
	arr := []map[string]interface{}{}
	err = json.Unmarshal(data, &arr)
	if err != nil {
		return nil, err
	}
	return arr, nil
}

func writeQfJSON(path string, qf []map[string]interface{}) error {
	data, err := json.MarshalIndent(qf, "", "\t")
	if err != nil {
		return err
	}
	err = ioutil.WriteFile(path, data, 0)
	if err != nil {
		return err
	}
	return nil
}

func syncFundamentalPriceType() error {
	metaMap, err := readMetaJSON(*pathMetainfo)
	if err != nil {
		return fmt.Errorf("error reading meta json, %w", err)
	}

	qfMap, err := readQfJSON(*pathQF)
	if err != nil {
		return fmt.Errorf("error reading qf json, %w", err)
	}

	for _, field := range qfMap {
		name, ok := field["name"].(string)
		if !ok {
			return fmt.Errorf("expected name to be string, but it is %T", field["name"])
		}
		if _, ok := metaMap[name]; ok {
			field["type"] = "fundamental_price"
		}
	}

	err = writeQfJSON(*pathQF, qfMap)
	if err != nil {
		return fmt.Errorf("error writing new qf json, %w", err)
	}
	return nil
}
