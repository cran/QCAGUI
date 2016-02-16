`fuzzyor` <- function(...) {
    
    other.args <- list(...)
    if (is.matrix(other.args[[1]]) | is.data.frame(other.args[[1]])) {
        
        cols <- colnames(other.args[[1]])
        if (is.null(cols)) {
            cols <- LETTERS[seq(ncol(other.args[[1]]))]
        }
        
        result <- apply(other.args[[1]], 1, max)
        attr(result, "name") <- paste(cols, collapse=" + ")
        
        return(structure(result, class = "fuzzyop"))
        
    }
    else {
        return(pmax(other.args[[1]]))
    }
}
