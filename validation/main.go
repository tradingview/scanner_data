package main

import (
	"fmt"
	"log"
	"os"

	"gopkg.in/yaml.v3"
)

type Components struct {
	HotlistsComponents struct {
		Names     []string `yaml:"names"`
		Exchanges []string `yaml:"exchanges"`
	} `yaml:"hotlists_components"`
}

type Presets struct {
	Presets []map[string]any `yaml:"presets"`
}

func main() {
	log.Println("start validation")

	const (
		expectedHotlistsPath = "./validation/collections.yaml"
		actualHotlistsPath   = "./presets/hotlists.yaml"
	)

	var comp Components
	readFileAndUnmarshal(expectedHotlistsPath, &comp)

	collection := createRequiredCollection(comp.HotlistsComponents.Names, comp.HotlistsComponents.Exchanges)

	var presets Presets
	readFileAndUnmarshal(actualHotlistsPath, &presets)

	err := validateCollection(collection, presets.Presets)
	if err != nil {
		log.Fatalf("validation failure: %s", err)
	}

	log.Println("validation succeeded")
}

func createRequiredCollection(names, exchanges []string) map[string]struct{} {
	collection := make(map[string]struct{}, len(names)*len(exchanges))
	for _, hn := range names {
		for _, exch := range exchanges {
			collection[exch+"_"+hn] = struct{}{}
		}
	}
	return collection
}

func validateCollection(expected map[string]struct{}, actual []map[string]any) error {
	var (
		expectedLen = len(expected)
		actualLen   = len(actual)
	)
	if expectedLen != actualLen {
		return fmt.Errorf("unequal lengths: expected=%d, actual=%d", expectedLen, actualLen)
	}
	for _, mp := range actual {
		name, ok := mp["name"].(string)
		if ok {
			delete(expected, name)
		}
	}
	if len(expected) != 0 {
		var missingPresets []string
		for name := range expected {
			missingPresets = append(missingPresets, name)
		}
		return fmt.Errorf("missing presets: %v", missingPresets)
	}
	return nil
}

func readFileAndUnmarshal(path string, value any) {
	bytes, err := os.ReadFile(path)
	if err != nil {
		log.Fatalf("could not read file %s: %s", path, err)
	}
	err = yaml.Unmarshal(bytes, value)
	if err != nil {
		log.Fatal(err)
	}
}
