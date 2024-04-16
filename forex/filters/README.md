# Фильтр валютных пар (FX_IDC) + дополнительные атрибуты

* Для форекса [forex.json](./forex.json): генерируется при помощи [generator/main.js](./generator/main.js).
Задаются атрибуты: "country", "sector", "forex_priority", "country2", "forex_minor_priority", "forex_exotic_priority"

#### как стартануть генератор:
1. sudo apt-get install nodejs
2. sudo apt install npm
3. npm install package.json
4. nodejs main.js    
expected output:  
`Unknown region undefined`    
`Unknown region undefined`    
`<...>`  
файл forex.json обновлён  
