$sEoswinExe = "D:\Eoswin\ADSPraxis.exe"

Main()

Func Main()
  CloseEOSWin()
  OpenEOSWin()
  GenerateEOSWinReport("Tagesjournal", "t{ENTER}")
  ; No need to send ENTER if the item has a unique first letter
  GenerateEOSWinReport("Ärzte Statistik Umsätze", "ä")
  CloseEOSWin()
  ConsoleWrite("Success")
EndFunc

; Format: DDMMYYYY
Func GetDate()
  Return @MDAY & @MON & @YEAR
EndFunc

Func OpenEOSWin()
  Send("{CAPSLOCK off}{SHIFTDOWN}{SHIFTUP}")
  Run($sEoswinExe, "", @SW_MAXIMIZE)
  $hLoginWnd = ExpectWindow("EOSWin Anmeldung", 20)
  ControlSend($hLoginWnd, "", "[CLASS:TEditName; INSTANCE: 1]", "--")
  Sleep(300)
  ControlClick($hLoginWnd, "OK", "[CLASS:TFocusBitBtn; INSTANCE: 1]")
EndFunc

Func CloseEOSWin($iRetries = 4)
  If ($iRetries = 0) Then
    ConsoleWrite("Exceeded maximum # of retries trying to close EOSWin, aborting" & @CRLF)
    Exit(1)
  EndIf

  ConsoleWrite("Checking whether EOSWin is running" & @CRLF)

  $hSingletonMessageWnd = WinWait("Bestätigung", "OK", 2)
  $hMainWnd = WinWait("EOSWin", "Patienten", 2)

  $hWnd = Null
  If ($hSingletonMessageWnd) Then
    $hWnd = $hSingletonMessageWnd
  ElseIf ($hMainWnd) Then
    $hWnd = $hMainWnd
  EndIf

  If ($hWnd) Then
    ConsoleWrite("EOSWin is running, attempting to terminate process" & @CRLF)
    $iPid = WinGetProcess($hWnd)
    ConsoleWrite("Terminating PID " & String($iPid) & @CRLF)
    ProcessClose($iPid)
    ConsoleWrite("Termination result was " & String(@error) & @CRLF)
    $iOk = ProcessWaitClose($iPid, 10)
    If ($iOk = 1) Then
      ConsoleWrite("Process was terminated" & @CRLF)
      ; There may be more instances running
      CloseEOSWin($iRetries - 1)
    Else
      ConsoleWrite("Process is still running, trying again. Retries left: " & String($iRetries) & @CRLF)
      CloseEOSWin($iRetries - 1)
    EndIf
  EndIf
EndFunc

Func GenerateEOSWinReport($sReportType, $sMenuShortcut = Null)
  ConsoleWrite("Generating report " & $sReportType & @CRLF)
  sleep(3000)
  $hEosWnd = ExpectWindow("EOSWin Ordination")
  Local $sListWindowTitle = "Auswertungen/Serienbrief [" & $sReportType

  ConsoleWrite("Navigating menu bar" & @CRLF)
  ; Navigate menu bar: "A_u_swertungen"
  Send("!u")
  Sleep(200)

  If ($sMenuShortcut = Null) Then
    ; Extract lower cased first letter of report type
    $sFirstLetter = StringMid(StringLower($sReportType), 1, 1)
    ConsoleWrite("No shortcut given, sending " & $sFirstLetter & @CRLF)
    Send($sFirstLetter)
  Else
    ConsoleWrite("Sending shortcut " & $sMenuShortcut & @CRLF)
    Send($sMenuShortcut)
  EndIf

  Sleep(500)

  $hListWnd = ExpectWindow($sListWindowTitle)

  ; Create new report: "Neu"
  ConsoleWrite("Sending n" & @CRLF)
  ControlSend($hListWnd, "Neu", "[CLASS:TFocusBitBtn; INSTANCE: 2]", "n")
  Sleep(500)

  ; Date range prompt
  $hDatePromptWnd = ExpectWindow($sReportType)
  ConsoleWrite("Sending start date" & @CRLF)
  WinActivate($hDatePromptWnd)
  ControlSend($hDatePromptWnd, "", "[CLASS:TEditDate; INSTANCE:1]", GetDate())
  Sleep(500)
  ConsoleWrite("Sending end date" & @CRLF)
  WinActivate($hDatePromptWnd)
  ControlSend($hDatePromptWnd, "", "[CLASS:TEditDate; INSTANCE:2]", GetDate())
  Sleep(500)
  WinActivate($hDatePromptWnd)
  ControlSend($hDatePromptWnd, "", "[CLASS:TEditDate; INSTANCE:2]", "{ENTER}")

  ; Overwrite any existing report for the same date range
  $hOverwritePromptWnd = WinWait("Warnung","", 10)
  If ($hOverwritePromptWnd) Then
    ConsoleWrite("Dismissing warning about overwriting existing report" & @CRLF)
    Sleep(500)
    ControlSend($hOverwritePromptWnd, "OK", "[CLASS:TMessageForm]", "{ENTER}")
    Send("{ENTER}")
  EndIf

  $hReportWnd = ExpectWindow($sReportType & "  [ vom", 600) ; note the two space characters

  ConsoleWrite("Closing report window" & @CRLF)
  WinClose($hReportWnd)
  ConsoleWrite("Closing list window" & @CRLF)
  WinClose($hListWnd)

  ConsoleWrite("Done generating report " & $sReportType & @CRLF)
EndFunc

Func ExpectWindow($sTitle, $iTimeout = 30)
  ConsoleWrite("Waiting " & String($iTimeout) & "s for window with title " & $sTitle & @CRLF)
  Local $hWnd = WinWait($sTitle, "", $iTimeout)

  If $hWnd = 0 Then
    ConsoleWriteError("Expected window with title " & $sTitle & @CRLF)
    Exit(1)
  EndIf

  WinActivate($hWnd)
  SendKeepActive($hWnd)
  ConsoleWrite("Found window" & @CRLF)

  Return $hWnd
EndFunc
