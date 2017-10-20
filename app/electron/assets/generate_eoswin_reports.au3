GenerateEOSWinReport("Ärzte Statistik Umsätze")
GenerateEOSWinReport("Tagesjournal")

; Format: DDMMYYYY
Func GetDate()
  Return @MDAY & @MON & @YEAR
EndFunc

Func GenerateEOSWinReport($sReportType)
  ExpectWindow("EOSWin Ordination")

  Send("!u") ; Navigate menu bar: "Auswertungen"
  ; Extract lower cased first letter of report type
  $sFirstLetter = StringMid(StringLower($sReportType), 1, 1)
  Send($sFirstLetter)

  ; If the first letter matches only one item, the reports
  ; list window will open immediately; otherwise send {ENTER}.
  If (WinWait($sReportType,"", 1) = 0) Then
	 Send("{ENTER}")
  EndIf

  ExpectWindow("Auswertungen/Serienbrief [" & $sReportType)

  Send("n") ; Create new report: "Neu"

  ; Date range prompt
  ExpectWindow($sReportType)

  Send(GetDate())
  Send("{TAB}")
  Send(GetDate())
  Send("{ENTER}")

  ; Overwrite any existing report for the same date range
  If (WinWait("Warnung","", 3)) Then
	 Send("{ENTER}")
  EndIf

  $hReportWnd = ExpectWindow($sReportType & "  [ vom", 600) ; note the two space characters
  WinClose($hReportWnd)
EndFunc

Func ExpectWindow($title, $timeout = 3)
  Local $hWnd = WinWait($title, "", $timeout)

  If $hWnd = 0 Then
    Exit(1)
  EndIf

  WinActivate($hWnd)
  SendKeepActive($hWnd)

  Return $hWnd
EndFunc
