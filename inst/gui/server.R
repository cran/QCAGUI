library(shiny)
library(QCA)
library(tools)
library(fastdigest)

setwd(Sys.getenv("userwd"))
options(help_type = "html")

listFiles <- function(dirpath, filetype = "*") {
    
    result <- list(dirs = NULL, files = NULL, filepath = as.matrix(filepath), ok = oktoset)
    
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
                extensions <- unlist(lapply(strsplit(found, split="[.]"), "[", 2))
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
            
            extension <- file_ext(basename(filepath))
            resfilename <- gsub("[[:space:]]", "_", file_path_sans_ext(basename(filepath)))
            
            if (QCA::possibleNumeric(substr(resfilename, 1, 1))) {
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

ev <- new.env(parent = globalenv())
hashes <- list()
active <- list(dataset = "", tt = "")
calibcond <- ""
templotfile <- file.path(tempdir(), "plot.pdf")

if (file.exists("Rplots.pdf")) {
    file.remove("Rplots.pdf")
}

pdf(templotfile)
emptyplot <- recordPlot()
plotsize <- rep(5.729167, 2) 
sapply(dev.list(), dev.off)
file.remove(templotfile)

grafic <- emptyplot
svgfile <- file.path(path.package("QCAGUI"), "gui", "www", "css", "images", "plot.svg")

tempdata <- NULL

current_path <- getwd()
oktoset <- TRUE
filepath <- ""
filename <- ""
extension <- ""
tcisdata <- TRUE
scrollvh <- c(1, 1, 17, 8)

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
            colsep <- read_table$sep 
            row_names <- read_table$row_names
            decimal <- read_table$dec
            
            filename <<- unlist(strsplit(basename(filepath), split="\\."))
            filename <<- filename[-length(filename)]
            if (length(filename) > 1) {
                filename <<- paste(filename, collapse=".")
            }
            
            if (!identical(row_names, "")) { 
                if (QCA::possibleNumeric(row_names)) {
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
            
            if (!identical(import$filename, "")) {
                filename <<- import$filename
            }
            
            active$dataset <<- filename
            ev[[active$dataset]] <- tempdata
            
            numerics <- as.vector(unlist(lapply(ev[[active$dataset]], QCA::possibleNumeric)))
            
            calibrated <- as.vector(unlist(lapply(ev[[active$dataset]], function(x) {
                all(na.omit(x) >= 0 & na.omit(x) <= 1)
            })))
            
            rowend <- min(17, nrow(ev[[active$dataset]]))
            colend <- min(8, ncol(ev[[active$dataset]]))
            
            tosend <- as.list(ev[[active$dataset]][seq(rowend), seq(colend)])
            names(tosend) <- NULL 
            
            session$sendCustomMessage(type = "datainfo",
                                      list(list(ncols=ncol(ev[[active$dataset]]),              
                                                nrows=nrow(ev[[active$dataset]]),
                                                colnames=colnames(ev[[active$dataset]]),
                                                rownames=rownames(ev[[active$dataset]]),
                                                numerics=numerics,
                                                calibrated=calibrated),
                                            tosend,                               
                                            paste(1, 1, rowend, colend, ncol(ev[[active$dataset]]), sep="_"))) 
            
        }
    })
    
    if (!identical(active$dataset, "")) {
        
        numerics <- as.vector(unlist(lapply(ev[[active$dataset]], QCA::possibleNumeric)))
        
        calibrated <- as.vector(unlist(lapply(ev[[active$dataset]], function(x) {
            all(na.omit(x) >= 0 & na.omit(x) <= 1)
        })))
        
        rowend <- min(17, nrow(ev[[active$dataset]]))
        colend <- min(8, ncol(ev[[active$dataset]]))
        
        tosend <- as.list(ev[[active$dataset]][seq(rowend), seq(colend)])
        names(tosend) <- NULL 
        
        session$sendCustomMessage(type = "datainfo",
                                  list(list(ncols=ncol(ev[[active$dataset]]),              
                                            nrows=nrow(ev[[active$dataset]]),
                                            colnames=colnames(ev[[active$dataset]]),
                                            rownames=rownames(ev[[active$dataset]]),
                                            numerics=numerics,
                                            calibrated=calibrated),
                                        tosend,                               
                                        paste(1, 1, rowend, colend, ncol(ev[[active$dataset]]), sep="_"))) 
        
    }
    
    observe({
        scrollvh2 <- input$scrollvh
        
        if (!is.null(scrollvh2)) {
            
            scrollvh <<- scrollvh2 + 1
            
            rowstart <- scrollvh[1]
            colstart <- scrollvh[2]
            rowend <- min(rowstart + scrollvh[3] - 1, nrow(ev[[active$dataset]]))
            colend <- min(colstart + scrollvh[4] - 1, ncol(ev[[active$dataset]]))
            
            tosend <- as.list(ev[[active$dataset]][seq(rowstart, rowend), seq(colstart, colend)])
            names(tosend) <- NULL
            
            session$sendCustomMessage(type = "theData", list(tosend, paste(rowstart, colstart, rowend, colend, ncol(ev[[active$dataset]]), sep="_")))
        }   
    })
    
    observe({
        
        foo <- input$eqmcc2R
        
        if (!is.null(foo)) {
        if (!identical(active$dataset, "")) {
        if (!is.null(ev[[active$dataset]])) {
            
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
            
            myeqmcc <- NULL
            incl.cut <- c(as.numeric(foo$ic1), as.numeric(foo$ic0))
            
            textoutput <- capture.output(tryCatch(
                (myeqmcc <- eqmcc(ev[[active$dataset]], outcome = outc,
                      neg.out = foo$neg_out,
                      conditions = cnds,
                      relation = foo$relation,
                      n.cut = as.numeric(foo$n_cut),
                      incl.cut = incl.cut[!is.na(incl.cut)],
                      explain = expl,
                      include = incl,
                      all.sol = foo$all_sol,
                      dir.exp = direxp,
                      details = foo$details,
                      show.cases = foo$show_cases,
                      use.tilde = foo$use_tilde,
                      use.letters = use_letters,
                      via.web=TRUE)) , error = function(e) e)
                      
            )
            
            if (!is.null(myeqmcc)) {
                if (!identical(foo$eqmcname, "")) {
                    ev[[foo$eqmcname]] <- myeqmcc
                }
            }
            
            if (any(error <- grepl("Error", textoutput))) {
                errmessage <- paste0("Error:", unlist(strsplit(textoutput[which(error)], split=":"))[2])
                errmessage <- substr(errmessage, 1, nchar(errmessage) - 1)
                textoutput <- c("error", errmessage, "")
            }
            
            textoutput <- gsub("undefined columns selected>", "Column names in the command don't match those in the interface.", textoutput)
            
            sendnormal <- FALSE
            
            if (length(cnds) <= 7) { 
                
                if (!identical(outc, "")) { 
                    if (length(QCA::splitstr(outc)) == 1 & !is.null(myeqmcc)) {
                        
                        myeqmcc$tt$initial.data <- NULL
                        myeqmcc$tt$recoded.data <- NULL
                        myeqmcc$tt$indexes <- myeqmcc$tt$indexes - 1 
                        if (identical(cnds, "")) {
                            cnds <- toupper(setdiff(names(ev[[active$dataset]]), outc))
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
        }
        }
        
    })
    
    observe({
        
        foo <- input$tt2R
        
        if (!is.null(foo)) {
        if (!identical(active$dataset, "")) {
        if (!is.null(ev[[active$dataset]])) {
            
            outc <- ""
            if (length(foo$outcome) > 0) {
                outc <- unlist(foo$outcome)
            }
            
            cnds <- ""
            if (length(foo$conditions) > 0) {
                cnds <- QCA::splitstr(unlist(foo$conditions))
            }
            
            sortbys <- unlist(foo$sort_by)
            selected <- unlist(foo$sort_sel)
            sortbys <- sortbys[selected[names(sortbys)]]
            
            if (length(sortbys) == 0) {
                sortbys <- ""
            }
            
            use_letters <- foo$use_letters
            
            mytt <- NULL
            
            incl.cut <- c(as.numeric(foo$ic1), as.numeric(foo$ic0))
            
            textoutput <- capture.output(tryCatch(
                (mytt <- truthTable(ev[[active$dataset]], outcome = outc,
                      neg.out = foo$neg_out,
                      conditions = cnds,
                      n.cut = as.numeric(foo$n_cut),
                      incl.cut = incl.cut[!is.na(incl.cut)],
                      complete = foo$complete,
                      show.cases = foo$show_cases,
                      sort.by = sortbys,
                      use.letters = foo$use_letters)), error = function(e) e)
                      
            )
            
            if (!is.null(mytt)) {
                if (!identical(foo$ttname, "")) {
                    
                    active$tt <- foo$ttname
                    ev[[active$tt]] <- mytt
                }
            }
            
            if (any(error <- grepl("Error", textoutput))) {
                errmessage <- paste0("Error:", unlist(strsplit(textoutput[which(error)], split=":"))[2])
                errmessage <- substr(errmessage, 1, nchar(errmessage) - 1)
                textoutput <- c("error", errmessage, "")
            }
            
            textoutput <- gsub("undefined columns selected>", "Column names in the command don't match those in the interface.", textoutput)
            
            if (length(cnds) <= 7) { 
                if (!is.null(mytt)) {
                    mytt$initial.data <- NULL
                    mytt$recoded.data <- NULL
                    mytt$indexes <- mytt$indexes - 1 
                    if (identical(cnds, "")) {
                        cnds <- toupper(setdiff(names(ev[[active$dataset]]), outc))
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
        }
        }
    })
    
    observe({
        thinfo <- input$thinfo
        
        if (!is.null(thinfo)) {
            
            response <- list()
            response$message <- "OK"
            
            if (thinfo$condition != "") {
                thinfo$nth <- as.numeric(thinfo$nth)
                
                if (QCA::possibleNumeric((ev[[active$dataset]][, thinfo$condition]))) {
                    calibcond <<- thinfo$condition
                    response$vals <- ev[[active$dataset]][, calibcond]
                    response$thvals <- vector(length = 0)
                    if (thinfo$th) {
                        response$thvals <- findTh(ev[[active$dataset]][, calibcond], n = thinfo$nth)
                        if (length(response$thvals) == 1) {
                            
                            response$thvals <- as.list(response$thvals)
                        }
                    }
                }
                else {
                    response$message <- "notnumeric"
                }
                
                session$sendCustomMessage(type = "dataPoints", response)
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
            
            export(ev[[active$dataset]], filetowrite, sep=filesep, col.names=exportobj$header, caseid=exportobj$caseid)
        }
    })
    
    observe({
        foo <- input$calibrate
        
        if (!is.null(foo)) {
            
            checks <- rep(TRUE, 9)
            
            checks[1] <- !is.null(ev[[active$dataset]])
            
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
                        if (foo$type == "fuzzy") {
                            names(foo$thresholds) <- nms
                        }
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
                
                if (foo$x %in% names(ev[[active$dataset]])) {
                    checks[6] <- is.numeric(ev[[active$dataset]][, foo$x])
                }
            }
            
            checks[7] <- QCA::possibleNumeric(foo$idm)
            if (checks[7]) {
                foo$idm <- as.numeric(foo$idm)
            }
            
            checks[8] <- QCA::possibleNumeric(foo$below)
            if (checks[8]) {
                foo$below <- as.numeric(foo$below)
            }
            
            checks[9] <- QCA::possibleNumeric(foo$above)
            if (checks[9]) {
                foo$above <- as.numeric(foo$above)
            }
            
            scrollvh <- unlist(foo$scrollvh)
            scrollvh <- scrollvh + 1
            
            if (all(checks)) {
                
                textoutput <- capture.output(tryCatch(
                    calibrate(
                        ev[[active$dataset]][, foo$x],
                        type = foo$type,
                        thresholds = foo$thresholds,
                        include = foo$include,
                        logistic = foo$logistic,
                        idm = foo$idm,
                        ecdf = foo$ecdf,
                        below = foo$below,
                        above = foo$above), error = function(e) e)
                )
                
                response <- vector(mode="list", length = 5)
                
                if (any(error <- grepl("Error", textoutput))) {
                    errmessage <- paste0("Error:", unlist(strsplit(textoutput[which(error)], split=":"))[2])
                    errmessage <- substr(errmessage, 1, nchar(errmessage) - 1)
                    textoutput <- c("error", errmessage, "")
                }
                else {
                    textoutput <- "no problem"
                    
                    tomodify <- ifelse(foo$newvar != "", foo$newvar, foo$x)
                    if (foo$same) {
                        tomodify <- foo$x
                    }
                    
                    ev[[active$dataset]][, ifelse(foo$newvar != "", foo$newvar, foo$x)] <- calibrate(
                            ev[[active$dataset]][, foo$x],
                            type = foo$type,
                            thresholds = foo$thresholds,
                            include = foo$include,
                            logistic = foo$logistic,
                            idm = foo$idm,
                            ecdf = foo$ecdf,
                            below = foo$below,
                            above = foo$above)
                    
                    rowstart <- scrollvh[1]
                    colstart <- scrollvh[2]
                    rowend <- min(rowstart + scrollvh[3] - 1, nrow(ev[[active$dataset]]))
                    colend <- min(colstart + scrollvh[4] - 1, ncol(ev[[active$dataset]]))
                    
                    tosend <- as.list(ev[[active$dataset]][seq(rowstart, rowend), seq(colstart, colend)])
                    names(tosend) <- NULL
                    
                    numerics <- as.vector(unlist(lapply(ev[[active$dataset]], QCA::possibleNumeric)))
                    response[[2]] <- list(ncols=ncol(ev[[active$dataset]]),
                                          nrows=nrow(ev[[active$dataset]]),
                                          colnames=colnames(ev[[active$dataset]]),
                                          rownames=rownames(ev[[active$dataset]]),
                                          numerics=numerics)
                    response[[3]] <- list(tosend, paste(rowstart, colstart, rowend, colend, ncol(ev[[active$dataset]]), sep="_"))
                    
                    if (foo$same) {
                        response[[4]] <- "calibrate"
                        response[[5]] <- ev[[active$dataset]][, foo$x]
                    }
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
            
            checks[1] <- !is.null(ev[[active$dataset]])
            
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
                    recode(ev[[active$dataset]][, foo$x],
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
                    
                    ev[[active$dataset]][, ifelse(foo$newvar != "", foo$newvar, foo$x)] <- recode(
                            ev[[active$dataset]][, foo$x],
                            rules = rules)
                    
                    rowstart <- scrollvh[1]
                    colstart <- scrollvh[2]
                    rowend <- min(rowstart + scrollvh[3] - 1, nrow(ev[[active$dataset]]))
                    colend <- min(colstart + scrollvh[4] - 1, ncol(ev[[active$dataset]]))
                    
                    tosend <- as.list(ev[[active$dataset]][seq(rowstart, rowend), seq(colstart, colend)])
                    names(tosend) <- NULL
                    
                    numerics <- as.vector(unlist(lapply(ev[[active$dataset]], QCA::possibleNumeric)))
                    response[[2]] <- list(ncols=ncol(ev[[active$dataset]]),
                                          nrows=nrow(ev[[active$dataset]]),
                                          colnames=colnames(ev[[active$dataset]]),
                                          rownames=rownames(ev[[active$dataset]]),
                                          numerics=numerics)
                    response[[3]] <- list(tosend, paste(rowstart, colstart, rowend, colend, ncol(ev[[active$dataset]]), sep="_"))
                    
                }
                
                response[[1]] <- as.list(textoutput)
                
                session$sendCustomMessage(type = "recode", response)
                
            }
        }
        
    })
    
    observe({
        dM <- input$dataModif
        if (!is.null(dM)) {
            
            if (is.null(dM$row)) {
                colnames(ev[[active$dataset]])[dM$col] <- dM$val
            }
            else if (is.null(dM$col)) {
                rownames(ev[[active$dataset]])[dM$row] <- dM$val
            }
            else {
                if (identical(dM$val, "")) {
                    dM$val <- NA
                }
                ev[[active$dataset]][dM$row, dM$col] <- dM$val
            }
        }
    })
    
    observe({
        foo <- input$xyplot
        
        if (!is.null(foo)) {
            
            if (all(c(foo$x, foo$y) %in% names(ev[[active$dataset]]))) {
                
                X <- ev[[active$dataset]][, foo$x]
                Y <- ev[[active$dataset]][, foo$y]
                
                rpofsuf <- list(pof(    X,     Y, rel = "suf"),
                                pof(1 - X,     Y, rel = "suf"),
                                pof(    X, 1 - Y, rel = "suf"),
                                pof(1 - X, 1 - Y, rel = "suf"))
                
                rpofsuf <- lapply(rpofsuf, function(x) {
                    frmted <- formatC(c(x$incl.cov$incl, x$incl.cov$cov.r, x$incl.cov$PRI), format="f", digits = 3)
                    return(frmted)
                })
                
                rpofnec <- list(pof(    X,     Y, ron = TRUE),
                                pof(1 - X,     Y, ron = TRUE),
                                pof(    X, 1 - Y, ron = TRUE),
                                pof(1 - X, 1 - Y, ron = TRUE))
                
                rpofnec <- lapply(rpofnec, function(x) {
                    frmted <- formatC(c(x$incl.cov$incl, x$incl.cov$cov.r, x$incl.cov$RoN), format="f", digits = 3)
                    return(frmted)
                })
                
                response = list(rownames(ev[[active$dataset]]),
                                ev[[active$dataset]][, foo$x],
                                ev[[active$dataset]][, foo$y],
                                rpofsuf,
                                rpofnec)
                session$sendCustomMessage(type = "xyplot", response)
                
            }
        }
    })
    
    observe({
        
        foo <- input$Rcommand
        
        if (!is.null(foo)) {
            thinfo <- foo$thinfo
            hashes1 <- lapply(active, function(x) {
                if (x != "") {
                    fastdigest(ev[[unname(x)]])
                }
            })
            
            if (!identical(calibcond, "")) {
                if (calibcond %in% names(ev[[active$dataset]])) {
                    hashes1[["calibcond"]] <- fastdigest(ev[[active$dataset]][[calibcond]])
                }
            }
            
            if (length(dev.list()) > 0) {
                sapply(dev.list(), dev.off)
            }
            
            fromto <- matrix(asNumeric(unlist(foo$brackets)) + 1, ncol = 2, byrow = TRUE)
            
            foo <- trimst(unlist(strsplit(foo$command, split = "\n")))
            foo <- apply(fromto, 1, function(x) paste(foo[seq(x[1], x[2])], collapse = " "))
            
            tosend <- list(result = NULL, error = NULL, warning = NULL, plot = FALSE, modified = list())
            
            forbidden <- "dev.new\\(|plot.new\\(|plot.window\\(|X11\\(|quartz\\(|dev.set\\(|windows\\("
            
            if (any(grepl(forbidden, foo))) {
                tosend$error <- "Opening on-screen graphics devices is not supported in this GUI."
            }
            else {
                   
                if (any(ggplot <- grep("ggplot\\(|qplot\\(|quickplot\\(", foo))) {
                    foo[ggplot] <- paste("SOMEBIGNAME <- ", foo[ggplot])
                    foo <- c(foo, "print(SOMEBIGNAME)")
                }
                
                testplot <- emptyplot 
                
                currobjs <- names(ev)
                
                pdf(templotfile)
                dev.control("enable")
                tc <- tryCatch(eval(parse(text = foo), envir = ev), error = function(e) e, warning = function(w) w)
                
                if (length(dev.list()) > 0) {
                    testplot <- recordPlot()
                    sapply(dev.list(), dev.off)
                }
                
                if (length(addobjs <- setdiff(names(ev), currobjs)) > 0) {
                    suppressWarnings(eval(parse(text = paste("rm(", paste(addobjs, collapse = ","), ", envir = ev)"))))
                }
                
                if (inherits(tc, "error")) {
                    tosend$error <- tc$message
                    if (identical(tc$message, "plot.new has not been called yet")) {
                        if (!identical(grafic, emptyplot)) {
                            
                            pdf(templotfile)
                            dev.control("enable")
                            replayPlot(grafic)
                            suppressWarnings(eval(parse(text = foo), envir = ev))
                            if (length(dev.list()) > 0) {
                                testplot <- recordPlot()
                                sapply(dev.list(), dev.off)
                            }
                            tosend$error <- NULL
                            
                            svg(filename = svgfile, width = plotsize[1], height = plotsize[2])
                            replayPlot(grafic)
                            dev.off()
                            
                        }
                    }
                }
                else if (inherits(tc, "warning")) {
                    if (!identical(grafic, emptyplot)) {
                        
                        pdf(templotfile)
                        dev.control("enable")
                        replayPlot(grafic)
                        suppressWarnings(eval(parse(text = foo), envir = ev))
                        if (length(dev.list()) > 0) {
                            testplot <- recordPlot()
                            sapply(dev.list(), dev.off)
                        }
                        
                        svg(filename = svgfile, width = plotsize[1], height = plotsize[2])
                        replayPlot(grafic)
                        dev.off()
                    }
                    
                    co <- capture.output(tryCatch(suppressWarnings(eval(parse(text = foo), envir = ev))))
                    
                    if (length(co) > 0) {
                        tosend$result <- strsplit(co[1], split = ",")
                    }
                    else {
                        tosend$result <- NULL
                    }
                    
                    tosend$warning <- tc$message
                }
                else {
                    if (capture.output(tc)[1] == "null device ") {
                        tosend$error <- "cannot shut down device 1 (the null device)"
                    }
                    else {
                        co <- capture.output(tryCatch(suppressWarnings(eval(parse(text = foo), envir = ev))))
                        tosend$result <- strsplit(co, split = ",")
                    }
                }
                
                if (!identical(testplot, emptyplot)) {
                    grafic <<- testplot
                    tosend$plot <- TRUE
                    svg(filename = svgfile, width = plotsize[1], height = plotsize[2])
                    replayPlot(grafic)
                    dev.off()
                }
                
                sapply(dev.list(), dev.off)
                
                if (exists("SOMEBIGNAME", envir = ev)) {
                    rm("SOMEBIGNAME", envir = ev)
                }
            }
            
            if (file.exists("Rplots.pdf")) {
                file.remove("Rplots.pdf")
            }

            hashes2 <- lapply(active, function(x) {
                if (x != "") {
                    fastdigest(ev[[x]])
                }
            })
            
            if (!identical(calibcond, "")) {
                if (calibcond %in% names(ev[[active$dataset]])) {
                    hashes2[["calibcond"]] <- fastdigest(ev[[active$dataset]][[calibcond]])
                }
            }
            
            for (nm in names(hashes1)) {
                
                if (!identical(hashes1[[nm]], hashes2[[nm]])) {
                    
                    if (nm == "dataset" & !is.null(hashes1$dataset)) {
                        tosend$modified[["dataset"]] <- list()
                        
                        rowstart <- scrollvh[1]
                        colstart <- scrollvh[2]
                        rowend <- min(rowstart + scrollvh[3] - 1, nrow(ev[[active$dataset]]))
                        colend <- min(colstart + scrollvh[4] - 1, ncol(ev[[active$dataset]]))
                        
                        tosend$modified$dataset$theData <- as.list(ev[[active$dataset]][seq(rowstart, rowend), seq(colstart, colend)])
                        names(tosend$modified$dataset$theData) <- NULL
                        
                        numerics <- as.vector(unlist(lapply(ev[[active$dataset]], QCA::possibleNumeric)))
                        
                        calibrated <- as.vector(unlist(lapply(ev[[active$dataset]], function(x) {
                            all(na.omit(x) >= 0 & na.omit(x) <= 1)
                        })))
                        
                        tosend$modified$dataset$datainfo <- list(ncols=ncol(ev[[active$dataset]]),
                                              nrows=nrow(ev[[active$dataset]]),
                                              colnames=colnames(ev[[active$dataset]]),
                                              rownames=rownames(ev[[active$dataset]]),
                                              numerics=numerics, calibrated = calibrated)
                        tosend$modified$dataset$dataCoords <- paste(rowstart, colstart, rowend, colend, ncol(ev[[active$dataset]]), sep="_")
                    }
                    else if (nm == "tt" & !is.null(hashes1$tt)) {
                        
                    }
                    else if (nm == "calibcond") {
                        tosend$modified$calibcond <- list(vals = ev[[active$dataset]][[calibcond]])
                    
                        if (thinfo$th) {
                            tosend$modified$calibcond$thvals <- findTh(ev[[active$dataset]][, calibcond], n = thinfo$nth)
                        }
                    }
                }
            }
            
            session$sendCustomMessage(type = "Rcommand", tosend)
                
        }
        
    })
    
    observe({
        
        foo <- input$changes
        
        if (!is.null(foo)) {
        
            session$sendCustomMessage(type = "getChanges", readLines(system.file("ChangeLog", package="QCAGUI")))
        
        }
        
    })
    
    observe({
        
        foo <- input$help
        
        if (!is.null(foo)) {
        
            browseURL(file.path(path.package("QCAGUI"), "staticdocs", "index.html"))
            
        }
        
    })
    
    observe({
        
        foo <- input$pingobj
        
        if (!is.null(foo)) {
            
            session$sendCustomMessage(type = "ping", paste("bla", foo))
            
        }
        
    })
    
    observe({
        
        foo <- input$closeplot
        
        if (!is.null(foo)) {
            if (file.exists(svgfile)) {
                file.remove(svgfile)
            }
            grafic <<- emptyplot
            svg(filename = svgfile)
            replayPlot(grafic)
            sapply(dev.list(), dev.off)
        }
        
    })
    
    observe({
        
        foo <- input$saveRplot
        
        if (!is.null(foo)) {
            
            filename <- paste(foo$filename, foo$type, sep=".")
            
            if (foo$type == "png") {
                png(filename, width = plotsize[1]*96, height = plotsize[2]*96)
            }
            else if (foo$type == "bmp") {
                bmp(filename, width = plotsize[1]*96, height = plotsize[2]*96)
            }
            else if (foo$type == "jpeg") {
                jpeg(filename, width = plotsize[1]*96, height = plotsize[2]*96)
            }
            else if (foo$type == "tiff") {
                tiff(filename, width = plotsize[1]*96, height = plotsize[2]*96)
            }
            else if (foo$type == "svg") {
                svg(filename, width = plotsize[1], height = plotsize[2])
            }
            else if (foo$type == "pdf") {
                pdf(filename, width = plotsize[1], height = plotsize[2])
            }
            
            replayPlot(grafic)
            dev.off()
            
        }
        
    })
    
    observe({
        
        foo <- input$quit
        
        if (!is.null(foo)) {
            stopApp()
        }
        
    })
    
    observe({
        
        foo <- input$plotsize
        
        if (!is.null(foo)) {
            
            if (!identical(grafic, emptyplot)) {
                plotsize <<- foo
                svg(filename = svgfile, width = plotsize[1], height = plotsize[2])
                replayPlot(grafic)
                dev.off()
                
                session$sendCustomMessage(type = "resizePlot", TRUE)
                
            }
            else {
                
                session$sendCustomMessage(type = "resizePlot", FALSE)
            }
            
        }
        
    })
    
})

