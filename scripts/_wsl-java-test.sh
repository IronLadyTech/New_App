export JAVA_HOME="/mnt/c/Program Files/Microsoft/jdk-21.0.12.8-hotspot"
ls "$JAVA_HOME/bin/" 2>&1 | head -8
test -x "$JAVA_HOME/bin/java.exe" && echo JAVA_EXE_OK || echo JAVA_EXE_FAIL
"$JAVA_HOME/bin/java.exe" -version 2>&1 | head -1
