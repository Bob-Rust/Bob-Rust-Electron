# https://nsis.sourceforge.io/Docs/Chapter4.html

!macro customUnInstall
    SetShellVarContext current
    MessageBox MB_YESNO "Delete settings and files?" IDNO Skipped IDYES Accepted
    Accepted:
        MessageBox mb_ok "Removing $APPDATA\${APP_FILENAME}"
        RMDir /r "$APPDATA\${APP_FILENAME}"
        Goto done
    Skipped:
        Goto done
    done:
!macroend
