`factorize` <- 
function(expression, prod.split="", sort.factorizing=FALSE, sort.factorized=FALSE, pos=FALSE) {
    
    collapse <- prod.split
    if (prod.split != "") prod.split <- paste("\\", prod.split, sep="")
    
    
    if (is.qca(expression)) {
        collapse <- prod.split <- expression$options$collapse
        if (prod.split != "") prod.split <- paste("\\", prod.split, sep="")
        if ("i.sol" %in% names(expression)) {
            result <- list(i.sol=vector("list", length=length(expression$i.sol)))
            for (i in seq(length(expression$i.sol))) {
                names(result$i.sol) <- paste(names(expression$i.sol), "S", sep="")
                result$i.sol[[i]] <- lapply(expression$i.sol[[i]]$solution, function(x) {
                    factor.function(x, prod.split, collapse, sort.factorizing, sort.factorized)
                })
                names(result$i.sol[[i]]) <- unlist(lapply(expression$i.sol[[i]]$solution, paste, collapse=" + "))
            }
        }
        else {
            result <- lapply(expression$solution, function(x) {
                if (length(x) > 1) {
                    return(factor.function(x, prod.split, collapse, sort.factorizing, sort.factorized))
                }
                else {
                    return(NULL)
                }
            })
            names(result) <- unlist(lapply(expression$solution, paste, collapse=" + "))
        }
    }
    else if (is.deMorgan(expression)) {
        
        if (names(expression)[1] == "S1") {
            result <- lapply(expression, function(x) {
                factor.function(x[[2]], prod.split, collapse, sort.factorizing, sort.factorized)
            })
            
            names(result) <- unlist(lapply(expression, function(x) {
                paste(x[[2]], collapse = " + ")
            }))
        }
        else {
            result <- list(lapply(expression, function(x) {
                int.result <- lapply(x, function(y) {
                    factor.function(y[[2]], prod.split, collapse, sort.factorizing, sort.factorized)
                })
                
                names(int.result) <- unlist(lapply(x, function(y) {
                    paste(y[[2]], collapse = " + ")
                }))
                
                return(int.result)
            }))
            names(result) <- "i.sol"
            names(result$i.sol) <- paste(names(result$i.sol), "N", sep="")
        }
        
    }
    else if (is.character(expression) & length(expression) == 1) {
        trimmed.str <- trimst(unlist(strsplit(expression, "\\+")))
        
        if (prod.split != "") {
            if (!grepl(prod.split, expression)) {
                cat("\n")
                stop("The product operator \"", prod.split, "\" was not found.\n\n", call. = FALSE)
            }
        }
        else {
            nonchars <- getNonChars(trimmed.str)
            if (length(nonchars) > 0) {
                if (length(nonchars) > 1) {
                    cat("\n")
                    stop(paste("Multiple non alphanumeric characters found: \"", paste(nonchars, collapse=""), "\".\n\n", sep=""), call. = FALSE)
                }
                collapse <- nonchars
                prod.split <- paste("\\", nonchars, sep="")
            }
        }
        
        if (length(trimmed.str) == 1) {
            result <- list(expression)
            names(result) <- expression
        }
        else {
            result <- factor.function(trimmed.str, prod.split, collapse, sort.factorizing, sort.factorized)
            
            if (pos) {
                
            }
            else {
                result <- list(result)
                names(result) <- expression
            }
            
            
        }
    }
    
    return(structure(result, class="fctr"))
}

