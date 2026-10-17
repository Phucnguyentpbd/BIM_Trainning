Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

' 1. Kiem tra ket noi den cong 5173
Dim http, isRunning, i
isRunning = False

On Error Resume Next
Set http = CreateObject("MSXML2.ServerXMLHTTP.6.0")
http.setTimeouts 600, 600, 600, 600
http.open "HEAD", "http://127.0.0.1:5173/", False
http.send

If Err.Number = 0 Then
    isRunning = True
End If
Err.Clear
On Error GoTo 0

' 2. Neu may chu chua chay, khoi dong npm run dev chay ngam
If Not isRunning Then
    WshShell.CurrentDirectory = "D:\AGENT_AI\BIMLearningHub"
    WshShell.Run "cmd /c npm run dev", 0, False
    ' Doi may chu khoi dong
    For i = 1 To 20
        WScript.Sleep 500
        On Error Resume Next
        Set http = CreateObject("MSXML2.ServerXMLHTTP.6.0")
        http.setTimeouts 500, 500, 500, 500
        http.open "HEAD", "http://127.0.0.1:5173/", False
        http.send
        If Err.Number = 0 Then
            Exit For
        End If
        Err.Clear
        On Error GoTo 0
    Next
End If

' 3. Mo duoi dang Web App Window doc lap (App Mode - khong thanh URL, khong bookmarks, y het Civil Notebook)
Dim chromePath, edgePath, appUrl
appUrl = "http://127.0.0.1:5173/"
chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
edgePath = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

If fso.FileExists(chromePath) Then
    WshShell.Run """" & chromePath & """ --app=""" & appUrl & """", 1, False
ElseIf fso.FileExists(edgePath) Then
    WshShell.Run """" & edgePath & """ --app=""" & appUrl & """", 1, False
Else
    WshShell.Run appUrl, 1, False
End If
