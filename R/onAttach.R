.onAttach <- function(...) {
    msg <- paste("Dusa, Adrian (2007)",
                 "User manual for the QCA(GUI) package in R",
                 "Journal of Business Research 60(5), 576-586.", sep=". ")
    msg <- paste(strwrap(msg, indent = 2, exdent = 2), collapse = "\n")
    packageStartupMessage("\nTo cite this package in publications, please use:\n\n", msg, "\n")
}
