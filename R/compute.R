`compute` <-
function(expression = "", data) {
    
    verify.qca(data)
    
    pp <- translate(expression, colnames(data))
    
    mv <- attr(pp, "mv")
    tempList <- vector("list", nrow(pp))
    
    for (i in seq(length(tempList))) {
        x <- which(pp[i, ] >= 0)
        val <- pp[i, x]
        if (!is.null(mv)) {
            mval <- mv[i, x]
        }
        
        temp <- data[, colnames(pp)[x], drop = FALSE]
        
        for (j in seq(length(val))) {
            
            if (!is.numeric(temp[, j]) & possibleNumeric(temp[, j])) {
                temp[, j] <- asNumeric(temp[, j])
            }
            
            if (any(abs(temp[, j] - round(temp[, j])) >= .Machine$double.eps^0.5)) {
                
                if (!is.null(mv)) {
                    if (length(splitstr(gsub("~", "", mval[j]))) > 1) {
                        cat("\n")
                        stop("Multiple values specified for fuzzy data.\n\n", call. = FALSE)
                    }
                }
                
                if (val[j] == 0) {
                    temp[, j] <- 1 - temp[, j]
                }
            }
            else {
                if (max(temp[, j]) <= 1) {
                    temp[, j] <- as.numeric(temp[, j] == val[j])
                }
                else {
                    if (is.null(mv)) {
                        if (val[j] == 0) {
                            temp[, j] <- as.numeric(temp[, j] == val[j])
                        }
                        else {
                            temp[, j] <- as.numeric(temp[, j] != 0)
                        }
                    }
                    else {
                        temp[, j] <- temp[, j] %in% splitstr(gsub("~", "", mval[j]))
                        if (grepl("~", mval[j])) {
                            temp[, j] <- 1 - temp[, j]
                        }
                    }
                }
            }
        }
        
        if (ncol(temp) > 1) {
            temp <- fuzzyand(temp)
        }
        
        tempList[[i]] <- temp
    }
    
    res <- as.data.frame(matrix(unlist(tempList), ncol = length(tempList)))
    colnames(res) <- rownames(pp)
    
    if (ncol(res) > 1) {
        res <- cbind(res, expression = as.vector(fuzzyor(res)))
    }
    
    attr(res, "name") <- paste(rownames(pp), collapse = " + ")
    
    return(res)
}
    

