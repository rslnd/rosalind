#include <ScreenCapture.au3>

$sEoswinExe = "D:\Eoswin\ADSPraxis.exe"
$iGenerateTimeout = 300

AutoItSetOption("MustDeclareVars", 1)

Main()

Func Main()
  Info("AutoIt version " & @AutoItVersion)
  CloseEOSWin()
  OpenEOSWin()
  GenerateEOSWinReport("Tagesjournal")
  GenerateEOSWinReport("Ärzte Statistik Umsätze")
  CloseEOSWin()
  Info("Success")
EndFunc

; Format: DDMMYYYY
Func GetDate()
  Return @MDAY & @MON & @YEAR
EndFunc

Func OpenEOSWin()
  Run($sEoswinExe, "", @SW_MAXIMIZE)
  $hLoginWnd = ExpectWindow("EOSWin Anmeldung", 20)

  ExpectControlSend($hLoginWnd, "", "[CLASS:TEditName; INSTANCE: 1]", "{CAPSLOCK off}{SHIFTDOWN}{SHIFTUP}")
  ExpectControlSend($hLoginWnd, "", "[CLASS:TEditName; INSTANCE: 1]", "--")
  Sleep(300)
  ExpectControlClick($hLoginWnd, "OK", "[CLASS:TFocusBitBtn; INSTANCE: 1]")
EndFunc

Func CloseEOSWin($iRetries = 4)
  If ($iRetries = 0) Then
    Fail("Exceeded maximum # of retries trying to close EOSWin")
  EndIf

  Info("Checking whether EOSWin is running")

  $hSingletonMessageWnd = WinWait("Bestätigung", "OK", 2)
  $hMainWnd = WinWait("EOSWin", "Patienten", 2)

  $hWnd = Null
  If ($hSingletonMessageWnd) Then
    $hWnd = $hSingletonMessageWnd
  ElseIf ($hMainWnd) Then
    $hWnd = $hMainWnd
  EndIf

  If ($hWnd) Then
    Info("EOSWin is running, attempting to terminate process")
    $iPid = WinGetProcess($hWnd)
    Info("Terminating PID " & String($iPid))
    ProcessClose($iPid)
    Info("Termination result was " & String(@error))
    $iOk = ProcessWaitClose($iPid, 10)
    If ($iOk = 1) Then
      Info("Process was terminated")
      ; There may be more instances running
      CloseEOSWin($iRetries - 1)
    Else
      Info("Process is still running, trying again. Retries left: " & String($iRetries))
      CloseEOSWin($iRetries - 1)
    EndIf
  EndIf
EndFunc

Func GenerateEOSWinReport($sReportType)
  Info("Generating report " & $sReportType)
  sleep(3000)
  $hEosWnd = ExpectWindow("EOSWin Ordination")
  Local $sListWindowTitle = "Auswertungen/Serienbrief [" & $sReportType

  Info("Navigating menu bar")
  WinMenuSelectItem($hEosWnd, "", "A&uswertungen", $sReportType)

  Sleep(800)

  $hListWnd = ExpectWindow($sListWindowTitle)

  ; Create new report: "Neu"
  Info("Sending n to create new report")
  ExpectControlSend($hListWnd, "Neu", "[CLASS:TFocusBitBtn; INSTANCE: 2]", "n")
  Sleep(500)

  ; Date range prompt
  $hDatePromptWnd = ExpectWindow($sReportType)
  Info("Sending start date")
  WinActivate($hDatePromptWnd)
  ExpectControlSend($hDatePromptWnd, "", "[CLASS:TEditDate; INSTANCE:1]", GetDate())
  Sleep(500)
  Info("Sending end date")
  WinActivate($hDatePromptWnd)
  ExpectControlSend($hDatePromptWnd, "", "[CLASS:TEditDate; INSTANCE:2]", GetDate())
  Sleep(500)
  WinActivate($hDatePromptWnd)
  ExpectControlSend($hDatePromptWnd, "", "[CLASS:TEditDate; INSTANCE:2]", "{ENTER}")

  ; Overwrite any existing report for the same date range
  $hOverwritePromptWnd = WinWait("Warnung","", 10)
  If ($hOverwritePromptWnd) Then
    Info("Dismissing warning about overwriting existing report")
    Sleep(500)
    ExpectControlClick($hOverwritePromptWnd, "", "[CLASS:TButton; INSTANCE:2]")
    ExpectControlSend($hOverwritePromptWnd, "", "[CLASS:TButton; INSTANCE:2]", "{ENTER}")

    Sleep(5000)
    If WinWait("Warnung","", 5) Then
      Fail("Failed to dismiss warning")
    EndIf
  EndIf

  $hReportWnd = ExpectWindow($sReportType & "  [ vom", $iGenerateTimeout) ; note the two space characters

  Info("Closing report window")
  WinClose($hReportWnd)
  Info("Closing list window")
  WinClose($hListWnd)

  Info("Done generating report " & $sReportType)
EndFunc

Func ExpectControlSend($hWnd, $sText, $sControlId, $sSendString)
  If ControlFocus($hWnd, $sText, $sControlId) = 0 Then
    Fail("Window or control not found to focus before send: " & $sControlId)
  EndIf

  If ControlSend($hWnd, $sText, $sControlId, $sSendString) = 0 Then
    Fail("Window or control not found to send: " & $sControlId)
  EndIf
EndFunc

Func ExpectControlClick($hWnd, $sText, $sControlId)
  If ControlFocus($hWnd, $sText, $sControlId) = 0 Then
    Fail("Window or control not found to focus before click: " & $sControlId)
  EndIf

  If ControlClick($hWnd, $sText, $sControlId) = 0 Then
    Fail("Window or control not found to click: " & $sControlId)
  EndIf
EndFunc

Func ExpectWindow($sTitle, $iTimeout = 30)
  Info("Waiting " & String($iTimeout) & "s for window with title: " & $sTitle)
  Local $hWnd = WinWait($sTitle, "", $iTimeout)

  If $hWnd = 0 Then
    Fail("Expected window with title: " & $sTitle)
  EndIf

  If SendKeepActive($hWnd) = 0 Then
    Fail("Window not found: " & $sTitle)
  EndIf

  Info("Found window")

  Return $hWnd
EndFunc

Func Fail($sMessage)
  ConsoleWriteError("Fail: " & $sMessage & @CRLF)
  ConsoleWriteError("Printing debug information" & @CRLF)
  PrintWindows()
  Screenshot()
  ConsoleWriteError("Failed to run automation" & @CRLF)
  Exit(1)
EndFunc

Func Info($sMessage)
  ConsoleWrite($sMessage & @CRLF)
EndFunc

Func PrintWindows()
  Local $aWindows = WinList()
  Local $iWindowCount = $aWindows[0][0]

  Info("List of " & $iWindowCount & " windows:")
  For $i = 1 To $iWindowCount
    Info("[" & String($i) & "] " & aWindows[$i][0])
  Next
EndFunc

Func Screenshot()
  Info("Taking screenshot")
  Local $sImagePath = @TempDir & "\" & @YEAR & @MON & @MDAY & @HOUR & @MIN & @SEC & ".png"
  Info("Saving screenshot at " & $sImagePath)
  _ScreenCapture_Capture($sImagePath)
  Info("Saved screenshot at " & $sImagePath)
EndFunc
