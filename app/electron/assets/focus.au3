#Region
#AutoIt3Wrapper_UseUpx=n
#AutoIt3Wrapper_Res_requestedExecutionLevel=asInvoker
#EndRegion
#NoTrayIcon

Local $bDebug = False

; Parameters:
; focus.exe /title:"Dr. X - ABC" /exe:"%LOCALAPPDATA%\Programs\rosalind\Rosalind.exe"

Func FocusRslnd()
  $sTitle = GetCmdLineArg("title", "Rosalind")

  If WinActivate($sTitle) Then
    Exit(0)
  Else
    $hWnd = GetWindowHandle()
    If $hWnd <> -1 And WinActivate($hWnd) Then
      Exit(0)
    EndIf
  EndIf

  Info("Failed to activate window, falling back to launch")
  LaunchRslnd()
EndFunc

Func LaunchRslnd()
  Local $sExe = GetCmdLineArg("exe", "%LOCALAPPDATA%\Programs\rosalind\Rosalind.exe")
  Info("Launching via " & $sExe)
  Run($sExe, "", @SW_MAXIMIZE)
EndFunc

Func GetPids()
  Local $aProcessList = ProcessList("Rosalind.exe")
  Local $iCount = $aProcessList[0][0]
  Local $aPids[$iCount]
  Info("Found " & String($iCount) & " matching processes")
  For $i = 1 To $iCount
    Info("PID: " & $aProcessList[$i][1] & " - " & $aProcessList[$i][0])
    $aPids[$i - 1] = $aProcessList[$i][1]
  Next

  Return $aPids
EndFunc

Func GetWindowHandle()
  Local $aPids = GetPids()
  Local $aList = WinList()
  Local $iCount = $aList[0][0]
  Info("Found " & String($iCount) & " matching windows")
  For $i = 1 To $aList[0][0]
    Local $sTitle = $aList[$i][0]
    Local $hWnd = $aList[$i][1]
    If $sTitle <> "" Then
      Info("Title: " & $sTitle & " - Handle: " & $hWnd)
      Local $iPid = WinGetProcess($hWnd)
      For $ii = 0 To UBound($aPids) - 1
        If $iPid = $aPids[$ii] Then
          Info("Found Matching PID " & $iPid & " for Handle " & $hWnd)
          Return $hWnd
        EndIf
      Next
    EndIf
  Next
EndFunc

Func Info($sMessage)
  If $bDebug <> False Then
    ConsoleWrite($sMessage & @CRLF)
  EndIf
EndFunc

Func GetCmdLineArg($sKey, $iDefaultValue = 0)
  Local $sKeyRaw = "/" & $sKey & ":"
  Local $iCmdLineArgCount = $CmdLine[0]
  Info("Arg count: " & $iCmdLineArgCount)
  For $i = 1 To $iCmdLineArgCount
    Info("Arg " & $i & ": " & $CmdLine[$i])
    If StringInStr($CmdLine[$i], $sKeyRaw, 2) Then ; 2 = Fast Case Insensitive
      Local $sArgValue = StringRight($CmdLine[$i], StringLen($CmdLine[$i]) - StringLen($sKeyRaw))
      Info("Parsed command line argument `" & $sArgValue & "` for key `" & $sKey & "`")
      Return $sArgValue
    EndIf
  Next
  Info("Could not find command line argument for key `" & $sKeyRaw & "`, returning default value `" & String($iDefaultValue) & "`")
  Return $iDefaultValue
EndFunc

Func SetOptions()
  Opt("WinTitleMatchMode", 3) ; Exact title match
  Opt("WinWaitDelay", 0) ; Don't pause after window-related operation
  Opt("ExpandEnvStrings", 1) ; Allow %APPDATA% in exe path
EndFunc

Func Main()
  SetOptions()
  FocusRslnd()
EndFunc

Main()
