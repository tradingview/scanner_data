all: make_crypto make_futures make_stocks

make_crypto:
	cd ./crypto/attributes/generator; npm install; node ./main.js

make_futures:
	cd ./futures/filters/generator/; npm install; node ./america.js

make_stocks:
	cd ./stock/filters/generator/; npm install; node ./germany.js