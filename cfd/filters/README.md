# Фильтр CFD + дополнительные атрибуты

* Для cfd [cfd.json](./cfd.json): генерируется при помощи [generator/main.js](./generator/main.js).
Задаются атрибуты: "sector", "country", "index_priority", "country_code"
Дополнительно генерируется список групп символов [groups/indices.json](../groups/indices.json) для cfd-скринера.
Т.о. после перегенерации списка символов, cfd скринер после обновления подхватывает и новые группы и новые атрибуты для символов