#include <WinAPISys.au3>

; Parameters:
; generateEoswinReports.exe /day:2018-02-03 /eoswinExe:D:\Eoswin\ADSPraxis.exe /reportGenerationTimeout:3000

Main()

Func Main()
  Info("AutoIt version " & @AutoItVersion)
  CloseEOSWin()
  Local $mPreviousPrinterSettings = SetReportPrinter()
  OpenEOSWin()
  GenerateEOSWinReport("Tagesjournal")
  GenerateEOSWinReport("Ärzte Statistik Umsätze")
  CloseEOSWin()
  RestorePreviousPrinter($mPreviousPrinterSettings)
  Info("Success")
  Exit(0)
EndFunc

Func SetReportPrinter()
  Local $mPreviousPrinterSettings = []
  Local $sReportPrinterName = "RosalindReports"
  Local $sEoswinPrinterConfigKey = "HKEY_CURRENT_USER\Software\MCW\Praxis\Drucker"
  Local $sReportPrinterSettingsFilename = "eoswinPrinter.reg"
  $mPreviousPrinterSettings["DefaultPrinterName"] = _WinAPI_GetDefaultPrinter()
  $mPreviousPrinterSettings["Filename"] = "eoswinPreviousPrinterSettings.reg"

  Info("Exporting previous printer settings")
  If ShellExecuteWait("reg.exe","export " & $sEoswinPrinterConfigKey & " " &  $mPreviousPrinterSettings["Filename"], @ScriptDir & "\", $SHEX_OPEN) <> 0 Then
    Info("Warning: Registry export failed with code " & String($iOk))
  EndIf
  ExpectFile(@ScriptDir & "\" & $mPreviousPrinterSettings["Filename"])

  Info("Importing report printer settings")
  ExpectFile(@ScriptDir & "\" & $sReportPrinterSettingsFilename)
  If ShellExecuteWait("reg.exe","import " & $sReportPrinterSettingsFilename, @ScriptDir & "\", $SHEX_OPEN) <> 0 Then
    Return Fail("Registry import failed with code " & String($iOk))
  EndIf

  Info("Previous default printer name was `" & $mPreviousPrinterSettings & "`")
  Info("Setting default printer to `" & $sReportPrinterName & "`")
  If _WinAPI_SetDefaultPrinter($sReportPrinterName) <> True Then
    Return Fail("Warning: Failed to set printer as default")
  EndIf

  Return $mPreviousPrinterSettings
EndFunc

Func RestorePreviousPrinter($mPreviousPrinterSettings)
  If $mPreviousPrinterSettings["DefaultPrinterName"] <> "" Then
    Info("Resetting default printer to `" & $mPreviousPrinterSettings["DefaultPrinterName"] & "`")
    If _WinAPI_SetDefaultPrinter($mPreviousPrinterSettings["DefaultPrinterName"]) <> True Then
      Info("Warning: Failed to reset default printer")
    EndIf
  Else
    Info("Skipping resetting default printer")
  EndIf

  Info("Importing previous printer settings")
  ExpectFile(@ScriptDir & "\" & $mPreviousPrinterSettings["Filename"])
  If ShellExecuteWait("reg.exe","import " & $mPreviousPrinterSettings["Filename"], @ScriptDir & "\", $SHEX_OPEN) <> 0 Then
    Return Fail("Registry import failed with code " & String($iOk))
  EndIf

  If FileRecycle(@ScriptDir & "\" & $mPreviousPrinterSettings["Filename"]) = 0 Then
    Info("Warning: Could not delete previous printer settings file (in use or does not exist)")
  EndIf
EndFunc

; Format: DDMMYYYY
Func GetDate()
  Local $sDateParam = GetCmdLineArg("day")
  If $sDateParam Then
    Local $sLocalDate = IsoDateToLocal($sDateParam)
    If $sLocalDate Then
      Return $sLocalDate
    EndIf
  EndIf

  ; Fallback to current day
  Return @MDAY & @MON & @YEAR
EndFunc

; Convert from YYYY-MM-DD to DDMMYYYY
; One-indexed: 123456789X
Func IsoDateToLocal($sYmd)
  Local $sYear = StringMid($sYmd, 1, 4)
  Local $sMonth = StringMid($sYmd, 6, 2)
  Local $sDay = StringMid($sYmd, 9, 2)
  If $sYear <> "" And $sMonth <> "" And $sDay <> "" Then
    Return $sDay & $sMonth & $sYear
  Else
    Return 0
  EndIf
EndFunc

Func OpenEOSWin()
  Local $sEoswinExe = GetCmdLineArg("eoswinExe", "D:\Eoswin\ADSPraxis.exe")
  Info("Launching EOSWin via " & $sEoswinExe)
  Run($sEoswinExe, "", @SW_MAXIMIZE)
  $hLoginWnd = ExpectWindow("EOSWin Anmeldung", 20)

  ExpectControlSend($hLoginWnd, "", "[CLASS:TEditName; INSTANCE: 1]", "{CAPSLOCK off}{SHIFTDOWN}{SHIFTUP}")
  ExpectControlSend($hLoginWnd, "", "[CLASS:TEditName; INSTANCE: 1]", "--")
  Sleep(300)
  ExpectControlClick($hLoginWnd, "OK", "[CLASS:TFocusBitBtn; INSTANCE: 1]")
EndFunc

Func CloseEOSWin($iRetries = 4)
  If ($iRetries = 0) Then
    Return Fail("Exceeded maximum # of retries trying to close EOSWin")
  EndIf

  Info("Checking whether EOSWin is running")

  $hSingletonMessageWnd = WinWait("Bestätigung", "OK", 2)
  $hMainWnd = WinWait("EOSWin", "", 2)

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
  Else
    Info("No EOSWin window found, force closing last instance")
    ProcessClose("ADSPraxis.exe")
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
    ; Don't ExpectControl* here because this prompt behaves strangely
    ControlClick($hOverwritePromptWnd, "", "[CLASS:TButton; INSTANCE:2]")
    ControlSend($hOverwritePromptWnd, "", "[CLASS:TButton; INSTANCE:2]", "{ENTER}")

    ; Instead make sure the warning is gone
    Sleep(5000)
    If WinWait("Warnung","", 5) Then
      Return Fail("Failed to dismiss warning")
    EndIf
  EndIf

  Local $iReportGenerationTimeout = Int(GetCmdLineArg("reportGenerationTimeout", 300))
  $hReportWnd = ExpectWindow($sReportType & "  [ vom", $iReportGenerationTimeout) ; note the two space characters

  Info("Closing report window")
  WinClose($hReportWnd)
  Info("Closing list window")
  WinClose($hListWnd)

  Info("Done generating report " & $sReportType)
EndFunc

Func ExpectControlSend($hWnd, $sText, $sControlId, $sSendString)
  ControlFocus($hWnd, $sText, $sControlId)

  If ControlSend($hWnd, $sText, $sControlId, $sSendString) = 0 Then
    Return Fail("Window or control not found to send: " & $sControlId)
  EndIf
EndFunc

Func ExpectControlClick($hWnd, $sText, $sControlId)
  ControlFocus($hWnd, $sText, $sControlId)

  If ControlClick($hWnd, $sText, $sControlId) = 0 Then
    Return Fail("Window or control not found to click: " & $sControlId)
  EndIf
EndFunc

Func ExpectWindow($sTitle, $iTimeout = 30)
  Info("Waiting " & String($iTimeout) & "s for window with title: " & $sTitle)
  Local $hWnd = WinWait($sTitle, "", $iTimeout)

  If $hWnd = 0 Then
    Return Fail("Expected window with title: " & $sTitle)
  EndIf

  If SendKeepActive($hWnd) = 0 Then
    Return Fail("Window not found: " & $sTitle)
  EndIf

  Info("Found window")

  Return $hWnd
EndFunc

Func ExpectFile($sPath)
  If FileExists($sPath) = 0 Then
    Return Fail("Expected file at " & $sPath)
  EndIf
EndFunc

Func GetCmdLineArg($sKey, $iDefaultValue = 0)
  Local $sKeyRaw = "/" & $sKey & ":"
  Local $iCmdLineArgCount = $CmdLine[0]
  For $i = 1 To $iCmdLineArgCount
    If StringInStr($CmdLine[$i], $sKeyRaw, $STR_NOCASESENSE, 1, StringLen($sKeyRaw)) Then
      Local $sArgValue = StringRight($CmdLine[$i], StringLen($CmdLine[$i]) - StringLen($sKeyRaw))
      Info("Parsed command line argument `" & $sArgValue & "` for key `" & $sKey & "`")
      Return $sArgValue
    EndIf
  Next
  Info("Could not find command line argument for key `" & $sKey & "`, returning default value `" & String($iDefaultValue) & "`")
  Return $iDefaultValue
EndFunc

Func HoistErrors($bShouldFail = True)
  Local $hError = WinWait("Fehler", "", 1)
  If $hError Then
    Info("Detected hoistable error message")
    ExpectControlClick($hError, "&>>", "[CLASS:TBitBtn; INSTANCE:2]")
    Local $sError = ControlGetText($hError, "", "[CLASS:TMemo; INSTANCE:1]")
    If ($bShouldFail) Then
      Return Fail("Hoisted Error: " & $sError)
    EndIf
  EndIf
EndFunc

$iRetriesAfterFailure = 4
Func Fail($sMessage)
  $iRetriesAfterFailure = $iRetriesAfterFailure - 1
  ConsoleWriteError("Fail: " & $sMessage & @CRLF)
  HoistErrors(False)
  ConsoleWriteError("Printing debug information" & @CRLF)
  PrintWindows()

  If ($iRetriesAfterFailure = 0) Then
    ConsoleWriteError("Failed to run automation" & @CRLF)
    Exit(1)
  Else
    Info("Retrying")
    Main()
  EndIf
EndFunc

Func Info($sMessage)
  ConsoleWrite($sMessage & @CRLF)
EndFunc

Func PrintWindows()
  Local $aWindows = WinList()
  Local $iWindowCount = $aWindows[0][0]

  Info("List of " & String($iWindowCount) & " windows:")
  For $i = 1 To $iWindowCount
    ; List Visible windows with title only
    If $aWindows[$i][0] <> "" And BitAND(WinGetState($aWindows[$i][1]), 2) Then
      Info("[" & String($i) & "] " & aWindows[$i][0])
    EndIf
  Next
EndFunc
