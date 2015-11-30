`truthTable` <-
function(data, outcome = "", neg.out = FALSE, conditions = "", n.cut = 1,
         incl.cut1 = 1, incl.cut0 = 1, complete = FALSE, show.cases = FALSE,
         sort.by = c(""), use.letters = FALSE, inf.test = "", ...) {
    
    memcare <- FALSE # to be updated with a future version
    other.args <- list(...)
    via.pof <- "via.pof" %in% names(other.args)
    
    if (memcare) {
        complete <- FALSE
    }
    
    names(data) <- toupper(names(data))
    conditions <- toupper(conditions)
    outcome <- toupper(outcome)
    
    if (length(outcome) > 1) {
        cat("\n")
        stop("Only one outcome is allowed.\n\n", call. = FALSE)
    }
    
    outcome.copy <- outcome
    
    initial.data <- data
    
    if (grepl("[{]", outcome)) {
        outcome <- unlist(strsplit(outcome, split = ""))
        outcome.value <- as.numeric(outcome[which(outcome == "{") + 1])
        outcome <- paste(outcome[seq(1, which(outcome == "{") - 1)], collapse="")
        if (!any(unique(data[, outcome]) == outcome.value)) {
            cat("\n")
            stop(paste("The value {", outcome.value, "} does not exist in the outcome.\n\n", sep=""), call. = FALSE)
        }
        data[, outcome] <- ifelse(data[, outcome] == outcome.value, 1, 0)
    }
    
    if (identical(conditions, "")) {
        conditions <- names(data)[-which(names(data) == outcome)]
    }
    else {
        if (is.character(conditions) & length(conditions) == 1) {
            conditions <- splitstr(conditions)
        }
    }
    
    if (is.character(sort.by) & length(sort.by) == 1 & !identical(sort.by, "")) {
        sort.by <- splitstr(sort.by)
    }
    
    
    decreasing <- TRUE # just to set a default value
    if ("decreasing" %in% names(other.args)) {
        decreasing <- other.args$decreasing
    }
    
    if (is.character(decreasing) & length(decreasing) == 1) {
        decreasing <- splitstr(decreasing)
    }
    
    
    if (!identical(inf.test, "")) {
        inf.test <- splitstr(inf.test)
    }
    
    if (!via.pof) {
        verify.tt(data, outcome, conditions, complete, show.cases, incl.cut1, incl.cut0, inf.test)
    }
    
    data <- data[, c(conditions, outcome)]
    
    if (incl.cut0 > incl.cut1) {
        incl.cut0 <- incl.cut1
    }
    
    colnames(data) <- toupper(colnames(data))
    colnames(initial.data) <- toupper(colnames(initial.data))
    conditions <- toupper(conditions)
    outcome <- toupper(outcome)
    
    initial.data <- initial.data[, c(conditions, outcome)]
    
    
    if (neg.out) {
        data[, outcome] <- 1 - data[, outcome]
    }
    
    dc.code <- unique(unlist(lapply(data, function(x) {
        if (is.numeric(x)) {
            return(x[x < 0])
        }
        else {
            return(as.character(x[x %in% c("-", "dc")]))
        }
    })))
    
    if (length(dc.code) == 0) {
        dc.code <- -1
    }
    else if (length(dc.code) > 1) {
        cat("\n")
        stop("Multiple \"Don't care\" codes found.\n\n", call. = FALSE)
    }
    
    data <- as.data.frame(lapply(data, function(x) {
        x <- as.character(x)
        x[x == dc.code] <- -1
        return(suppressWarnings(as.numeric(x)))
    }))
    
    names(data) <- c(conditions, outcome)
    
    data[data < 0] <- -1
    rownames(data) <- rownames(initial.data)
    
    nofconditions <- length(conditions)
    fuzzy.cc <- apply(data[, conditions, drop=FALSE], 2, function(x) any(x %% 1 > 0))
    
    
    for (i in seq(length(conditions))) {
        if (!fuzzy.cc[i]) {
            copy.cc <- data[, i]
            if (any(copy.cc < 0)) {
                copy.cc[copy.cc < 0] <- max(copy.cc) + 1
                data[, i] <- copy.cc
            }
        }
    }
    
    # the data MUST begin with 0 and MUST be incremented by 1 for each level...!
    # perhaps trying something like
    # apply(data[, conditions], 2, function(x) length(unique(x))) + 1
    noflevels <- apply(data[, conditions, drop=FALSE], 2, max) + 1
    noflevels[noflevels == 1] <- 2
    noflevels[fuzzy.cc] <- 2
    
    
    if (via.pof) {
        return(as.vector(noflevels))
    }
    
    if (memcare) {
        mbase <- c(rev(cumprod(rev(noflevels))), 1)[-1]
        inclpri <- .Call("truthTableMem", as.matrix(data[, conditions]), noflevels, mbase, as.numeric(fuzzy.cc), data[, outcome], package="QCAGUI")
    }
    else {
        tt <- createMatrix(noflevels)
        inclpri <- .Call("truthTable", as.matrix(data[, conditions]), tt, as.numeric(fuzzy.cc), data[, outcome], package="QCAGUI")
    }
    
    colnames(inclpri[[1]]) <- seq_len(ncol(inclpri[[1]]))
    
    if ("SCTT" %in% names(other.args)) {
        copyinclpri <- inclpri
    }
    
    line.data <- inclpri[[2]]
    
    inclpri  <- inclpri[[1]][1:3, ]
    inclpri[is.na(inclpri)] <- NA
    
    preserve <- inclpri[3, ] >= n.cut
    
    outvalues <- as.numeric(inclpri[1, ] >= (incl.cut1 - .Machine$double.eps ^ 0.5))
    outvalues[inclpri[1, ] < incl.cut1 & inclpri[1, ] >= (incl.cut0 - .Machine$double.eps ^ 0.5)] <- "C"
    outvalues[inclpri[3, ] < n.cut] <- "?"
    
    tt <- as.data.frame(tt)
    colnames(tt) <- conditions
    tt$OUT <- outvalues
    tt$n <- inclpri[3, ]
    tt$incl <- inclpri[1, ]
    tt$PRI <- inclpri[2, ]
    
    
    cases <- rep("", nrow(tt))
    
    cases[outvalues != "?"] <- sapply(rownames(tt)[outvalues != "?"], function(x) {
        paste(rownames(data)[which(line.data == x)], collapse=",")
    })
    
    line.data[!line.data %in% colnames(inclpri)[preserve]] <- 0
    excluded <- line.data == 0
    
    
    if (memcare) {
        data[!excluded, conditions] <- getRow(noflevels, line.data[line.data > 0])
    }
    else {
        data[!excluded, conditions] <- tt[line.data[line.data > 0], conditions]
    }
    
    
    if (any(excluded)) {
        excluded.cases <- data[excluded, ]
    }
    
    
    if (!identical(sort.by, "")) {
        
        if (is.logical(sort.by)) { # & !is.null(names(sort.by)) # if logical, it should _always_ have names
            decreasing <- as.vector(sort.by)
            sort.by <- names(sort.by)
        }
        else {
            # just to make sure we _do_ have a "decreasing" object
            if (missing(decreasing)) {
                decreasing <- rep(TRUE, length(sort.by))
            }
            else {
                if (is.logical(decreasing)) {
                    if (length(decreasing) == 1) {
                        decreasing <- rep(decreasing, length(sort.by))
                    }
                    else if (length(decreasing) < length(sort.by)) {
                        decreasing <- c(decreasing, rep(TRUE, length(sort.by) - length(decreasing)))
                    }
                }
                else {
                    decreasing <- rep(TRUE, length(sort.by))
                }
            }
        }
        
        sort.by[sort.by == "out"] <- "OUT"
        
        decreasing <- decreasing[sort.by %in% names(tt)]
        sort.by <- sort.by[sort.by %in% names(tt)]
        
        
        rowsorder <- seq_len(nrow(tt))
        for (i in rev(seq(length(sort.by)))) {
            rowsorder <- rowsorder[order(tt[rowsorder, sort.by[i]], decreasing = decreasing[i])]
        }
        
        sortvector <- rep(1, nrow(tt))
        sortvector[tt[rowsorder, "OUT"] == "?"] <- 2
        rowsorder <- rowsorder[order(sortvector)]
        
    }
    
    
    tt$incl[is.na(tt$incl)] <- "-"
    tt$PRI[is.na(tt$PRI)] <- "-"
    
    
    
    for (i in seq(length(conditions))) {
        if (!fuzzy.cc[i]) {
            if (any(initial.data[, i] == dc.code)) {
                tt[, i][tt[, i] == max(tt[, i])] <- dc.code
                data[, i][data[, i] == max(data[, i])] <- dc.code
                noflevels[i] <- noflevels[i] - 1
            }
        }
    }
    
    statistical.testing <- FALSE
    
    if (inf.test[1] == "binom") {
        statistical.testing <- TRUE
        if (length(inf.test) > 1) {
            alpha <- as.numeric(inf.test[2]) # already checked if a number between 0 and 1
        }
        else {
            alpha <- 0.05
        }
        
        observed <- which(tt$OUT != "?")
        success <- round(tt[observed, "n"] * as.numeric(tt[observed, "incl"]))
        
        tt <- cbind(tt, pval1 = "-", pval0 = "-")
        tt[, "pval1"] <- tt[, "pval0"] <- as.character(tt[, "pval1"])
        tt[observed, "OUT"] <- 0
        
        for (i in seq(length(observed))) {
            
            pval1 <- tt[observed[i], "pval1"] <- binom.test(success[i], tt[observed[i], "n"], p = incl.cut1, alternative = "less")$p.value
            pval0 <- tt[observed[i], "pval0"] <- binom.test(success[i], tt[observed[i], "n"], p = incl.cut0, alternative = "greater")$p.value
            if (pval1 > alpha) {
                tt[observed[i], "OUT"] <- 1
            }
            else if (pval1 < alpha & pval0 < alpha) {
                tt[observed[i], "OUT"] <- "C"
            }
        }
    }
    
    
    # deal with the show.cases in the print function
    # if (show.cases) {
        tt <- cbind(tt, cases)
    # }
    
    x <- list(tt = tt, indexes = sort(unique(line.data[line.data > 0])), noflevels = as.vector(noflevels),
              initial.data = initial.data, recoded.data = data, cases = cases, 
              options = list(outcome = outcome.copy, neg.out = neg.out, n.cut = n.cut,
                             incl.cut1 = incl.cut1, incl.cut0 = incl.cut0, complete = complete,
                             show.cases = show.cases, inf.test = statistical.testing))
    
    if (any(excluded)) {
       x$excluded <- excluded.cases
    }
    
    
    if (use.letters & sum(nchar(colnames(data)[-ncol(data)])) != (ncol(data) - 1)) { # also verify if not already letters
        colnames(x$tt)[seq(nofconditions)] <- LETTERS[seq(nofconditions)]
    }
    
    # PRI <- FALSE
    # if ("PRI" %in% names(other.args)) {
    #     if (is.logical(other.args$PRI)) {
    #         PRI <- other.args$PRI[1]
    #     }
    # }
    
    # x$options$PRI <- PRI
    
    if (!identical(sort.by, "")) {
        x$rowsorder <- rowsorder
    }
    
    return(structure(x, class="tt"))
}

