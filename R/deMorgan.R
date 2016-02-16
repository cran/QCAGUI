`deMorgan` <-
function(expression, prod.split = "", use.tilde = FALSE, complete = TRUE) {
    
    if (class(expression) == "deMorgan") {
        expression <- paste(expression[[1]][[2]], collapse = " + ")
    }
    
    if (is.qca(expression)) {
        result <- deMorganLoop(expression)
        
        attr(result, "snames") <- expression$tt$options$conditions
        
    }
    else if (is.character(expression) & length(expression) == 1) {
        
        initial <- expression
        
        if (grepl("\\{|\\}", expression)) {
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
        
        negated.string <- paste(unlist(lapply(negateValues(big.list, tilda, use.tilde), function(x) {
            paste(unlist(lapply(x, paste, collapse = "")), collapse = " + ")
        })), collapse = ")(")
        
        if (length(big.list) > 1) {
            negated.string <- paste("(", negated.string,")", sep="")
        }
        
        if (complete) {
        
            if (!grepl("\\+", negated.string)) {
                negated <- gsub("\\)|\\(|\\)\\(", prod.split, negated.string)
                result <- list(S1 = list(initial, negated))
            }
            else {
            
                big.list <- getBigList(negated.string, prod.split)
                
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
        else {
            result <- list(S1 = list(initial, negated.string))
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




