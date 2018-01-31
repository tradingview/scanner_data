# Дополнительные атрибуты для криптовалютных пар

[crypto.json](./crypto.json): генерируется при помощи [generator/main.js](./generator/main.js)
Находит пары <<coin>>/USD & <<coin>>/BTC и для них задает атрибуты "имя монеты" и "код монеты"; используется потом на https://www.tradingview.com/markets/cryptocurrencies/quotes-all/
Нужно запускать если требуется обновить список монет для вышеуказанной страницы.