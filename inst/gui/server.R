library(shiny)
library(QCAGUI)

setwd(Sys.getenv("userwd"))


listFiles <- function(dirpath, filetype="*") {
    
    result <- list(dirs = NULL, files = NULL, filepath = as.matrix(filepath), ok = oktoset)
    
    # get all files
    found <- list.files(dirpath)
    
    temp <- toupper(found)
    found <- found[match(sort(temp), temp)]
    
    if (length(found) > 0) {
        
        isdir <- sapply(found, function(x) file_test("-d", file.path(dirpath, x)))
        
        if (any(isdir)) {
            result$dirs <- found[isdir]
        }
        
        if (any(!isdir)) {
            if (filetype != "*") {
                extensions <- unlist(lapply(strsplit(found, split="\\."), "[", 2))
                found <- found[which(toupper(extensions) == toupper(filetype))]
                if (length(found) > 0) {
                    result$files <- found
                }
            }
            else {
                result$files <- found[!isdir]
            }
        }
        
        
        if (length(result$dirs) == 1) {
            result$dirs <- as.matrix(result$dirs)
        }
        
        if (length(result$files) == 1) {
            result$files <- as.matrix(result$files)
        }
        
    }
    
    
    if (!identical(filepath, "")) {
        if (file_test("-f", filepath)) {
            
            resfilename <- unlist(strsplit(basename(filepath), split="\\."))
            
            extension <<- resfilename[length(resfilename)]
            resfilename <- resfilename[-length(resfilename)]
            resfilename <- paste(gsub("[[:space:]]", "", gsub("[^[:alnum:] ]", "", resfilename)), collapse="")
            
            if (possibleNumeric(substr(resfilename, 1, 1))) {
                resfilename <- paste("x", resfilename, sep="")
            }
            
            filename <<- resfilename
            
        }
    }
    
    
    result$filename <- filename
    result$extension <- extension
    result$wd <- getwd()
    
    return(result)
    
}


tempdata <- NULL
mydata <- NULL
mytt <- NULL
myeqmcc <- NULL



current_path <- getwd()
oktoset <- TRUE
filepath <- ""
filename <- ""
extension <- ""
tcisdata <- TRUE

vert <- NULL



shinyServer(function(input, output, session) {
    
    observe({
        dirfilist <- input$dirfilist
        if (!is.null(dirfilist)) {
            if (dirfilist$refresh) {
                filename <<- ""
            }
        }
        session$sendCustomMessage(type = "dirfile", listFiles(current_path))
    })
    
    
    observe({
        
        read_table <- input$read_table
        
        filepath <<- ""
        
        oktoset <<- TRUE
            
        
        if (!is.null(input$dirfile_chosen)) {
            
            dfchosen <- input$dirfile_chosen
            oktoset <<- TRUE
            
            if (dfchosen[1] == "file") {
                
                filepath <<- file.path(gsub("[/]$", "", current_path), dfchosen[2])
                
            }
            else {
                splitpath <- unlist(strsplit(current_path, split=.Platform$file.sep))
                
                if (dfchosen[2] == ".." | dfchosen[2] == "...") {
                    
                    if (length(splitpath) > 1) {
                        splitpath <- splitpath[-length(splitpath)]
                    }
                    
                    if (identical(splitpath, "")) {
                        splitpath <- "/"
                    }
                    
                    pathtobe <- paste(splitpath, collapse=.Platform$file.sep)
                    
                    # if (file_test("-x", pathtobe)) {
                    if (length(list.files(pathtobe)) > 0) {
                        current_path <<- pathtobe
                    }
                    else {
                        oktoset <<- FALSE
                    }
                }
                else {
                    current_dirs <- listFiles(current_path)$dirs
                    
                    if (dfchosen[2] %in% current_dirs) {
                        pathtobe <- file.path(current_path, dfchosen[2])
                        pathtobe <- paste(pathtobe, "/", sep="")
                        
                        if (length(list.files(pathtobe)) > 0) {
                            current_path <<- pathtobe
                        }
                        else {
                            oktoset <<- FALSE
                        }
                    }
                    else if (dfchosen[2] != "__stdir__") {
                        
                        if (dfchosen[2] == "root") {
                            dfchosen[2] <- ""
                        }
                        
                        splitpath <- splitpath[seq(which(splitpath == dfchosen[2]))]
                        pathtobe <- ifelse(length(splitpath) == 1,
                                           ifelse(identical(splitpath, ""), "/", splitpath),
                                           paste(splitpath, collapse=.Platform$file.sep))
                        
                        if (length(list.files(pathtobe)) > 0) {
                            current_path <<- pathtobe
                        }
                        else {
                            oktoset <<- FALSE
                        }
                    }
                }
            }
            
            if (oktoset) {
                if (!grepl("/", current_path)) {
                    current_path <<- paste(current_path, "/", sep="")
                }
            }
            
            if (dfchosen[1] == "dir" & dfchosen[3] != "") {
                
                if (grepl("cannot change working directory", tryCatch(setwd(dfchosen[3]), error = function(e) e))) {
                    listtosend <- listFiles(current_path)
                    listtosend$filename <- "error!"
                    session$sendCustomMessage(type = "dirfile", listtosend)
                }
                else {
                    
                    if (dfchosen[3] %in% listFiles(current_path)$dirs) {
                        pathtobe <- file.path(current_path, dfchosen[3])
                        
                        # if (file_test("-x", pathtobe)) {
                        if (length(list.files(pathtobe)) > 0) {
                            current_path <<- pathtobe
                        }
                    }
                    else {
                        current_path <<- dfchosen[3]
                    }
                    
                    if (!grepl("/", current_path)) {
                        current_path <<- paste(current_path, "/", sep="")
                    }
                    
                    setwd(current_path)
                    session$sendCustomMessage(type = "dirfile", listFiles(current_path))
                }
            }
            else {
                setwd(current_path)
                session$sendCustomMessage(type = "dirfile", listFiles(current_path))
            }
                            
        }
        else {
            current_path <<- getwd()
        }
        
        
        if (!identical(filepath, "")) {
            
            numevars <- ""
            
            header <- read_table$header
            colsep <- read_table$sep # comma separated by default
            row_names <- read_table$row_names
            decimal <- read_table$dec
            
            filename <<- unlist(strsplit(basename(filepath), split="\\."))
            filename <<- filename[-length(filename)]
            if (length(filename) > 1) {
                filename <<- paste(filename, collapse=".")
            }
            
            
            if (!identical(row_names, "")) { # this isn't a vector, just a name or a number, but just as a best practise
                if (possibleNumeric(row_names)) {
                    row_names <- as.numeric(row_names)
                }
                tc <- capture.output(tryCatch(read.table(filepath, header=header, ifelse(colsep == "tab", "\t", colsep),
                          row.names=row_names, as.is=TRUE, dec=decimal, nrows = 2), error = function(e) e, warning = function(w) w))
                   
            }
            else {
                tc <- capture.output(tryCatch(read.table(filepath, header=header, ifelse(colsep == "tab", "\t", colsep),
                          as.is=TRUE, dec=decimal, nrows = 2), error = function(e) e, warning = function(w) w))
            }
            
            if (any(grepl("subscript out of bounds", tc))) {
                mesaj <- paste("The data doesn't have ", row_names, " columns.", sep = "")
                session$sendCustomMessage(type = "tempdatainfo", list(ncols=1, nrows=1, colnames=mesaj, rownames="error!"))
                return(invisible())
            }
            else if (any(grepl("are not allowed", tc))) {
                mesaj <- paste("The row.names column has duplicated values.", sep = "")
                session$sendCustomMessage(type = "tempdatainfo", list(ncols=1, nrows=1, colnames=mesaj, rownames="error!"))
                return(invisible())
            }
            else if (any(grepl("data frame with 0 columns", tc))) {
                mesaj <- paste("The data has only 1 column.", sep = "")
                tc <- tryCatch(read.table(filepath, header=header, ifelse(colsep == "tab", "\t", colsep),
                           as.is=TRUE, dec=decimal, nrows = 2), error = function(e) e)
                session$sendCustomMessage(type = "tempdatainfo", list(ncols=2, nrows=2, colnames=c(colnames(tc), mesaj), rownames=""))
                return(invisible())
            }
            else if (any(grepl("attempt to select less than one element", tc))) {
                mesaj <- paste("The column \"", row_names, "\" was not found.", sep = "")
                session$sendCustomMessage(type = "tempdatainfo", list(ncols=1, nrows=1, colnames=mesaj, rownames="error!"))
                return(invisible())
            }
            
            
            tc <- tryCatch(read.table(filepath, header=header, ifelse(colsep == "tab", "\t", colsep),
                           as.is=TRUE, dec=decimal, nrows = 2), error = function(e) e, warning = function(w) w)
            
            
            tcisdata <<- TRUE
            
            
            if (is.null(dim(tc))) {
                if (is.list(tc)) {
                    if (identical(names(tc), c("message", "call"))) {
                        tcisdata <<- FALSE
                        session$sendCustomMessage(type = "tempdatainfo", list(ncols=1, nrows=1, colnames=tc$message, rownames="error!"))
                    }
                }
            }
            else {
                if (grepl("X.PDF", names(tc)[1])) {
                    tcisdata <<- FALSE
                    session$sendCustomMessage(type = "tempdatainfo", list(ncols=1, nrows=1, colnames="not a dataframe, this is a PDF file", rownames="error!"))
                }
            }
            
            if (tcisdata) {
                
                if (row_names != "") {
                    tc <- tryCatch(read.table(filepath, header=header, ifelse(colsep == "tab", "\t", colsep),
                              row.names=row_names, as.is=TRUE, dec=decimal), error = function(e) e, warning = function(w) w)
                }
                else {
                    tc <- tryCatch(read.table(filepath, header=header, ifelse(colsep == "tab", "\t", colsep),
                              as.is=TRUE, dec=decimal), error = function(e) e, warning = function(w) w)
                }
                
                
                if (identical(names(tc), c("message", "call"))) {
                    # not a mistake, it might happen that a warning is issued even at this stage
                    session$sendCustomMessage(type = "tempdatainfo", list(ncols=1, nrows=1, colnames=tc$message, rownames="error!"))
                }
                else {
                
                    tempdata <<- tc
                    
                    session$sendCustomMessage(type = "tempdatainfo", list(ncols=ncol(tempdata),
                                                                      nrows=nrow(tempdata),
                                                                      colnames=colnames(tempdata),
                                                                      rownames=rownames(tempdata)))
                    
                }
            }
        }
        
    })
    
    
    observe({
        
        import <- input$import
        
        if (!is.null(import) & tcisdata) {
            
            mydata <<- tempdata
            
            set.seed(12345)
            vert <<- sample(185:200, nrow(mydata), replace = TRUE)
            
            numerics <- as.vector(unlist(lapply(mydata, possibleNumeric)))
            
            calibrated <- as.vector(unlist(lapply(mydata, function(x) {
                all(na.omit(x) >= 0 & na.omit(x) <= 1)
            })))
            
            rowend <- min(17, nrow(mydata))
            colend <- min(8, ncol(mydata))
            
            
            tosend <- as.list(mydata[seq(rowend), seq(colend)])
            names(tosend) <- NULL # to make it look like a simple Array in Javascript
            
            session$sendCustomMessage(type = "datainfo",
                                      list(list(ncols=ncol(mydata),              # the datainfo
                                                nrows=nrow(mydata),
                                                colnames=colnames(mydata),
                                                rownames=rownames(mydata),
                                                numerics=numerics,
                                                calibrated=calibrated),
                                            tosend,                               # theData
                                            paste(1, 1, rowend, colend, ncol(mydata), sep="_"))) # and the dataCoords
            
        }
    })
    
    
    
    observe({
        scrollvh <- input$scrollvh
        
        if (!is.null(scrollvh)) {
            
            scrollvh <- scrollvh + 1
            
            rowstart <- scrollvh[1]
            colstart <- scrollvh[2]
            rowend <- min(rowstart + scrollvh[3] - 1, nrow(mydata))
            colend <- min(colstart + scrollvh[4] - 1, ncol(mydata))
            
            tosend <- as.list(mydata[seq(rowstart, rowend), seq(colstart, colend)])
            names(tosend) <- NULL
            
            session$sendCustomMessage(type = "theData", list(tosend, paste(rowstart, colstart, rowend, colend, ncol(mydata), sep="_")))
        }   
    })
    
    
    
    
    observe({
        
        foo <- input$eqmcc2R
        
        if (!is.null(mydata)) {
            
            outc <- c("")
            if (length(foo$outcome) > 0) {
                outc <- unlist(foo$outcome)
            }
            
            cnds <- c("")
            if (length(foo$conditions) > 0) {
                cnds <- unlist(foo$conditions)
            }
            
            expl <- c("1")
            if (length(foo$explain) > 0) {
                expl <- unlist(foo$explain)
            }
            
            incl <- c("")
            if (length(foo$include) > 0) {
                incl <- unlist(foo$include)
            }
            
            direxp <- ""
            if (length(foo$dir_exp) > 0) {
                direxp <- unlist(foo$dir_exp)
                if (all(direxp == "-")) {
                    direxp <- ""
                }
            }
            
            use_letters <- foo$use_letters
            
            myeqmcc <<- NULL
            
            textoutput <- capture.output(tryCatch(
                (myeqmcc <<- eqmcc(mydata, outcome = outc,
                      neg.out = foo$neg_out,
                      conditions = cnds,
                      relation = foo$relation,
                      n.cut = as.numeric(foo$n_cut),
                      incl.cut1 = as.numeric(foo$incl_cut1),
                      incl.cut0 = as.numeric(foo$incl_cut0),
                      explain = expl,
                      include = incl,
                      all.sol = foo$all_sol,
                      dir.exp = direxp,
                      details = foo$details,
                      show.cases = foo$show_cases,
                      use.tilde = foo$use_tilde,
                      use.letters = use_letters,
                      via.web=TRUE,
                      PRI=foo$PRI)) , error = function(e) e)
            )
            
            if (any(error <- grepl("Error", textoutput))) {
                errmessage <- paste0("Error:", unlist(strsplit(textoutput[which(error)], split=":"))[2])
                errmessage <- substr(errmessage, 1, nchar(errmessage) - 1)
                textoutput <- c("error", errmessage, "")
            }
            
            textoutput <- gsub("undefined columns selected>", "Column names in the command don't match those in the interface.", textoutput)
            
            sendnormal <- FALSE
            
            if (length(cnds) <= 7) { # to draw the Venn diagram, up to 5 variables for now
                
                if (!identical(outc, "")) { # this happens when the interface is disconnected
                    if (length(splitstr(outc)) == 1 & !is.null(myeqmcc)) {
                        
                        myeqmcc$tt$initial.data <- NULL
                        myeqmcc$tt$recoded.data <- NULL
                        myeqmcc$tt$indexes <- myeqmcc$tt$indexes - 1 # to take the indexes in Javascript notation
                        if (identical(cnds, "")) {
                            cnds <- toupper(setdiff(names(mydata), outc))
                        }
                        
                        if (use_letters) {
                            cnds <- LETTERS[seq(length(cnds))]
                        }
                        
                        myeqmcc$tt$options$conditions <- toupper(cnds)
                        myeqmcc$tt$id <- apply(myeqmcc$tt$tt[, toupper(cnds)], 1, function(x) {
                            ifelse(any(x == 1), paste(which(x == 1), collapse=""), "0")
                        })
                        
                        session$sendCustomMessage(type = "eqmcc", list(textoutput, list(as.list(myeqmcc$tt      ))))
                    }
                    else {
                        sendnormal <- TRUE
                    }
                }
                else {
                    sendnormal <- TRUE
                }
            }
            
            if (sendnormal) {
                session$sendCustomMessage(type = "eqmcc", list(textoutput, NULL))
            }
            
        }
        
    })
    
    
    observe({
        
        foo <- input$tt2R
        
        if (!is.null(mydata)) {
            
            outc <- ""
            if (length(foo$outcome) > 0) {
                outc <- unlist(foo$outcome)
            }
            
            cnds <- ""
            if (length(foo$conditions) > 0) {
                cnds <- splitstr(unlist(foo$conditions))
            }
            
            sortbys <- unlist(foo$sort_by)
            selected <- unlist(foo$sort_sel)
            sortbys <- sortbys[selected[names(sortbys)]]
            
            if (length(sortbys) == 0) {
                sortbys <- ""
            }
            
            use_letters <- foo$use_letters
            
            mytt <<- NULL
            
            textoutput <- capture.output(tryCatch(
                (mytt <<- truthTable(mydata, outcome = outc,
                      neg.out = foo$neg_out,
                      conditions = cnds,
                      n.cut = as.numeric(foo$n_cut),
                      incl.cut1 = as.numeric(foo$incl_cut1),
                      incl.cut0 = as.numeric(foo$incl_cut0),
                      complete = foo$complete,
                      show.cases = foo$show_cases,
                      sort.by = sortbys,
                      use.letters = foo$use_letters,
                      PRI=foo$PRI)), error = function(e) e)
            )
            
            if (any(error <- grepl("Error", textoutput))) {
                errmessage <- paste0("Error:", unlist(strsplit(textoutput[which(error)], split=":"))[2])
                errmessage <- substr(errmessage, 1, nchar(errmessage) - 1)
                textoutput <- c("error", errmessage, "")
            }
            
            textoutput <- gsub("undefined columns selected>", "Column names in the command don't match those in the interface.", textoutput)
            
            if (length(cnds) <= 7) { # to draw the Venn diagram, up to 5 variables for now
                if (!is.null(mytt)) {
                    mytt$initial.data <- NULL
                    mytt$recoded.data <- NULL
                    mytt$indexes <- mytt$indexes - 1 # to take the indexes in Javascript notation
                    if (identical(cnds, "")) {
                        cnds <- toupper(setdiff(names(mydata), outc))
                    }
                    
                    if (use_letters) {
                        cnds <- LETTERS[seq(length(cnds))]
                    }
                    
                    mytt$options$conditions <- toupper(cnds)
                    mytt$id <- apply(mytt$tt[, toupper(cnds)], 1, function(x) {
                        ifelse(any(x == 1), paste(which(x == 1), collapse=""), "0")
                    })
                    
                }
                
                session$sendCustomMessage(type = "tt", list(textoutput, mytt))
            }
            else {
                session$sendCustomMessage(type = "tt", list(textoutput, NULL))
            }
        }
    })
    
    
    
    observe({
        thinfo <- input$thinfo
        
        if (!is.null(thinfo)) {
            if (thinfo[2] != "") {
                
                if (possibleNumeric((mydata[, thinfo[2]]))) {
                    response <- findTh(mydata[, thinfo[2]], groups = as.numeric(thinfo[1]) + 1)
                }
                else {
                    response <- "notnumeric"
                }
                
                session$sendCustomMessage(type = "thvalsfromR", 
                    as.list(response)
                )
            }
        }
    })
    
    
    observe({
        exportobj <- input$exportobj
        
        if (!is.null(exportobj)) {
            
            filesep <- exportobj$sep
            if (filesep == "tab") {
                filesep <- "\t"
            }
            
            separator <- exportobj$sep
            filetowrite <- file.path(current_path, exportobj$filename)
            
            if (exportobj$newfile) {
                if (exportobj$filename != "") {
                    filetowrite <- file.path(current_path, exportobj$filename)
                }
            }
            
            export(mydata, filetowrite, sep=filesep, col.names=exportobj$header, caseid=exportobj$caseid)
        }
    })
    
    
    
    observe({
        foo <- input$calibrate
        
        if (!is.null(foo)) {
            
            checks <- rep(TRUE, 9)
            
            checks[1] <- !is.null(mydata)
            
            foo$thresholds <- unlist(foo$thresholds)
            
            
            nms <- unlist(foo$thnames)[foo$thresholds != ""]
            foo$thresholds <- foo$thresholds[foo$thresholds != ""]
            
            
            thrs <- suppressWarnings(as.numeric(foo$thresholds))
            if (any(!is.na(thrs))) {
                foo$thresholds <- as.numeric(thrs[!is.na(thrs)])
            }
            
            if (all(foo$thresholds == "")) {
                foo$thresholds <- NA
            }
            else {
                if (!is.null(nms)) {
                    if (length(nms) == length(foo$thresholds)) {
                        names(foo$thresholds) <- nms
                    }
                    else {
                        foo$thresholds <- NA
                    }
                }
            }
            
            foo$x <- unlist(foo$x)
            
            checks[4] <- !is.null(foo$x)
            if (checks[4]) {
                checks[5] <- foo$x != ""
            }
            
            
            if (checks[1] & checks[5]) {
                
                if (foo$x %in% names(mydata)) {
                    checks[6] <- is.numeric(mydata[, foo$x])
                }
            }
            
            checks[7] <- possibleNumeric(foo$idm)
            if (checks[7]) {
                foo$idm <- as.numeric(foo$idm)
            }
            
            checks[8] <- possibleNumeric(foo$p)
            if (checks[8]) {
                foo$p <- as.numeric(foo$p)
            }
            
            checks[9] <- possibleNumeric(foo$q)
            if (checks[9]) {
                foo$q <- as.numeric(foo$q)
            }
            
            scrollvh <- unlist(foo$scrollvh)
            scrollvh <- scrollvh + 1
            
            if (all(checks)) {
                
                textoutput <- capture.output(tryCatch(
                    calibrate(
                        mydata[, foo$x],
                        type = foo$type,
                        thresholds = foo$thresholds,
                        include = foo$include,
                        logistic = foo$logistic,
                        idm = foo$idm,
                        ecdf = foo$ecdf,
                        p = foo$p,
                        q = foo$q), error = function(e) e)
                )
                
                response <- vector(mode="list", length = 3)
                
                if (any(error <- grepl("Error", textoutput))) {
                    errmessage <- paste0("Error:", unlist(strsplit(textoutput[which(error)], split=":"))[2])
                    errmessage <- substr(errmessage, 1, nchar(errmessage) - 1)
                    textoutput <- c("error", errmessage, "")
                }
                else {
                    textoutput <- "no problem"
                    
                    mydata[, ifelse(foo$newvar != "", foo$newvar, foo$x)] <<- calibrate(
                            mydata[, foo$x],
                            type = foo$type,
                            thresholds = foo$thresholds,
                            include = foo$include,
                            logistic = foo$logistic,
                            idm = foo$idm,
                            ecdf = foo$ecdf,
                            p = foo$p,
                            q = foo$q)
                    
                    rowstart <- scrollvh[1]
                    colstart <- scrollvh[2]
                    rowend <- min(rowstart + scrollvh[3] - 1, nrow(mydata))
                    colend <- min(colstart + scrollvh[4] - 1, ncol(mydata))
                    
                    tosend <- as.list(mydata[seq(rowstart, rowend), seq(colstart, colend)])
                    names(tosend) <- NULL
                    
                    numerics <- as.vector(unlist(lapply(mydata, possibleNumeric)))
                    response[[2]] <- list(ncols=ncol(mydata),
                                          nrows=nrow(mydata),
                                          colnames=colnames(mydata),
                                          rownames=rownames(mydata),
                                          numerics=numerics)
                    response[[3]] <- list(tosend, paste(rowstart, colstart, rowend, colend, ncol(mydata), sep="_"))
                    
                    
                }
                
                response[[1]] <- as.list(textoutput)
                
                session$sendCustomMessage(type = "calibrate", response)
                
            }
        }
        
    })
    
    
    
    
    observe({
        foo <- input$recode
        
        if (!is.null(foo)) {
            
            checks <- rep(TRUE, 3)
            
            checks[1] <- !is.null(mydata)
            
            foo$x <- unlist(foo$x)
            
            checks[2] <- !is.null(foo$x)
            
            if (checks[2]) {
                checks[3] <- foo$x != ""
            }
            
            
            foo$oldv <- unlist(foo$oldv)
            foo$newv <- unlist(foo$newv)
            uniques <- unique(foo$newv)
            
            rules <- ""
            for (i in seq(length(uniques))) {
                part <- paste(paste(foo$oldv[foo$newv == uniques[i]], collapse = ","), uniques[i], sep="=")
                rules <- paste(rules, part, ifelse(i == length(uniques), "", "; "), sep="")
            }
            
            
            scrollvh <- unlist(foo$scrollvh)
            scrollvh <- scrollvh + 1
            
            if (all(checks)) {
                
                textoutput <- capture.output(tryCatch(
                    recode(mydata[, foo$x],
                           rules = rules), error = function(e) e)
                )
                
                response <- vector(mode="list", length = 3)
                
                if (any(error <- grepl("Error", textoutput))) {
                    errmessage <- paste0("Error:", unlist(strsplit(textoutput[which(error)], split=":"))[2])
                    errmessage <- substr(errmessage, 1, nchar(errmessage) - 1)
                    textoutput <- c("error", errmessage, "")
                }
                else {
                    textoutput <- "no problem"
                    
                    mydata[, ifelse(foo$newvar != "", foo$newvar, foo$x)] <<- recode(
                            mydata[, foo$x],
                            rules = rules)
                    
                    rowstart <- scrollvh[1]
                    colstart <- scrollvh[2]
                    rowend <- min(rowstart + scrollvh[3] - 1, nrow(mydata))
                    colend <- min(colstart + scrollvh[4] - 1, ncol(mydata))
                    
                    tosend <- as.list(mydata[seq(rowstart, rowend), seq(colstart, colend)])
                    names(tosend) <- NULL
                    
                    numerics <- as.vector(unlist(lapply(mydata, possibleNumeric)))
                    response[[2]] <- list(ncols=ncol(mydata),
                                          nrows=nrow(mydata),
                                          colnames=colnames(mydata),
                                          rownames=rownames(mydata),
                                          numerics=numerics)
                    response[[3]] <- list(tosend, paste(rowstart, colstart, rowend, colend, ncol(mydata), sep="_"))
                    
                    
                }
                
                response[[1]] <- as.list(textoutput)
                
                session$sendCustomMessage(type = "recode", response)
                
            }
        }
        
    })
    
    
    
    observe({
        val <- input$dataModif
        if (!is.null(val)) {
            if (val[1] == "r") {
                rownames(mydata)[as.numeric(val[2])] <<- val[3]
            }
            else if (val[1] == "c") {
                colnames(mydata)[as.numeric(val[2])] <<- val[3]
            }
            else {
                valn <- suppressWarnings(as.numeric(val[3]))
                mydata[as.numeric(val[1]), as.numeric(val[2])] <<- ifelse(!is.na(valn), valn, val[3])
            }
        }
    })
    
    
    
    observe({
        foo <- input$thsetter2R
        if (!is.null(foo)) {
            
            cond <- unlist(foo$cond)
            
            if (cond %in% names(mydata)) {
                horz <- sort(mydata[, cond])
                response <- cbind(horz[!is.na(horz)], vert[!is.na(horz)])
                session$sendCustomMessage(type = "dataPoints", response)
            }
        }
    })
    
    
    
    observe({
        foo <- input$xyplot
        
        if (!is.null(foo)) {
            
            if (all(c(foo$x, foo$y) %in% names(mydata))) {
                
                x <- mydata[, foo$x]
                y <- mydata[, foo$y]
                
                rpofsuf <- list(pof(    x,     y, rel = "suf"),
                                pof(1 - x,     y, rel = "suf"),
                                pof(    x, 1 - y, rel = "suf"),
                                pof(1 - x, 1 - y, rel = "suf"))
                
                rpofsuf <- lapply(rpofsuf, function(x) {
                    frmted <- formatC(c(x$incl.cov$incl, x$incl.cov$cov.r, x$incl.cov$PRI), format="f", digits = 3)
                    return(frmted)
                })
                
                rpofnec <- list(pof(    x,     y, ron = TRUE),
                                pof(1 - x,     y, ron = TRUE),
                                pof(    x, 1 - y, ron = TRUE),
                                pof(1 - x, 1 - y, ron = TRUE))
                
                rpofnec <- lapply(rpofnec, function(x) {
                    
                    frmted <- formatC(c(x$incl.cov$incl, x$incl.cov$cov.r, x$incl.cov$PRI), format="f", digits = 3)
                    if (!is.null(x$optionals[, "ron"])) {
                        frmted <- c(frmted, formatC(x$optionals[, "ron"], format="f", digits = 3))
                    }
                    return(frmted)
                })
                
                response = list(rownames(mydata),
                                mydata[, foo$x],
                                mydata[, foo$y],
                                rpofsuf,
                                rpofnec)
                session$sendCustomMessage(type = "xyplot", response)
                
            }
        }
    })
    
    
    
  
})