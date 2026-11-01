// Pine Script v5 indicator code for the XAUUSD M5 strategy.
// Stored as a plain string so it can be shown + downloaded + copied.

export const pineScriptCode = `//@version=5
// ============================================================================
//  XAUUSD M5 GOLDEN SCALPER  —  Pullback-in-Trend with RSI + EMA Confluence
//  Strategy concept: buy deep pullbacks in uptrends / sell shallow rallies
//  in downtrends, only during the London + NY session.
//
//  Built for: OANDA:XAUUSD  (also works on any gold spot feed)
//  Timeframe:  5 minutes (chart)
//  Author:     Z.ai Quant Lab
// ============================================================================

indicator("XAUUSD M5 Golden Scalper", shorttitle="GoldScalp M5", overlay=true,
     max_labels_count=100, max_lines_count=100, max_boxes_count=50)

// ─────────────────────────────────── USER INPUTS ────────────────────────────
grpTrend   = "Trend Filter (uses higher TF data)"
htf        = input.timeframe("60",  "Higher TF for trend", group=grpTrend)
emaFastLen = input.int(20,          "M5 EMA Fast",          group=grpTrend)
emaMidLen  = input.int(50,          "M5 EMA Mid",           group=grpTrend)
emaSlowLen = input.int(200,         "M5 EMA Slow",          group=grpTrend)

grpMom     = "Momentum / Pullback"
rsiLen     = input.int(14,          "RSI Length",           group=grpMom)
rsiLongMin = input.int(35,          "RSI Long min",         group=grpMom)
rsiLongMax = input.int(45,          "RSI Long max",         group=grpMom)
rsiShortMin= input.int(55,          "RSI Short min",        group=grpMom)
rsiShortMax= input.int(65,          "RSI Short max",        group=grpMom)

grpRisk    = "Risk / Volatility"
atrLen     = input.int(14,          "ATR Length",           group=grpRisk)
atrMult    = input.float(1.5,       "ATR SL Multiplier",    group=grpRisk)
rr1        = input.float(1.0,       "TP1 Risk:Reward",      group=grpRisk)
rr2        = input.float(2.0,       "TP2 Risk:Reward",      group=grpRisk)

grpSess    = "Session Filter (exchange tz)"
sessStart  = input.session("0700-1500", "Trading session",  group=grpSess)
useSess    = input.bool(true,       "Restrict to session?", group=grpSess)

grpVis     = "Visuals"
showEMAs   = input.bool(true,       "Show EMAs",            group=grpVis)
showBands  = input.bool(true,       "Show EMA20 band",      group=grpVis)
showSess   = input.bool(true,       "Shade session",        group=grpVis)
showLabels = input.bool(true,       "Show entry labels",    group=grpVis)

// ─────────────────────────────────── TREND (HTF) ────────────────────────────
htfEma50    = request.security(syminfo.tickerid, htf, ta.ema(close, 50),  lookahead=barmerge.lookahead_off)
htfEma200   = request.security(syminfo.tickerid, htf, ta.ema(close, 200), lookahead=barmerge.lookahead_off)
bullTrend   = htfEma50 > htfEma200 and close > htfEma50
bearTrend   = htfEma50 < htfEma200 and close < htfEma50

// ─────────────────────────────────── M5 INDICATORS ──────────────────────────
emaFast     = ta.ema(close, emaFastLen)
emaMid      = ta.ema(close, emaMidLen)
emaSlow     = ta.ema(close, emaSlowLen)
rsi         = ta.rsi(close, rsiLen)
atr         = ta.atr(atrLen)

// EMA20 band for visual pullback zone
bandDev     = atr * 0.5
bandUpper   = emaFast + bandDev
bandLower   = emaFast - bandDev

// ─────────────────────────────────── SESSION ────────────────────────────────
inSession   = not useSess or time(timeframe.period, sessStart, "America/New_York")
sessBg      = showSess and inSession

// ─────────────────────────────────── CANDLE PATTERNS ────────────────────────
bullEngulf  = close > open and close[1] < open[1] and close > open[1] and open < close[1]
bearEngulf  = close < open and close[1] > open[1] and close < open[1] and open > close[1]
hammer      = close > open and (open - low) > 2 * (close - open) and (high - close) < (close - open)
star        = close < open and (high - open) > 2 * (open - close) and (close - low) < (open - close)

bullCandle  = bullEngulf or hammer
bearCandle  = bearEngulf or star

// ─────────────────────────────────── SETUP CONDITIONS ───────────────────────
// LONG:  HTF bullish, M5 pulled back into EMA20 band, RSI in zone, bullish candle
pullLong    = low <= bandUpper and (close >= emaFast or close[1] < emaFast)
rsiLong     = rsi >= rsiLongMin and rsi <= rsiLongMax
longSetup   = bullTrend and inSession and pullLong and rsiLong and bullCandle

// SHORT: HTF bearish, M5 rallied into EMA20 band, RSI in zone, bearish candle
pullShort   = high >= bandLower and (close <= emaFast or close[1] > emaFast)
rsiShort    = rsi >= rsiShortMin and rsi <= rsiShortMax
shortSetup  = bearTrend and inSession and pullShort and rsiShort and bearCandle

// Only fire once per setup (avoid duplicate labels)
var bool inLong  = false
var bool inShort = false
if longSetup and not inLong
    inLong  := true
    inShort := false
else if shortSetup and not inShort
    inShort := true
    inLong  := false

// ─────────────────────────────────── LEVELS (SL / TP) ───────────────────────
slLong      = low - atrMult * atr
slShort     = high + atrMult * atr
riskLong    = close - slLong
riskShort   = slShort - close
tp1Long     = close + rr1 * riskLong
tp2Long     = close + rr2 * riskLong
tp1Short    = close - rr1 * riskShort
tp2Short    = close - rr2 * riskShort

// ─────────────────────────────────── PLOTS ──────────────────────────────────
plot(showEMAs ? emaFast : na, "EMA20", color=color.new(#f0b90b, 0), linewidth=2)
plot(showEMAs ? emaMid  : na, "EMA50", color=color.new(#3bb18c, 0), linewidth=2)
plot(showEMAs ? emaSlow : na, "EMA200", color=color.new(#e0457b, 0), linewidth=2)

pUpper = plot(showBands ? bandUpper : na, "Band Upper", color=color.new(#f0b90b, 70))
pLower = plot(showBands ? bandLower : na, "Band Lower", color=color.new(#f0b90b, 70))
fill(pUpper, pLower, color=color.new(#f0b90b, 88), title="Pullback Zone")

bgcolor(sessBg ? color.new(#f0b90b, 92) : na, title="Session Shade")

// ─────────────────────────────────── SIGNAL MARKERS ─────────────────────────
plotshape(longSetup  and showLabels, title="LONG",  style=shape.labelup,   location=location.belowbar, color=#f0b90b, textcolor=#000000, text="LONG",  size=size.small)
plotshape(shortSetup and showLabels, title="SHORT", style=shape.labeldown, location=location.abovebar, color=#e0457b, textcolor=#ffffff, text="SHORT", size=size.small)

// ─────────────────────────────────── SL / TP LINES (last signal) ────────────
var line lnSL  = na
var line lnTP1 = na
var line lnTP2 = na

if longSetup
    lnSL  := line.new(bar_index, slLong,  bar_index + 10, slLong,  color=#e0457b, style=line.style_dashed)
    lnTP1 := line.new(bar_index, tp1Long, bar_index + 10, tp1Long, color=#3bb18c, style=line.style_dashed)
    lnTP2 := line.new(bar_index, tp2Long, bar_index + 10, tp2Long, color=#3bb18c, style=line.style_solid)

if shortSetup
    lnSL  := line.new(bar_index, slShort,  bar_index + 10, slShort,  color=#e0457b, style=line.style_dashed)
    lnTP1 := line.new(bar_index, tp1Short, bar_index + 10, tp1Short, color=#3bb18c, style=line.style_dashed)
    lnTP2 := line.new(bar_index, tp2Short, bar_index + 10, tp2Short, color=#3bb18c, style=line.style_solid)

// Extend lines forward
if not na(lnSL)
    line.set_x2(lnSL,  bar_index + 10)
    line.set_x2(lnTP1, bar_index + 10)
    line.set_x2(lnTP2, bar_index + 10)

// ─────────────────────────────────── ALERTS ─────────────────────────────────
alertcondition(longSetup,  title="GoldScalp LONG",  message="XAUUSD M5 LONG  | SL={{ticker}} RSI/EMA confluence")
alertcondition(shortSetup, title="GoldScalp SHORT", message="XAUUSD M5 SHORT | SL={{ticker}} RSI/EMA confluence")

// ─────────────────────────────────── DASHBOARD ──────────────────────────────
var table dash = table.new(position.top_right, 2, 5, bgcolor=color.new(#11151c, 10), border_width=1, border_color=color.new(#f0b90b, 60))
if barstate.islast
    table.cell(dash, 0, 0, "Trend (H1)", text_color=#bdbdbd, text_size=size.small)
    table.cell(dash, 1, 0, bullTrend ? "BULL ▲" : bearTrend ? "BEAR ▼" : "FLAT", text_color=bullTrend ? #3bb18c : bearTrend ? #e0457b : #999999, text_size=size.small)
    table.cell(dash, 0, 1, "RSI(14)", text_color=#bdbdbd, text_size=size.small)
    table.cell(dash, 1, 1, str.tostring(rsi, "#.0"), text_color=rsi < 30 ? #3bb18c : rsi > 70 ? #e0457b : #f0b90b, text_size=size.small)
    table.cell(dash, 0, 2, "ATR", text_color=#bdbdbd, text_size=size.small)
    table.cell(dash, 1, 2, str.tostring(atr, "#.##"), text_color=#f0b90b, text_size=size.small)
    table.cell(dash, 0, 3, "Session", text_color=#bdbdbd, text_size=size.small)
    table.cell(dash, 1, 3, inSession ? "OPEN" : "OFF", text_color=inSession ? #3bb18c : #666666, text_size=size.small)
    table.cell(dash, 0, 4, "Signal", text_color=#bdbdbd, text_size=size.small)
    table.cell(dash, 1, 4, longSetup ? "LONG" : shortSetup ? "SHORT" : "WAIT", text_color=longSetup ? #f0b90b : shortSetup ? #e0457b : #999999, text_size=size.small)

// ─────────────────────────────────── END ────────────────────────────────────
`
