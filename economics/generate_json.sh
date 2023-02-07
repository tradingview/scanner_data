#!/bin/bash

fileDst='representative_symbols.json'
tmp_file=tmp.json


input=countries_codes.txt
v='={\"symbol\":\"SIMULATED:CONST1\",\"type\":\"Script@tv-scripting-101!\",\"inputs\":{\"text\":\"open~high~low~close~volume~$0!$1!$2!$3!$4;s5:$0():s5~$1~$2~$3~$4~$5~$6!$7!$8!$9!$10\",\"pineId\":\"country='
v2='\"}}'

echo { >> $fileDst
echo   '  "fields": [
    "typespecs",
    "group",
    "popularity_rank",
    "timezone",
    "symbol",
    "symbol-primaryname",
    "description",
    "exchange-listed",
    "type"
  ],' >> $fileDst
echo '  "symbols": [' >> $tmp_file
while read line;
do
echo '    {
      "f": [
        "",
        "tradingeconomics",
        5.709845123895545,
        "Etc/UTC",
        "CONST1",
        null,
        "SIMULATED",
        "SIMULATED",
        "economic"
      ],' >> $tmp_file
        tmp_line="${v}${line}${v2}"
        echo "      \"s\": \"$tmp_line\"" >> $tmp_file
        echo '    },' >> $tmp_file
done < $input
sed '$ s/.$//' $tmp_file >> $fileDst
echo '  ]' >> $fileDst
echo '}' >> $fileDst
rm $tmp_file
