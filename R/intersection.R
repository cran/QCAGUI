`intersection` <-
function(e1 = "", e2 = "", prod.split = "", conditions = "") {
    
    if (grepl("\\{", e1) | grepl("\\{", e2)) {
        cat("\n")
        stop("This function accepts only bivalent crisp expressions.\n\n", call. = FALSE)
    }
    
    if (prod.split == "" & (grepl("\\*", e1) | grepl("\\*", e2))) {
        prod.split <- "*"
    }
    
    if (prod.split != "" & prod.split != "*") {
        if (!grepl(prod.split, e1) & !grepl(prod.split, e2)) {
            cat("\n")
            stop("The product operator \"", prod.split, "\" was not found.\n\n", call. = FALSE)
        }
    }
    
    
    e1 <- getBigList(e1, prod.split)
    e2 <- getBigList(e2, prod.split)
    
    result <- list()
    
    if (!identical(conditions, "")) {
        conditions <- splitstr(conditions)
    }
    
    for (i in seq(length(e1))) {
        for (j in seq(length(e2))) {
            
            aa <- unlist(lapply(e1[[i]], function(x) {
                if (any(x == "~")) {
                    return(tolower(x[x != "~"]))
                }
                else {
                    return(x)
                }
            }))
            
            bb <- unlist(lapply(e2[[j]], function(x) {
                if (any(x == "~")) {
                    return(tolower(x[x != "~"]))
                }
                else {
                    return(x)
                }
            }))
            
            if (all(table(toupper(unique(c(aa, bb)))) == 1)) {
                
                templist <- c(e1[[i]], e2[[j]])
                
                names(templist) <- c(aa, bb)
                
                templist <- templist[unique(c(aa, bb))]
                aa <- names(templist)
                
                if (!identical(conditions, "")) {
                    templist <- templist[order(match(toupper(aa), toupper(conditions)))]
                    templist <- unlist(lapply(templist, paste0))
                }
                else {
                    templist <- templist[order(aa)]
                    templist <- unlist(lapply(templist, paste0))
                }
                
                result[[length(result) + 1]] <- paste(templist, collapse=prod.split)
                
            }
        }
    }
    
    return(paste(unique(unlist(result)), collapse=" + "))
    
}
