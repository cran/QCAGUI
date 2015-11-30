`deMorgan` <-
function(expression, prod.split = "", use.tilde = FALSE) {
    
    # TO DO: capture and error the usage of both "cD" and "D*E" in the same expression 
    
    
    
        
    if (class(expression) == "deMorgan") {
        expression <- paste(expression[[1]][[2]], collapse = " + ")
    }
    
        
    if (is.qca(expression)) {
        result <- deMorganLoop(expression)
    }
    else if (is.character(expression) & length(expression) == 1) {
        
        initial <- expression
        
        
        # STRUCTURE of the big.list
        
        # level 1: split by separate components
            # "A + B(C + D*~E)" has two components "A" and "B(C + D*~E)"
        
        # level 2: split by brackets
            # "B(C + D*~E)" has "B" and "C + D*~E"
        
        # level 3: split by "+"
            # "C + D*~E" has "C" and "D*~E"
        
        # level 4: split by "*"
            # "D*~E" has "D" and "~E"
        
        # level 5: split by "~" (the result is only a vector, not a list)
            # "~E" has "~" and "E"
        
        
        
        
        if (grepl("\\{", expression)) {
            if (grepl("~", expression)) {
                cat("\n")
                stop("Impossible combination of both \"~\" and \"{}\" multi-value notation.\n\n", call. = FALSE)
            }
            use.tilde <- FALSE
        }
        
        if (prod.split == "" & grepl("\\*", expression)) {
            # cat("\n")
            # stop("The \"*\" symbol was found: consider using the argument prod.split = \"*\".\n\n", call. = FALSE)
            prod.split <- "*"
        }
        
        if (prod.split != "" & prod.split != "*") {
            if (!grepl(prod.split, expression)) {
                cat("\n")
                stop("The product operator \"", prod.split, "\" was not found.\n\n", call. = FALSE)
            }
        }
        
        
        # big.list <- splitMainComponents(expression)
        # big.list <- splitBrackets(big.list)
        # big.list <- removeSingleStars(big.list)
        # big.list <- splitPluses(big.list)
        # big.list <- splitStars(big.list, prod.split)
        # big.list <- splitTildas(big.list)
        # big.list <- solveBrackets(big.list)
        # big.list <- simplifyList(big.list)
        
        # big.list <- simplifyList(solveBrackets(splitTildas(splitStars(splitPluses(removeSingleStars(splitBrackets(splitMainComponents(expression)))), prod.split))))
        big.list <- getBigList(expression, prod.split)
        
        flat.vector <- unlist(big.list)
        unique.values <- unique(flat.vector)
        
        already.letters <- all(nchar(unique.values) == 1)
        
        tilda <- ifelse(any(flat.vector == "~"), TRUE, FALSE)
        
        if (tilda) {
            use.tilde <- TRUE
        }
        
        if (tilda & prod.split == "" & any(toupper(flat.vector) != flat.vector)) {
            cat("\n")
            stop("Unusual usage of both \"~\" sign and lower letters.\n\n", call. = FALSE)
        }
        
        negated.string <- paste("(", paste(unlist(lapply(negateValues(big.list, tilda, use.tilde), function(x) {
            paste(unlist(lapply(x, paste, collapse = "")), collapse = " + ")
        })), collapse = ")("), ")", sep="")
        
        if (!grepl("\\+", negated.string)) {
            negated <- gsub("\\)", "", gsub("\\(", "", gsub("\\)\\(", prod.split, negated.string)))
            result <- list(S1 = list(initial, negated))
        }
        else {
        
            big.list <- getBigList(negated.string, prod.split)
            
            # big.list <- splitMainComponents(negated.string)
            # big.list <- splitBrackets(big.list)
            # big.list <- removeSingleStars(big.list)
            # big.list <- splitPluses(big.list)
            # big.list <- splitStars(big.list)
            # big.list <- splitTildas(big.list)
            # big.list <- solveBrackets(big.list)
            # big.list <- simplifyList(big.list)
            
            negated <- unlist(lapply(removeDuplicates(big.list), function(x) {
                copyx <- unlist(lapply(x, function(y) {
                    y <- y[y != "~"]
                }))
                x <- x[order(copyx)]
                paste(unlist(lapply(x, paste, collapse="")), collapse = prod.split)
            }))
            
            result <- list(S1 = list(initial, negated))
        }
        
    }
    
    return(structure(result, class = "deMorgan"))
}





`deMorganLoop` <-
function(qca.object) {
    prod.split <- qca.object$options$collapse
    
    if ("i.sol" %in% names(qca.object)) {
        result <- vector("list", length=length(qca.object$i.sol))
        for (i in seq(length(qca.object$i.sol))) {
            names(result) <- names(qca.object$i.sol)
            result[[i]] <- lapply(qca.object$i.sol[[i]]$solution, paste, collapse = " + ")
            for (j in length(result[[i]])) {
                result[[i]][j] <- deMorgan(result[[i]][[j]], prod.split)
            }
        }
    }
    else {
        result <- lapply(lapply(qca.object$solution, paste, collapse = " + "), function(x) {
            deMorgan(x, prod.split)[[1]]
        })
        names(result) <- paste("S", seq(length(result)), sep="")
    }
    return(result)
}




