`pof` <-
function(setms, outcome, data, neg.out=FALSE, relation = "nec",
         inf.test = "", incl.cut1 = 0.75, incl.cut0 = 0.5, add = "", ...) {
    
    funargs <- lapply(match.call(expand.dots = TRUE), deparse)
    other.args <- list(...)
    
    recursive <- "recursive" %in% names(other.args)
    via.eqmcc <- "via.eqmcc" %in% names(other.args)
    force.rows <- "force.rows" %in% names(other.args)
    
    outnegated <- identical(substr(funargs$outcome, 1, 4), "1 - ")
    condnegated <- identical(substr(funargs$setms, 1, 4), "1 - ")
        
    if (recursive) {
        mins <- other.args$mins
        outcome <- other.args$vo
        sum.outcome <- other.args$so
        pims <- other.args$pims
        incl.cov <- matrix(NA, nrow=ncol(mins), ncol=4)
    }
    else {
        outcomename <- "Y" # a generic name in case nothing else is found
        
        if (!missing(data)) {
            if (is.data.frame(data)) {
                colnames(data) <- toupper(colnames(data))
            }
        }
        
        error <- FALSE
            
        if (all(is.character(outcome)) & length(outcome) == 1) {
            if (missing(data)) {
                cat("\n")
                stop("The data argument is missing, with no default.\n\n", call. = FALSE)
            }
            else {
                if (grepl("[{]", outcome)) { # there is a "{" sign in the outcome's name
                    outcome <- unlist(strsplit(outcome, split = ""))
                    outcome.value <- as.numeric(outcome[which(outcome == "{") + 1])
                    outcome <- paste(outcome[seq(1, which(outcome == "{") - 1)], collapse="")
                    
                    if (!any(unique(data[, outcome]) == outcome.value)) {
                        cat("\n")
                        stop(paste("The value {", outcome.value, "} does not exist in the outcome.\n\n", sep=""), call. = FALSE)
                    }
                    data[, outcome] <- ifelse(data[, outcome] == outcome.value, 1, 0)
                }
                
                outcomename <- toupper(outcome)
                outcome <- data[, toupper(outcome)]
                
            }
        }
        else if (is.vector(outcome)) {
            
            funargs$outcome <- gsub("1 - ", "", funargs$outcome)
            
            outsplit <- unlist(strsplit(funargs$outcome, split=""))
            startpos <- 0
            lastchar <- ""
            
            if (any(outsplit == "]")) {
                startpos <- max(which(outsplit == "]"))
                lastchar <- "]"
            }
            
            
            if (any(outsplit == "$")) {
                sp <- max(which(outsplit == "$"))
                if (sp > startpos) {
                    startpos <- sp
                    lastchar <- "$"
                }
            }
            
            if (identical(lastchar, "")) {
                outcomename <- toupper(funargs$outcome)
            }
            else if (identical(lastchar, "$")) {
                outcomename <- toupper(substr(funargs$outcome, startpos + 1, 10000))
            }
            else {
                # lastchar is "]"
                # this is a matrix or a list
                # determine where the indexing starts
                stindex <- max(which(outsplit == "["))
                
                # ptn = possibly the name
                ptn <- substr(funargs$outcome, stindex + 1, 10000)
                ptn <- gsub("\"", "", gsub("]", "", ptn))
                
                # determine if what remains is a number or a name
                if (is.na(suppressWarnings(as.numeric(ptn)))) {
                    # it's a name
                    outcomename <- toupper(ptn)
                    
                }
                else {
                    # it's a number (an index)
                    # see if it has column names
                    
                    stopindex <- ifelse(identical(outsplit[stindex - 1], "["), stindex - 2, stindex - 1)
                    cols <- eval.parent(parse(text=paste("colnames(", substr(funargs$outcome, 1, stopindex), ")", sep="")))
                    if (!is.null(cols)) {
                        outcomename <- toupper(cols[as.numeric(ptn)])
                    }
                }
            }
        }
        else {
            cat("\n")
            stop("The outcome should be either a column name in a dataset\n       or a vector of set membership values.\n\n", call. = FALSE)
        }
        
        
        if (!(relation %in% c("necessity", "sufficiency", "suf", "nec"))) {
            cat("\n")
            stop("The relationship should be either \"necessity\" or \"sufficiency\".\n\n", call. = FALSE)
        }
        
        
        if (!missing(data)) {
            
            if (length(outcome) != nrow(data)) {
                cat("\n")
                stop("The outcome's length should be the same as the number of rows in the data.\n\n", call. = FALSE)
            }
            
            
            if (any(outcomename %in% names(data))) {
                noflevels <- truthTable(data, outcome=outcomename, via.pof=TRUE)
            }
            else {
                cat("\n")
                stop("The outcome was not found in the data.\n\n", call. = FALSE)
            }
            
            colnames(data) <- toupper(colnames(data))
            outcomename <- toupper(outcomename)
            conditions <- colnames(data)[-which(colnames(data) == outcomename)]
            data <- data[, c(conditions, outcomename)]
        }
        
        pims <- FALSE
        
        if (is.data.frame(setms)) {
            if (missing(outcome)) {
                cat("\n")
                stop("Outcome is missing, with no default.\n\n", call. = FALSE)
            }
            else {
                # colnames(setms) <- toupper(colnames(setms))
                # conditions <- toupper(colnames(setms))
                conditions <- colnames(setms)
                
                if (missing(data)) { # outcome was already checked to be (or coerced to) a vector
                    if (nrow(setms) == length(outcome)) {
                        newdata <- cbind(setms, outcome)
                        colnames(newdata)[ncol(newdata)] <- outcomename
                        pims <- TRUE
                        
                    }
                    else {
                        cat("\n")
                        stop("The length of outcome should be the same as the number of rows in \"setms\".\n\n", call. = FALSE)
                    }
                }
                else {
                    
                    if (nrow(setms) == nrow(data)) {
                        data <- cbind(setms, outcome)
                        # colnames(data)[ncol(data)] <- toupper(outcomename)
                        pims <- TRUE
                    }
                    else {
                        cat("\n")
                        stop("The number of rows in \"setms\" should be the same as the number of rows in the data.\n\n", call. = FALSE)
                    }
                }
            }
        }
        else if (is.matrix(setms)) {
            
            if (missing(data)) {
                cat("\n")
                stop("The data argument is missing, with no default.\n\n", call. = FALSE)
            }
            
            if (ncol(setms) == length(conditions)) {
                setms[setms < 0] <- -1
                setms <- setms + 1
            }
            else {
                cat("\n")
                stop("The number of columns in the \"setms\" does not match the number of conditions.\n\n", call. = FALSE)
            }
        }
        else if (is.vector(setms)) {
            setms <- suppressWarnings(as.numeric(setms))
            setms <- setms[!is.na(setms)]
            
            if (length(setms) == 0) {
                cat("\n")
                stop("The \"setms\" argument does not contain any numbers.\n\n", call. = FALSE)
            }
            
            if (force.rows) {
                if (missing(data)) {
                    cat("\n")
                    stop("The data argument is missing, with no default.\n\n", call. = FALSE)
                }
                
                if (any(table(setms) > 1) | any(setms == 0)) {
                    cat("\n")
                    stop("The \"setms\" argument does not appear to be a vector of row numbers.\n\n", call. = FALSE)
                }
                
                setms <- getRow(noflevels + 1, setms)
                
            }
            else {
                if (length(setms) == length(outcome)) {
                    if (all(setms >= 0 & setms <= 1) | any(table(setms) > 1)) {
                        newdata <- cbind(setms, outcome)
                        
                        conditions <- "X" # a generic name in case nothing else is found
                        funargs$setms <- gsub("1 - ", "", funargs$setms)
                        
                        condsplit <- unlist(strsplit(funargs$setms, split=""))
                        
                        startpos <- 0
                        lastchar <- ""
                        
                        if (any(condsplit == "]")) {
                            startpos <- max(which(condsplit == "]"))
                            lastchar <- "]"
                        }
                        
                        
                        if (any(condsplit == "$")) {
                            sp <- max(which(condsplit == "$"))
                            if (sp > startpos) {
                                startpos <- sp
                                lastchar <- "$"
                            }
                        }
                        
                        # if (identical(lastchar, "")) {
                        #     conditions <- toupper(funargs$setms)
                        # }
                        # else
                        if (identical(lastchar, "$")) {
                            # conditions <- toupper(substr(funargs$setms, startpos + 1, 10000))
                            conditions <- substr(funargs$setms, startpos + 1, 10000)
                        }
                        else if (identical(lastchar, "]")) {
                            
                            # lastchar is "]"
                            # this is a matrix or a list
                            # determine where the indexing starts
                            stindex <- max(which(condsplit == "["))
                            
                            # ptn = possibly the name
                            ptn <- substr(funargs$setms, stindex + 1, 10000)
                            ptn <- gsub("\"", "", gsub("]", "", ptn))
                            
                            # determine if what remains is a number or a name
                            if (is.na(suppressWarnings(as.numeric(ptn)))) {
                                # it's a name
                                # conditions <- toupper(ptn)
                                conditions <- ptn
                                
                            }
                            else {
                                # it's a number (an index)
                                # see if it has column names
                                
                                stopindex <- ifelse(identical(condsplit[stindex - 1], "["), stindex - 2, stindex - 1)
                                cols <- eval.parent(parse(text=paste("colnames(", substr(funargs$setms, 1, stopindex), ")", sep="")))
                                if (!is.null(cols)) {
                                    # conditions <- toupper(cols[as.numeric(ptn)])
                                    conditions <- cols[as.numeric(ptn)]
                                }
                            }
                        }
                        
                        conditions <- gsub(",", "", gsub(" ", "", conditions))
                        
                        # colnames(newdata) <- toupper(c(conditions, outcomename))
                        colnames(newdata) <- c(conditions, outcomename)
                        pims <- TRUE
                    }
                    else {
                        if (any(setms > 5)) {
                            cat("\n")
                            stop("Assuming this is a vector of row numbers, data argument is missing with no default (try force.rows = TRUE).\n\n", call. = FALSE)
                        }
                    }
                }
                else {
                    if (missing(data)) {
                        cat("\n")
                        stop("Data argument is missing, or the length of \"setms\" is not equal to the length of outcome.\n\n", call. = FALSE)
                    }
                    else {
                        setms <- getRow(noflevels + 1, setms)
                    }
                }
            }
        }
        else {
            cat("\n")
            stop("The \"setms\" argument is not correct.\n\n", call. = FALSE)
        }
        
        if (missing(data)) {
            data <- as.data.frame(newdata)
            noflevels <- truthTable(data, outcome=outcomename, via.pof=TRUE)
        }
        
        if (is.matrix(setms)) { # necessary here and not above because setms might be a vector and then transformed into a matrix via getRow()
            if (is.null(colnames(setms))) {
                colnames(setms) <- toupper(conditions)
            }
            
            if (is.null(rownames(setms))) {
                use.tilde <- FALSE
                if ("use.tilde" %in% names(other.args)) {
                    rownames(setms) <- writePrimeimp(setms, uplow=all(noflevels == 2), use.tilde=other.args$use.tilde)
                }
                else {
                    rownames(setms) <- writePrimeimp(setms, uplow=all(noflevels == 2))
                }
                
                rownames(setms) <- gsub("NA\\*", "", rownames(setms))
            }
        }
        
        
        hastime <- logical(length(conditions))
        for (i in seq(length(conditions))) {
            if (any(data[, i] %in% c("-", "dc", "?"))) {
                hastime[i] <- TRUE
            }
        }
        
        
        if (!pims) {
            setms <- setms[, !hastime, drop=FALSE]
        }
        
        data[, which(hastime)] <- NULL
        conditions <- conditions[!hastime]
        
        if (neg.out) {
            outcome <- 1 - outcome
        }
        sum.outcome <- sum(outcome)
        
        if (pims) {
            mins <- setms
            
            if (is.vector(setms)) {
                length.expr <- 1
            }
            else {
                length.expr <- ncol(mins)
            }
            incl.cov <- matrix(NA, nrow=length.expr, ncol=4)
        }
        else {
            
            fc <- apply(data[, conditions], 2, function(x) any(x %% 1 > 0))
            incl.cov <- matrix(NA, nrow=nrow(setms), ncol=4)
            
            length.expr <- nrow(setms)
            
            mins <- apply(setms, 1, function(e) {
                apply(data[, conditions, drop=FALSE], 1, function(v) {
                    
                    if (any(ox <- e[fc] == 1)) {
                        v[fc][ox] <- 1 - v[fc][ox]
                    }
                    
                    if (length(cp <- v[!fc]) > 0) {
                        v[!fc][e[!fc] != cp + 1] <- 0
                        v[!fc][e[!fc] == cp + 1] <- 1
                    }
                    
                    return(min(v[e != 0]))
                })
            })
            
            if (!is.matrix(mins)) { ## bug fix 10.03.2014, if the data contains a single combination, mins is not a matrix but a vector
                mins <- t(as.matrix(mins))
                rownames(mins) <- rownames(data)
            }
        }
    }
    
    
    if (is.vector(mins)) {
        mins <- as.data.frame(mins)
        colnames(mins) <- conditions
    }
    
    
    colnames(mins) <- gsub(", ", "", colnames(mins))
    
    if (condnegated) {
        
        if (any(grepl("\\*", colnames(mins)))) {
            # test if the object to be negated is a condition name
            rownames(incl.cov) <- unlist(lapply(lapply(colnames(mins), deMorgan, use.tilde=any(grepl("~", colnames(mins))), prod.split="*"), function(x) {
                return(paste(x[[1]][[2]], collapse="+"))
            }))
        }
        else {
            
            if ("conditions" %in% names(other.args)) {
                conds <- other.args$conditions
                if (length(conds) == 1 & length(colnames(mins)) > 1) {
                    conds <- splitstr(conds)
                }
            }
            else {
                conds <- conditions
            }
            
            # test if the object to be negated is a product of single letter conditions
            if (all(toupper(unique(unlist(strsplit(colnames(mins), split="")))) %in% toupper(conds))) {
                rownames(incl.cov) <- unlist(lapply(lapply(colnames(mins), deMorgan, use.tilde=any(grepl("~", colnames(mins)))), function(x) {
                    return(paste(x[[1]][[2]], collapse="+"))
                }))
            }
            else {
                # cannot determine what it is, simply negate it with a tilde
                rownames(incl.cov) <- paste("~", colnames(mins))
            }
        }     
        
    }
    else {
        rownames(incl.cov) <- colnames(mins)
    }
    
    colnames(incl.cov) <- c("incl", "PRI", "cov.r", "cov.u")
    
    
    # for the moment, ron only but more can be added in the future
    optional.measures <- c("ron")
    optionals <- matrix(NA, nrow = nrow(incl.cov), ncol = length(optional.measures))
    colnames(optionals) <- optional.measures
    rownames(optionals) <- rownames(incl.cov)
    
    
    
    pmins <- apply(mins, 2, pmin, outcome)
    primins <- apply(mins, 2, function(x) pmin(x, 1 - outcome, outcome))
    
    if (relation %in% c("necessity", "nec")) {
        primins <- apply(mins, 2, function(x) pmin(x, 1 - x, outcome))
    }
    
    if (!is.matrix(pmins)) { ## bug fix 10.03.2014, if the data contains a single combination, pmins is not a matrix but a vector
        pmins <- t(as.matrix(pmins))
        rownames(pmins) <- rownames(mins)
                ## probably the very same thing happens to primins
        primins <- t(as.matrix(primins))
        rownames(primins) <- rownames(mins)
    }
    
    
    incl.cov[, 1] <- colSums(pmins)/colSums(mins)
    incl.cov[, 2] <- (colSums(pmins) - colSums(primins))/(colSums(mins) - colSums(primins))
    incl.cov[, 3] <- colSums(pmins)/sum.outcome
    
    
    if (relation %in% c("necessity", "nec")) {
        incl.cov[, 1] <- colSums(pmins)/sum.outcome
        incl.cov[, 2] <- (colSums(pmins) - colSums(primins))/(sum.outcome - colSums(primins))
        incl.cov[, 3] <- colSums(pmins)/colSums(mins)
        optionals[, "ron"] <- colSums(1 - mins)/colSums(1 - pmins)
    }
    
    
    maxmins <- fuzzyor(mins) # union
    inclusions <- fuzzyor(pmins)
    prisol <- pmin(maxmins, 1 - outcome, outcome)
    
    if (relation %in% c("necessity", "nec")) {
        prisol <- pmin(maxmins, 1 - maxmins, outcome)
    }
    
    if (ncol(mins) > 1) {
        for (i in seq(nrow(incl.cov))) {
            incl.cov[i, 4] <- incl.cov[i, 3] - sum(pmin(pmins[, i], fuzzyor(pmins[, -i]), outcome))/sum.outcome
        }
    }
    
    
    # solution incl, pri and cov
    sol.incl <- sum(inclusions)/sum(maxmins)
    sol.pri <- (sum(inclusions) - sum(prisol))/(sum(maxmins) - sum(prisol))
    sum.cov <- sum(inclusions)/sum.outcome
    
    
    result.list <- list(incl.cov=as.data.frame(incl.cov, stringsAsFactors = FALSE), relation=relation)
    
    if (!pims & via.eqmcc) {
        result.list$sol.incl.cov <- c(incl=sol.incl, PRI=sol.pri, cov=sum.cov)
        result.list$pims <- as.data.frame(mins)
    }
    
    if ("recursive" %in% names(other.args)) {
        return(result.list)
    }
    
    # showc is not a formal argument, therefore is it initiated as FALSE
    showc <- FALSE
    
    if (all(inf.test != "")) {
        verify.inf.test(inf.test, data)
    }
    
    if (identical(inf.test, "binom")) {
        
        statistical.testing <- TRUE
        
        if ("incl.cut1" %in% names(other.args)) {
            incl.cut1 <- as.numeric(other.args$incl.cut1)
        }
        
        if ("incl.cut0" %in% names(other.args)) {
            incl.cut0 <- as.numeric(other.args$incl.cut0)
        }
        
        if (length(inf.test) > 1) {
            alpha <- as.numeric(inf.test[2]) # already checked if a number between 0 and 1
        }
        else {
            alpha <- 0.05
        }
        
        incl.cov <- as.data.frame(incl.cov, stringsAsFactors = FALSE)
        
        if (relation  %in% c("necessity", "nec")) {
            nofcases <- rep(sum.outcome, ncol(mins))
        }
        else {
            nofcases <- colSums(mins)
        }
        
        success <- as.vector(round(nofcases * as.numeric(incl.cov[, "incl"])))
        
        incl.cov$pval0 <- incl.cov$pval1 <- 0
        
        for (i in seq(length(success))) {
            incl.cov[i, "pval1"] <- binom.test(success[i], nofcases[i], p = incl.cut1, alternative = "less")$p.value
            incl.cov[i, "pval0"] <- binom.test(success[i], nofcases[i], p = incl.cut0, alternative = "greater")$p.value
        }
        
        result.list$incl.cov <- incl.cov
    }
    
    # incl.cov <- incl.cov[, c("incl", "cov.r", "cov.u", "PRI")]
    
    if ("showc" %in% names(other.args)) {
        if (other.args$showc) {
            showc <- other.args$showc
            result.list$incl.cov <- cbind(result.list$incl.cov, cases = other.args$cases, stringsAsFactors=FALSE)
        }
    }
    
    if ("solution.list" %in% names(other.args)) {
        solution.list <- other.args$solution.list
        length.solution <- length(solution.list)
        individual <- vector("list", length=length.solution)
        
        for (i in seq(length.solution)) {
            individual[[i]] <- Recall(relation="sufficiency", recursive=TRUE, via.eqmcc=TRUE,
                                      mins=mins[, solution.list[[i]], drop=FALSE],
                                      vo=outcome, so=sum.outcome, pims=pims, add=add)
        }
        return(structure(list(overall=result.list, individual=individual, essential=other.args$essential, pims=as.data.frame(mins), relation=relation, options=funargs[-1]), class="pof"))
    }
    else {
        result.list$options <- funargs[-1]
        result.list$optionals <- optionals
        result.list$options$ron <- FALSE
        if ("ron" %in% names(other.args)) {
            if (is.logical(other.args$ron)) {
                if (other.args$ron & relation %in% c("necessity", "nec")) {
                    result.list$options$ron <- TRUE
                }
            }
        }
        
        if (!identical(add, "") & is.character(add)) {
            add <- splitstr(add)
            if (any(add == "ron") & relation %in% c("necessity", "nec")) {
                result.list$options$ron <- TRUE
            }
        }
        
        return(structure(result.list, class="pof"))
    }   
}

