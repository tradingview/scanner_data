# Дополнительные атрибуты для криптовалютных пар

[crypto.json](./crypto.json): генерируется при помощи [generator/main.js](./generator/main.js)

Находит пары <<coin>>/USD & <<coin>>/BTC и для них задает атрибуты "имя монеты" и "код монеты". Используется потом на https://www.tradingview.com/markets/cryptocurrencies/quotes-all/ и https://www.tradingview.com/markets/cryptocurrencies/global-charts/

Нужно запускать если требуется обновить список монет для вышеуказанных страниц.

В блеклист генератора можно добавить конкретный символ через переменную [excludeSymbols](generator/main.js#L77) или через [фильтр](generator/main.js#L19) в скан запросе.
