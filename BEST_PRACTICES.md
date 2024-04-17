# Рекомендации по написанию эффективного кода на пайне

### По-возможности обращаться непосредственно к истории серий (`time`/`open`/`high`/`close`) вместо обращения к истории переменных или аргументов, в противном случае на каждый вызов функции будет выделен буфер в размере глубины обращения. В частности, если функция всегда вызывается с некоторыми одинаковыми параметрами, их следует инлайнить
```
fastSearchN(_xs, x, maxbarsback) =>  // xs - sorted, ascending
	xs = _xs
	if bar_index == 0
		xs += xs[maxbarsback] * 0  // max_bars_back
	left = 0
	right = math.min(bar_index, maxbarsback)
	mid = 0
	if xs < x
		0
	else
		for i = 0 to 9 by 1
			mid := math.ceil((left + right) / 2)
			if left == right
				break
			else if xs[mid] < x
				right := mid
				continue
			else if xs[mid] > x
				left := mid
				continue
			else
				break
		mid

countOfBars1DayAgoBond = fastSearchTimeIndex(dayAgoYield, dayYield)
countOfBars1MonthAgoBond = fastSearchTimeIndex(monthAgoYield, monthYield)
countOfBars1YearAgoBond = fastSearchTimeIndex(yearAgoYield, yearYield)
```
можно улучшить так
```
fastSearchTimeIndex(x, maxbarsback) =>
	max_bars_back(time, maxbarsback)
	left = 0
	right = math.min(bar_index, maxbarsback)
	mid = 0
	if time < x
		0
	else
		for i = 0 to 9 by 1
			mid := math.ceil((left + right) / 2)
			if left == right
				break
			else if time[mid] < x
				right := mid
				continue
			else if time[mid] > x
				left := mid
				continue
			else
				break
		mid

countOfBars1DayAgoBond = fastSearchTimeIndex(dayAgoYield, dayYield)
countOfBars1MonthAgoBond = fastSearchTimeIndex(monthAgoYield, monthYield)
countOfBars1YearAgoBond = fastSearchTimeIndex(yearAgoYield, yearYield)
```
### Рекомендуется схлопывать одинаковые секюрити в одну при помощи тюплов
```
fund_flows1M = request.security(makeFundFlowsTicker(), getFundTF(), sum(month1), ignore_invalid_symbol=true, gaps=barmerge.gaps_off)
fund_flows3M = request.security(makeFundFlowsTicker(), getFundTF(), sum(month3), ignore_invalid_symbol=true, gaps=barmerge.gaps_off)
fund_flows1Y = request.security(makeFundFlowsTicker(), getFundTF(), sum(oneYear), ignore_invalid_symbol=true, gaps=barmerge.gaps_off)
fund_flows3Y = request.security(makeFundFlowsTicker(), getFundTF(), sum(years3), ignore_invalid_symbol=true, gaps=barmerge.gaps_off)
fund_flows5Y = request.security(makeFundFlowsTicker(), getFundTF(), sum(years5), ignore_invalid_symbol=true, gaps=barmerge.gaps_off)
fund_flowsYTD = request.security(makeFundFlowsTicker(), getFundTF(), sumYTD(), ignore_invalid_symbol=true, gaps=barmerge.gaps_off)
```
стоит зарефакторить так
```
[fund_flows1M, fund_flows3M, fund_flows1Y, fund_flows3Y, fund_flows5Y, fund_flowsYTD] = request.security(fundFlowsTicker, fundTF, [sum(month1), sum(month3), sum(oneYear), sum(years3), sum(years5), sumYTD()], ignore_invalid_symbol=true, gaps=barmerge.gaps_off)
```
### Следует переиспользовать вычиcления
```
plot(ta.rsi(close, 2), title='RSI2')
plot(ta.rsi(close, 2)[1], title='RSI2[1]')
```
нужно переписать так
```
RSI2 = ta.rsi(close, 2)
plot(RSI2, title='RSI2')
plot(RSI2[1], title='RSI2[1]')
```
### Стоит использовать `var` по назначению
```
pivotX_open = float(na)
pivotX_open := nz(pivotX_open[1], open)
```
можно упростить
```
var pivotX_open = open
```
### Если что-то можно посчитать 1 раз, то стоит это сделать и записать результат в var переменную. NB: если инициализируемое значение константа, то var не нужен
```
getFundTF() => timeframe.isintraday ? "1D" : timeframe.period
```
превратить в
```
var fundTF = timeframe.isintraday ? "D" : timeframe.period
```
### Эффективнее применять подход "вычислений по скользящему окну" вместо постоянного обхода в цикле
```
sumYTD()=>
	max_bars_back(time, 2*oneYear)
	max_bars_back(close, 2*oneYear)
	var firstBar = time

	if year(timenow, syminfo.timezone) == year(firstBar, syminfo.timezone)
		na
	else
		sum = 0.
		for i = 0 to bar_index
			if year(time[i], syminfo.timezone) < year
				break
			sum += close[i]
		sum
```
можно соптимизировать
```
sumYTD()=>
    var startYear = year(time, syminfo.timezone)

	if year(timenow, syminfo.timezone) == startYear
		na
	else
		var sum = 0.
        if year(time[1], syminfo.timezone) < year(time, syminfo.timezone)
            sum := 0
        sum += close
		sum
```
### Инпуты в сканерных скриптах не нужны