# Этот репозиторий - хранилище данных для сканера/скринера.

## Описание файлов
| имя файла | назначение |
|---|---|
| scanner.crypto.qf.json  | Список квотовых полей для крипто-скринера |
| scanner.data.json  | "Скомпиленный" код пайн-скрипта "сложного" индикатора сканера. В самих сканерах используется именно он. |
| scanner.data.pine  | Исходный код пайн-скрипта "сложного" индикатора сканера. Отличие в том что он содержит 100% кода из простого + код специфичный именно для дневки: кэндлы, перворманс, лоу/хаи. Используется только для дневки. |
| scanner.data.simple.json  | "Скомпиленный" код пайн-скрипта "простого" индикатора сканера. В самих сканерах используется именно он. |
| scanner.data.simple.pine  | Исходный код пайн-скрипта "простого" индикатора сканера. Тут считаются базовые вещи (мувинги, осциляторы и прочие индикаторы). Используется для всех резолюций кроме дневки. |
| scanner.forex.qf.json  | Список квотовых полей для форекс-скринера |
| scanner.qf.json  | Дефолтный список квотовых полей для скринера (стоки) |


## Как обновлять код индикаторов
Для обновления скрипта индикатора, отредактируйте соответствующий .pine файл
Для добавления скрипта индикатора, добавьте соответствующий .pine файл

После внесенных изменений, запустите утилиту pine_compiler (https://git.xtools.tv/tv/scanner/tree/master/pine_compiler):
```shell
go run ../scanner/pine_compiler/main.go -s scanner.data.pine -o scanner.data.json # для обновления кода scanner.data
go run ../scanner/pine_compiler/main.go -s scanner.data.simple.pine -o scanner.data.simple.json # для обновления кода scanner.data.simple
go run ../scanner/pine_compiler/main.go -s scanner.data.simple.5.pine -o scanner.data.simple.5.json # для scanner.data.simple.5
```

Если компиляция прошла успешно, закоммитить и запушить изменения.

## Обновление scanner_rates_metainfo.json и .qf полей
Обновить scanner_rates_metainfo.json
Вызвать
```shell
go run ./rates_metanfo_updater/main.go --metainfo-path scanner_rates_metainfo.json --qf-path scanner.qf.json
```
Проверить и закоммитить изменения.