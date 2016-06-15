`runGUI` <-
function(x) {
    
    if (!isNamespaceLoaded("QCA")) {
        requireNamespace("QCA", quietly = TRUE)
    }
    
    if (missing(x)) {
        x <- system.file("gui", package="QCAGUI")
    }
    
    Sys.setenv(userwd=getwd())
    Sys.setenv("LANGUAGE"="en") 
    
    runApp(x, launch.browser = TRUE)
    
}

