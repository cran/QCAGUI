`translate` <-
function(expression = "", snames = "") {
    
    if (identical(expression, "")) {
        cat("\n")
        stop("Empty expression.\n\n", call. = FALSE)
    }
    
    if (grepl("<=>", expression) | grepl("=>", expression) | grepl("<=", expression)) {
        cat("\n")
        stop("Incorrect expression.\n\n", call. = FALSE)
    }
    
    if (!is.vector(snames)) {
        cat("\n")
        stop("Set names should be a single string or a vector of names.\n\n", call. = FALSE)
    }
    
    if (!identical(snames, "")) {
        snames <- toupper(splitstr(snames))
    }
    
    
    multivalue <- grepl("\\{|\\}", expression)
    
    if (multivalue) {
        expression <- gsub("\\*", "", expression)
        
        # check to see if opened brackets have closing brackets
        if (length(unlist(gregexpr("\\{+", expression))) != length(unlist(gregexpr("\\}+", expression)))) {
            cat("\n")
            stop("Incorrect expression, opened and closed brackets don't match.\n\n", call. = FALSE)
        }
    }
    
    
    pporig <- trimst(unlist(strsplit(gsub("\\(|\\)", "", expression), split="\\+")))
    expression <- gsub("[[:space:] \\( \\)]", "", expression)
    
    tempexpr <- gsub("\\*|,|;", "", expression)
    
    if (multivalue) {
        expression <- toupper(expression)
        insb <- curlyBrackets(tempexpr)
        tempexpr <- curlyBrackets(tempexpr, outside=TRUE)
        
        if (length(insb) != length(tempexpr)) {
            cat("\n")
            stop("Incorrect expression, some snames don't have brackets.\n\n", call. = FALSE)
        }
    }
    
    pp <- unlist(strsplit(expression, split="\\+"))
    
    
    if (multivalue) {
        conds <- sort(unique(toupper(gsub("~", "", curlyBrackets(pp, outside=TRUE)))))
        
        if (!identical(snames, "")) {
            if (all(gsub("~", "", conds) %in% snames)) {
                conds <- snames
            }
            else {
                cat("\n")
                stop("Parts of the expression don't match the set names from \"snames\" argument.\n\n", call. = FALSE)
            }
        }
        
        retmat <- matrix(0, nrow=length(pp), ncol=length(conds))
        rownames(retmat) <- pporig
        colnames(retmat) <- conds
        values <- matrix("", nrow=length(pp), ncol=length(conds))
        rownames(values) <- pporig
        colnames(values) <- conds
        
        
        
        for (i in seq_along(pp)) {
        
            x <- toupper(curlyBrackets(pp[i], outside=TRUE))
            
            if (any(duplicated(toupper(x)))) {
                cat("\n")
                stop("Duplicated names in the same product.\n\n", call. = FALSE)
            }
            
            y <- curlyBrackets(pp[i])
            
            matched <- logical(length(x))
            
            for (j in seq(length(x))) {
                matched[j] <- all(splitstr(y[j]) != 0)
                if (grepl("~", x[j])) {
                    matched[j] <- !matched[j]
                    y[j] <- paste("~", y[j], sep="")
                }
            }
            
            retmat[i, match(gsub("~", "", x), conds)] <- matched + 1
            values[i, match(gsub("~", "", x), conds)] <- y
        }
        
    }
    else {
        if (grepl("\\*", expression)) {
            conds <- sort(unique(toupper(gsub("~", "", unlist(strsplit(pp, split="\\*"))))))
            
            
            if (!identical(snames, "")) {
                if (all(gsub("~", "", conds) %in% snames)) {
                    conds <- snames
                }
                else {
                    cat("\n")
                    stop("Parts of the expression don't match the set names from \"snames\" argument.\n\n", call. = FALSE)
                }
            }
            
            retmat <- matrix(0, nrow=length(pp), ncol=length(conds))
            rownames(retmat) <- pporig
            colnames(retmat) <- conds
            negation <- retmat
            
            for (i in seq_along(pp)) {
                x <- unlist(strsplit(pp[i], split="\\*"))
                cols <- toupper(gsub("~", "", x))
                
                if (any(duplicated(cols))) {
                    cat("\n")
                    stop("Duplicated names in the same product.\n\n", call. = FALSE)
                }
                
                if (!all(cols %in% conds)) {
                    cat("\n")
                    stop("Parts of the expression don't match the set names from \"snames\" argument.\n\n", call. = FALSE)
                }
                
                cols <- match(cols, conds)
                retmat[i, cols] <- as.numeric(gsub("~", "", x) %in% conds) + 1
                negation[i, cols] <- as.numeric(grepl("~", x))
            }
        }
        else {
            conds <- unique(toupper(gsub("~", "", pp)))
            
            if (all(nchar(conds) == 1)) {
                
                if (!identical(snames, "")) {
                    if (all(conds %in% snames)) {
                        conds <- snames
                    }
                    else {
                        cat("\n")
                        stop("Parts of the expression don't match the set names from \"snames\" argument.\n\n", call. = FALSE)
                    }
                }
                
                retmat <- matrix(0, nrow=length(pp), ncol=length(conds))
                rownames(retmat) <- pporig
                colnames(retmat) <- conds
                negation <- retmat
                
                for (i in seq_along(pp)) {
                    retmat[i, match(toupper(gsub("~", "", pp[i])), conds)] <- as.numeric(gsub("~", "", pp[i]) %in% conds) + 1
                    negation[i, match(toupper(gsub("~", "", pp[i])), conds)] <- as.numeric(grepl("~", pp[i]))
                }
                
            }
            else {
                if (identical(snames, "")) {
                    cat("\n")
                    stop("Unable to translate without the set name(s).\n\n", call. = FALSE)
                }
                
                retmat <- matrix(0, nrow=length(pp), ncol=length(snames))
                rownames(retmat) <- pporig
                colnames(retmat) <- snames
                negation <- retmat
                
                if (all(toupper(gsub("~", "", pp)) %in% snames)) {
                    
                    for (i in seq_along(pp)) {
                        conds <- match(toupper(gsub("~", "", pp[i])), snames)
                        retmat[i, conds] <- as.numeric(gsub("~", "", pp[i]) %in% snames) + 1
                        negation[i, conds] <- as.numeric(grepl("~", pp[i]))
                    }
                }
                else {
                    
                    if (all(nchar(snames) == 1)) {
                            
                        for (i in seq_along(pp)) {
                        
                            x <- unlist(strsplit(pp[i], split=""))
                            
                            
                            if (any(x == "~")) {
                                y <- which(x == "~")
                                if (max(y) == length(x)) {
                                    cat("\n")
                                    stop("Incorrect expression, tilde not in place.\n\n", call. = FALSE)
                                }
                                x[y + 1] <- paste("~", x[y + 1], sep="")
                                x <- x[-y]
                            }
                            
                            cols <- toupper(gsub("~", "", x))
                            
                            if (any(duplicated(cols))) {
                                cat("\n")
                                stop("Duplicated names in the same product.\n\n", call. = FALSE)
                            }
                            
                            
                            if (!all(cols %in% snames)) {
                                cat("\n")
                                stop("Parts of the expression don't match the set names from \"snames\" argument.\n\n", call. = FALSE)
                            }
                            
                            for (j in seq_along(x)) {
                                retmat[i, match(cols[j], snames)] <- as.numeric(gsub("~", "", x[j]) %in% snames) + 1
                                negation[i, match(cols[j], snames)] <- as.numeric(grepl("~", x[j]))
                            }
                            
                        }
                        
                    }
                    else {
                        maybe <- logical(length(snames))
                        for (i in seq_along(snames)) {
                            maybe[i] <- grepl(snames[i], toupper(expression))
                        }
                        
                        snames <- snames[maybe]
                        
                        
                        if (length(snames) > 7) {
                            cat("\n")
                            stop("Too many causal snames' to search.\n\n", call. = FALSE)
                        }
                        
                        im <- createMatrix(rep(3, length(snames)))[-1, , drop = FALSE]
                        
                        mns <- matrix(nrow = 0, ncol = ncol(im))
                        
                        perms <- function(x) {
                            if (length(x) == 1) {
                                return(x)
                            }
                            else {
                                res <- matrix(nrow = 0, ncol = length(x))
                                for(i in seq_along(x)) {
                                    res <- rbind(res, cbind(x[i], Recall(x[-i])))
                                }
                                return(res)
                            }
                        }
                        
                        noflevels <- rep(3, length(snames))
                        
                        mns <- lapply(seq(2, 3^length(snames)), function(x) {
                            x <- getRow(noflevels, x)
                            snames[x == 1] <- tolower(snames[x == 1])
                            snames <- snames[x > 0]
                            
                            if (length(snames) > 1) {
                                return(perms(snames))
                            }
                            else {
                                return(matrix(snames, 1, 1))
                            }
                            
                        })
                        
                        
                        namespace <- matrix(nrow=0, ncol=1)
                        for (i in seq(length(mns))) {
                            temp <- matrix(apply(mns[[i]], 1, paste, collapse=""), ncol=1)
                            rownames(temp) <- paste(i, seq(nrow(temp)), sep="_")
                            namespace <- rbind(namespace, temp)
                        }
                        
                        
                        if (any(duplicated(namespace))) {
                            cat("\n")
                            stop("Impossible to translate: set names clash.\n\n", call. = FALSE)
                        }
                        
                        matched <- match(gsub("~", "", pp), namespace)
                        
                        if (any(is.na(matched))) {
                            cat("\n")
                            stop("Incorrect expression, unknown set names.\n\n", call. = FALSE)
                        }
                        
                        matched <- rownames(namespace)[matched]
                        
                        retmat <- matrix(0, length(pp), length(snames))
                        rownames(retmat) <- pporig
                        colnames(retmat) <- snames
                        negation <- retmat
                        
                        for (i in seq(length(matched))) {
                            id <- as.numeric(unlist(strsplit(matched[i], split="_")))
                            x <- mns[[id[1]]][id[2], ]
                            y <- rep(-1, length(snames))
                            y[match(toupper(x), snames)] <- as.numeric(x %in% snames)
                            retmat[i, ] <- y + 1
                        }
                        
                        for (i in seq_along(pp)) {
                            cplus <- which(retmat[i, ] != "")
                            for (j in cplus) {
                                tildefirst <- substring(pp[i], 1, 1) == "~"
                                negation[i, j] <- as.numeric(tildefirst)
                                pp[i] <- substring(pp[i], nchar(snames[j]) + 1 + 1*tildefirst)
                            }
                        }
                        
                    }
                    
                }
                
            }
            
        }
        
        
        for (i in seq(length(retmat))) {
            if (negation[i] == 1) {
                retmat[i] <- 3 - asNumeric(retmat[i])
            }
        }
        
        
    }
    
    if (multivalue) {
        attr(retmat, "mv") <- values[, colnames(retmat), drop = FALSE]
    }
    
    return(structure(retmat - 1, class = "translate"))
}
