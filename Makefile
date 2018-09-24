all: make_crypto make_futures

git_commit:
	git add -u && git commit -m "regenerate"
	while ! git push; do git pull -X theirs; done

make_crypto:
	cd ./crypto/attributes/generator; npm install; node ./main.js

make_futures:
	cd ./futures/filters/generator/; npm install; node ./america.js