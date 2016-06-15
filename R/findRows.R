`findRows` <-
function(expression = "", ttobj, remainders = FALSE) {
    
    if (identical(expression, "")) {
        stop(simpleError("The expression is missing.\n\n"))
    }
    
    if (missing(ttobj)) {
        stop(simpleError("The truth table object is missing.\n\n"))
    }
    else {
        if (!is(ttobj, "tt")) {
            stop(simpleError("Argument \"ttobj\" is not a truth table object.\n\n"))
        }
    }
    
    noflevels <- ttobj$noflevels
    conditions <- ttobj$options$conditions
    
    trexp <- translate(paste(expression, collapse = "+"), conditions)
    
    result <- matrix(ncol = ncol(trexp), nrow = 0)
    
    for (i in seq(nrow(trexp))) {
        
        rowi <- trexp[i, ]
        detected <- rowi >= 0
        
        if (!is.null(attr(trexp, "mv"))) {
            rowi <- lapply(strsplit(attr(trexp, "mv")[i, detected], split = ","), QCA::asNumeric)
        }
        else {
            rowi <- as.list(rowi[detected])
        }
        
        rowi <- expand.grid(rowi)
        
        colnames(rowi) <- conditions[detected]
        
        if (sum(!detected) > 0) {
            
            restm <- createMatrix(noflevels[!detected])
            colnames(restm) <- conditions[!detected]
            
            rowi <- apply(rowi, 1, function(x) rep(x, each = nrow(restm)))
            
            for (r in seq(ncol(rowi))) {
                detm <- matrix(rowi[, r], nrow = nrow(restm))
                colnames(detm) <- conditions[detected]
                
                temp <- cbind(restm, detm)
                
                result <- rbind(result, temp[, conditions])
            }
        }
        else {
            result <- rbind(result, rowi)
        }
        
    }
    
    rows <- sort(unique(drop(rev(c(1, cumprod(rev(noflevels))))[-1] %*% t(result)) + 1))
    
    if (remainders) {
        rows <- setdiff(rows, ttobj$indexes)
    }
    
    return(rows)
}
