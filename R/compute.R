`compute` <-
function(expression = "", data, separate = FALSE) {
    
    if (!isNamespaceLoaded("QCA")) {
        requireNamespace("QCA", quietly = TRUE)
    }
    
    colnames(data) <- toupper(colnames(data))
    
    pp <- translate(expression, colnames(data))
    
    retain <- apply(pp, 2, function(x) any(x >= 0))
    pp <- pp[, retain, drop = FALSE]
    data <- data[, retain, drop = FALSE]
    
    verify.qca(data)
    
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
            
            if (!is.numeric(temp[, j]) & QCA::possibleNumeric(temp[, j])) {
                temp[, j] <- QCA::asNumeric(temp[, j])
            }
            
            if (any(abs(temp[, j] - round(temp[, j])) >= .Machine$double.eps^0.5)) { 
                
                if (!is.null(mv)) {
                    if (length(QCA::splitstr(gsub("~", "", mval[j]))) > 1) {
                        cat("\n")
                        stop(simpleError("Multiple values specified for fuzzy data.\n\n"))
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
                        temp[, j] <- temp[, j] %in% QCA::splitstr(gsub("~", "", mval[j]))
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
        if (!separate) {
            res <- as.vector(fuzzyor(res))
        }
    }
    else {
        res <- as.vector(res[, 1])
    }
    
    return(res)
}
    
