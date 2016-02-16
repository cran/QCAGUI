`uninstall` <- function(x) {
    if (isNamespaceLoaded("x")) {
        detach(paste0("package:", x), unload=TRUE)
        library.dynam.unload(x, system.file(package = x)) 
    }
    remove.packages(x)
}
