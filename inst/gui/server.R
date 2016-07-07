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
    
    resfilename <- ""
    
    if (!identical(filepath, "")) {
        if (file_test("-f", filepath)) {
            
            extension <- file_ext(basename(filepath))
            resfilename <- gsub("[[:space:]]", "_", file_path_sans_ext(basename(filepath)))
            
            if (QCA::possibleNumeric(substr(resfilename, 1, 1))) {
                resfilename <- paste("x", resfilename, sep="")
            }
            
        }
    }
    
    result$filename <- resfilename
    result$extension <- extension
    result$wd <- getwd()
    
    return(result)
    
}

plusMessage <- unlist(strsplit(unlist(strsplit(tryCatch(eval(parse(text = "1+")), error = function(e) e)$message, "\n"))[1], ":"))
plusMessage <- QCA::trimst(plusMessage[length(plusMessage)])

copyEnv <- function(from, to, names = ls(from)) {
    mapply(assign, names, mget(names, from), list(to), SIMPLIFY = FALSE, USE.NAMES = FALSE)
    return(invisible(NULL))
}

infobjs <- function(env, objs, scrollvh) {
    misscroll <- missing(scrollvh)
    
    toreturn <- list(data = NULL, tt = NULL, qmc = NULL)
    if (length(objs) > 0) {
        objs <- unlist(lapply(mget(objs, env), function(x) {
            if (is.data.frame(x)) {
                return(1)
            }
            else if (is(x, "tt")) {
                return(2)
            }
            else if (is(x, "qca")) {
                return(3)
            }
            else {
                return(0)
            }
        }))
        
        if (any(objs == 1)) {
            toreturn$data <- lapply(names(objs[objs == 1]), function(n) {
                
                x <- env[[n]]
                dscrollvh <- c(1, 1)
                
                if (!misscroll) {
                    if (n %in% names(scrollvh)) {
                        dscrollvh <- scrollvh[[n]]
                    }
                }
                
                nrowd <- nrow(x)
                ncold <- ncol(x)
                
                srow <- min(dscrollvh[1], nrowd - min(nrowd, visiblerows) + 1)
                scol <- min(dscrollvh[2], ncold - min(ncold, visiblecols) + 1)
                erow <- min(srow + visiblerows - 1, nrowd)
                ecol <- min(scol + visiblecols - 1, ncold)
                
                list(
                    nrows = nrowd,
                    ncols = ncold,
                    rownames = rownames(x),
                    colnames = colnames(x),
                    numerics = as.vector(unlist(lapply(x, QCA::possibleNumeric))),
                    calibrated = as.vector(unlist(lapply(x, function(x) {
                        all(na.omit(x) >= 0 & na.omit(x) <= 1)
                    }))),
                    binary = as.vector(unlist(lapply(x, function(x) all(x %in% 0:1)))),
                    scrollvh = c(srow, scol) - 1, 
                    theData = x[seq(srow, erow), seq(scol, ecol), drop = FALSE],
                    dataCoords = paste(srow, scol, erow, ecol, ncol(x), sep="_")
                )
                
            })
            names(toreturn$data) <- names(objs[objs == 1])
        }
        
        if (any(objs == 2)) {
            toreturn$tt <- lapply(mget(names(objs[objs == 2]), env), function(x) {
                components <- c("indexes", "noflevels", "cases", "options", "colnames", "numerics")
                
                x$indexes <- x$indexes - 1 
                x$options$conditions <- toupper(x$options$conditions)
                
                cnds <- x$options$conditions
                if (x$options$use.letters) {
                    cnds <- LETTERS[seq(length(cnds))]
                }
                
                if (length(x$options$incl.cut) == 1) {
                    x$options$incl.cut <- list(x$options$incl.cut)
                }
                
                if (length(cnds) <= 7) {
                    x$id <- apply(x$tt[, cnds], 1, function(x) {
                        ifelse(any(x == 1), paste(which(x == 1), collapse=""), "0")
                    })
                    components <- c(components, "id")
                }
                
                x$colnames <- colnames(x$initial.data)
                x$numerics <- as.vector(unlist(lapply(x$initial.data, QCA::possibleNumeric)))
                
                return(x[components])
            })
        }
        
        if (any(objs == 3)) {
            toreturn$qmc <- lapply(mget(names(objs[objs == 3]), env), function(x) {
                components <- c("indexes", "noflevels", "cases", "options")
                x <- x$tt
                x$options$conditions <- toupper(x$options$conditions)
                
                cnds <- x$options$conditions
                
                if (x$options$use.letters) {
                    cnds <- LETTERS[seq(length(cnds))]
                }
                
                if (length(cnds) <= 7) {
                    x$id <- apply(x$tt[, cnds], 1, function(x) {
                        ifelse(any(x == 1), paste(which(x == 1), collapse=""), "0")
                    })
                    components <- c(components, "id")
                }
                
                x$indexes <- x$indexes - 1 
                return(x[components])
            })
        }
    }
    
    return(toreturn)
}

ev <- new.env(parent = globalenv())

hashes <- list()
caliblist <- list(dataset = "", condition = "", findth = FALSE, nth = 1)
templotfile <- file.path(tempdir(), "plot.pdf")
visiblerows <- 17
visiblecols <- 8

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

extension <- ""
tcisdata <- TRUE

shinyServer(function(input, output, session) {
    
    observe({
        dirfilist <- input$dirfilist
        
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
                
                current_path <<- gsub("//", "/", current_path)
                
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
            
            filename <- unlist(strsplit(basename(filepath), split="\\."))
            filename <- filename[-length(filename)]
            if (length(filename) > 1) {
                filename <- paste(filename, collapse=".")
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
                    cnames <- colnames(tempdata)
                    if (length(cnames) == 1) {
                        cnames = list(cnames)
                    }
                    rnames <- rownames(tempdata)
                    if (length(rnames) == 1) {
                        rnames = list(rnames)
                    }
                    
                    session$sendCustomMessage(type = "tempdatainfo", list(ncols=ncol(tempdata),
                                                                     nrows=nrow(tempdata),
                                                                     colnames=cnames,
                                                                     rownames=rnames))
                    
                }
            }
        }
        
    })
    
    observe({
        
        foo <- input$import
        
        if (!is.null(foo) & tcisdata) {
            
            result <- list(infobjs = NULL, console = NULL)
            
            if (foo$nameit) {
                ev[[foo$objname]] <- tempdata
            }
            else {
                result$console <- c(capture.output(tempdata), "")
            }
            
            result$infobjs <- infobjs(ev, ls(ev))
            
            session$sendCustomMessage(type = "fullinfo", result)
            
        }
    })
    
    observe({
        foo <- input$scrollobj
        
        if (!is.null(foo)) {
            
            scrollvh <- lapply(foo$scrollvh, function(x) unlist(x) + 1)
            visiblerows <<- foo$visiblerows + 1
            visiblecols <<- foo$visiblecols + 1
            
            if (!foo$alldata) {
                scrollvh <- scrollvh[foo$dataset]
            }
            
            tosend <- vector(mode = "list", length = length(scrollvh))
            names(tosend) <- names(scrollvh)
            
            for (n in names(scrollvh)) {
                
                nrowd <- nrow(ev[[n]])
                ncold <- ncol(ev[[n]])
                
                dscrollvh <- scrollvh[[n]]
                srow <- min(dscrollvh[1], nrowd - min(nrowd, visiblerows) + 1)
                scol <- min(dscrollvh[2], ncold - min(ncold, visiblecols) + 1)
                erow <- min(srow + visiblerows - 1, nrowd)
                ecol <- min(scol + visiblecols - 1, ncold)
                
                tosend[[n]] <- list(
                    theData = ev[[n]][seq(srow, erow), seq(scol, ecol), drop = FALSE],
                    dataCoords = paste(srow, scol, erow, ecol, ncold, sep="_"),
                    scrollvh = c(srow, scol) - 1
                )
            }
            
            session$sendCustomMessage(type = "scrollData", tosend)
        }   
    })
    
    observe({
        foo <- input$dataModif
        
        if (!is.null(foo)) {
            
            if (is.null(foo$row)) {
                colnames(ev[[foo$dataset]])[foo$col] <- foo$val
            }
            else if (is.null(foo$col)) {
                rownames(ev[[foo$dataset]])[foo$row] <- foo$val
            }
            else {
                if (identical(foo$val, "")) {
                    foo$val <- NA
                }
                ev[[foo$dataset]][foo$row, foo$col] <- foo$val
            }
        }
    })
    
    observe({
        
        foo <- input$eqmcc2R
        
        if (!is.null(foo)) {
        if (!identical(foo$dataset, "")) { 
        if (!is.null(ev[[foo$dataset]])) { 
            
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
            
            tosend <- list(error = NULL, warning = NULL, console = NULL, tt = NULL, infobjs = NULL)
            
            tryit <- tryCatch(
                    myobj <- eqmcc(ev[[foo$dataset]], outcome = outc,
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
                          
                          via.web=TRUE),
                  error = function(e) e)
            
            if (inherits(tryit, "error")) {
                tosend$error <- gsub("undefined columns selected>",
                                     "Column names in the command don't match those in the interface.",
                                     gsub("\\n", "<br>", tryit$message))
                tosend$error[1] <- paste("Error:", tosend$error[1])
                
                if (length(tryit$message) == 1) {
                    tosend$error <- list(tosend$error)
                }
            }
            else {
                tosend$console <- capture.output(myobj)[-1]
                
                if (!identical(foo$objname, "")) { 
                    ev[[foo$objname]] <- myobj
                    tosend$infobjs <- infobjs(ev, foo$objname)
                }
                
                if (inherits(tryit, "warning")) {
                    tosend$warning <- tryit$message
                    tosend$warning[1] <- paste("Warning:", tosend$warning[1])
                    if (length(tryit$message) == 1) {
                        tosend$warning <- list(tryit$message)
                    }
                }
            }
            
            if (length(cnds) <= 7) { 
                
                if (!identical(outc, "")) { 
                    if (length(QCA::splitstr(outc)) == 1 & !is.null(myobj)) {
                        
                        myobj$tt$initial.data <- NULL
                        myobj$tt$recoded.data <- NULL
                        myobj$tt$indexes <- myobj$tt$indexes - 1 
                        myobj$tt$options$conditions <- toupper(myobj$tt$options$conditions)
                        if (identical(cnds, "")) {
                            cnds <- myobj$tt$options$conditions
                        }
                        
                        if (use_letters) {
                            cnds <- LETTERS[seq(length(cnds))]
                        }
                        
                        myobj$tt$id <- apply(myobj$tt$tt[, toupper(cnds)], 1, function(x) {
                            ifelse(any(x == 1), paste(which(x == 1), collapse=""), "0")
                        })
                        
                        tosend$tt <- myobj$tt
                    }
                }
            }
            
            session$sendCustomMessage(type = "tt_eq", tosend)
            
        }
        }
        }
        
    })
    
    observe({
        
        foo <- input$tt2R
        
        if (!is.null(foo)) {
        if (!identical(foo$dataset, "")) {
        if (!is.null(ev[[foo$dataset]])) {
            
            outc <- ""
            if (length(foo$outcome) > 0) {
                outc <- unlist(foo$outcome)
            }
            
            cnds <- ""
            if (length(foo$conditions) > 0) {
                cnds <- QCA::splitstr(unlist(foo$conditions))
            }
            
            sortbys  <- unlist(foo$sort_by)
            selected <- unlist(foo$sort_sel)
            sortbys  <- sortbys[selected[names(sortbys)]]
            
            if (length(sortbys) == 0) {
                sortbys <- ""
            }
            
            use_letters <- foo$use_letters
            
            myobj <- NULL
            
            incl.cut <- c(as.numeric(foo$ic1), as.numeric(foo$ic0))
            
            tosend <- list(error = NULL, warning = NULL, console = NULL, tt = NULL, infobjs = NULL)
            
            tryit <- tryCatch(
                    myobj <- truthTable(ev[[foo$dataset]], outcome = outc,
                          neg.out = foo$neg_out,
                          conditions = cnds,
                          n.cut = as.numeric(foo$n_cut),
                          incl.cut = incl.cut[!is.na(incl.cut)],
                          complete = foo$complete,
                          show.cases = foo$show_cases,
                          sort.by = sortbys,
                          
                          use.letters = foo$use_letters),
                 error = function(e) e)
            
            if (inherits(tryit, "error")) {
                tosend$error <- gsub("undefined columns selected>",
                                     "Column names in the command don't match those in the interface.",
                                     gsub("\\n", "<br>", tryit$message))
                tosend$error[1] <- paste("Error:", tosend$error[1])
                
                if (length(tryit$message) == 1) {
                    tosend$error <- list(tosend$error)
                }
            }
            else {
                tosend$console <- capture.output(myobj)[-1]
                
                if (!identical(foo$objname, "")) { 
                    ev[[foo$objname]] <- myobj
                    tosend$infobjs <- infobjs(ev, foo$objname)
                }
                
                if (inherits(tryit, "warning")) {
                    tosend$warning <- tryit$message
                    tosend$warning[1] <- paste("Warning:", tosend$warning[1])
                    if (length(tryit$message) == 1) {
                        tosend$warning <- list(tryit$message)
                    }
                }
            }
            
            if (length(cnds) <= 7) { 
                if (!is.null(myobj)) {
                    myobj$initial.data <- NULL
                    myobj$recoded.data <- NULL
                    myobj$indexes <- myobj$indexes - 1 
                    myobj$options$conditions <- toupper(myobj$options$conditions)
                    if (identical(cnds, "")) {
                        cnds <- myobj$options$conditions
                    }
                    
                    if (use_letters) {
                        cnds <- LETTERS[seq(length(cnds))]
                    }
                    
                    myobj$id <- apply(myobj$tt[, toupper(cnds)], 1, function(x) {
                        ifelse(any(x == 1), paste(which(x == 1), collapse=""), "0")
                    })
                    
                    tosend$tt <- myobj
                }
            }
            
            session$sendCustomMessage(type = "tt_eq", tosend)
            
        }
        }
        }
    })
    
    observe({
        foo <- input$thinfo
        
        if (!is.null(foo)) {
            
            response <- list()
            response$message <- "OK"
            
            if (foo$condition != "") {
                foo$nth <- as.numeric(foo$nth)
                
                if (QCA::possibleNumeric((ev[[foo$dataset]][, foo$condition]))) {
                    
                    caliblist <<- foo[c("dataset", "condition", "findth", "nth")]
                    
                    response$vals <- unname(ev[[foo$dataset]][, foo$condition])
                    response$thvals <- vector(length = 0)
                    if (foo$findth) {
                        response$thvals <- findTh(ev[[foo$dataset]][, foo$condition], n = foo$nth)
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
        foo <- input$exportobj
        
        if (!is.null(foo)) {
            
            filesep <- foo$sep
            if (filesep == "tab") {
                filesep <- "\t"
            }
            
            separator <- foo$sep
            filetowrite <- file.path(current_path, foo$filename)
            
            if (foo$newfile) {
                if (foo$filename != "") {
                    filetowrite <- file.path(current_path, foo$filename)
                }
            }
            
            export(ev[[foo$dataset]], filetowrite, sep=filesep, col.names=foo$header, caseid=foo$caseid)
        }
    })
    
    observe({
        foo <- input$calibrate
        
        if (!is.null(foo)) {
            scrollvh <- lapply(foo$scrollvh, function(x) unlist(x) + 1)
            checks <- rep(TRUE, 9)
            
            checks[1] <- !is.null(ev[[foo$dataset]])
            
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
            
            checks[4] <- foo$x != ""
            
            if (checks[1] & checks[4]) {
                
                if (foo$x %in% names(ev[[foo$dataset]])) {
                    checks[6] <- is.numeric(ev[[foo$dataset]][, foo$x])
                }
            }
            
            if (QCA::possibleNumeric(foo$idm)) {
                foo$idm <- as.numeric(foo$idm)
            }
            
            if (QCA::possibleNumeric(foo$below)) {
                foo$below <- as.numeric(foo$below)
            }
            
            if (QCA::possibleNumeric(foo$above)) {
                foo$above <- as.numeric(foo$above)
            }
            
            if (all(checks)) {
                
                textoutput <- capture.output(tryCatch(
                    calibrate(
                        ev[[foo$dataset]][, foo$x],
                        type = foo$type,
                        thresholds = foo$thresholds,
                        include = foo$include,
                        logistic = foo$logistic,
                        idm = foo$idm,
                        ecdf = foo$ecdf,
                        below = foo$below,
                        above = foo$above), error = function(e) e)
                )
                
                response <- list()
                response$origin <- "calibrate"
                response$error <- FALSE
                response$toprint <- ""
                
                if (any(error <- grepl("Error", textoutput))) {
                    errmessage <- paste0("Error:", unlist(strsplit(textoutput[which(error)], split=":"))[2])
                    errmessage <- substr(errmessage, 1, nchar(errmessage) - 1)
                    response$error <- TRUE
                    response$toprint <- errmessage
                }
                else {
                    
                    ev[[foo$dataset]][, ifelse(foo$newvar != "", foo$newvar, foo$x)] <- calibrate(
                            ev[[foo$dataset]][, foo$x],
                            type = foo$type,
                            thresholds = foo$thresholds,
                            include = foo$include,
                            logistic = foo$logistic,
                            idm = foo$idm,
                            ecdf = foo$ecdf,
                            below = foo$below,
                            above = foo$above)
                }
                
                response$infobjs <- infobjs(ev, foo$dataset, scrollvh)
                
                response$toprint <- paste(response$toprint, collapse = "<br>")
                response$dataset <- foo$dataset
                if (foo$same & foo$x == caliblist$condition) { 
                    
                    response$poinths <- list(dataset = caliblist$dataset,
                                         condition = caliblist$condition,
                                         vals = unname(ev[[caliblist$dataset]][, caliblist$condition]))
                    if (caliblist$findth) {
                        response$poinths$thvals <- findTh(ev[[caliblist$dataset]][, caliblist$condition], n = caliblist$nth)
                        if (length(response$poinths$thvals) == 1) {
                            
                            response$poinths$thvals <- as.list(response$poinths$thvals)
                        }
                        response$poinths$message <- "OK"
                    }
                }
                session$sendCustomMessage(type = "calibrate", response)
                
            }
        }
        
    })
    
    observe({
        foo <- input$recode
        
        if (!is.null(foo)) {
            
            scrollvh <- lapply(foo$scrollvh, function(x) unlist(x) + 1)
            
            checks <- rep(TRUE, 2)
            
            checks[1] <- !is.null(ev[[foo$dataset]])
            
            checks[2] <- foo$x != ""
            
            foo$oldv <- unlist(foo$oldv)
            foo$newv <- unlist(foo$newv)
            uniques <- unique(foo$newv)
            
            rules <- ""
            for (i in seq(length(uniques))) {
                part <- paste(paste(foo$oldv[foo$newv == uniques[i]], collapse = ","), uniques[i], sep="=")
                rules <- paste(rules, part, ifelse(i == length(uniques), "", "; "), sep="")
            }
            
            if (all(checks)) {
                
                textoutput <- tryCatch(recode(ev[[foo$dataset]][, foo$x], rules = rules),
                                       error = function(e) e)
                
                response <- list()
                response$origin <- "recode"
                response$error <- FALSE
                response$toprint <- ""
                
                if (inherits(textoutput, "error")) {
                    response$error <- TRUE
                    response$toprint <- textoutput$message
                }
                else {
                    xvar <- ifelse(!foo$same & foo$newvar != "", foo$newvar, foo$x)
                    ev[[foo$dataset]][, xvar] <- recode(ev[[foo$dataset]][, foo$x], rules = rules)
                }
                
                response$infobjs <- infobjs(ev, foo$dataset, scrollvh)
                response$toprint <- paste(response$toprint, collapse = "<br>")
                response$dataset <- foo$dataset
                session$sendCustomMessage(type = "recode", response)
                
            }
        }
        
    })
    
    observe({
        foo <- input$xyplot
        
        if (!is.null(foo)) {
            
            if (all(c(foo$x, foo$y) %in% names(ev[[foo$dataset]]))) {
                
                X <- ev[[foo$dataset]][, foo$x]
                Y <- ev[[foo$dataset]][, foo$y]
                
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
                
                response = list(rownames(ev[[foo$dataset]]),
                                ev[[foo$dataset]][, foo$x],
                                ev[[foo$dataset]][, foo$y],
                                rpofsuf,
                                rpofnec)
                session$sendCustomMessage(type = "xyplot", response)
                
            }
        }
    })
    
    observe({
        
        foo <- input$Rcommand
        
        if (!is.null(foo)) {
            
            scrollvh <- lapply(foo$scrollvh, function(x) unlist(x) + 1)
            
            thinfo <- foo$thinfo
            
            hashes_before <- lapply(ev, function(x) {
                fastdigest(x)
            })
            
            caliblist_before <- ""
            
            if (!identical(caliblist[1:2], list(dataset = "", condition = ""))) {
                caliblist_before <- fastdigest(ev[[caliblist$dataset]][[caliblist$condition]])
            }
            
            if (length(dev.list()) > 0) {
                sapply(dev.list(), dev.off)
            }
            
            fromto <- matrix(asNumeric(unlist(foo$brackets)) + 1, ncol = 2, byrow = TRUE)
            
            foo <- trimst(unlist(strsplit(foo$command, split = "\n")))
            foo <- apply(fromto, 1, function(x) paste(foo[seq(x[1], x[2])], collapse = " "))
            
            tosend <- list(result = NULL, error = NULL, warning = NULL, plot = FALSE, added = NULL, modified = NULL, deleted = NULL)
            
            forbidden <- "dev.new\\(|plot.new\\(|plot.window\\(|X11\\(|quartz\\(|dev.set\\(|windows\\("
            
            if (any(grepl(forbidden, foo))) {
                tosend$error <- "Opening multiple graphics devices is not supported."
            }
            else {
                   
                if (any(ggplot <- grep("ggplot\\(|qplot\\(|quickplot\\(", foo))) {
                    foo[ggplot] <- paste("SOMEBIGNAME <- ", foo[ggplot])
                    foo <- c(foo, "print(SOMEBIGNAME)")
                }
                
                testplot <- emptyplot 
                
                rm(list = ls(envir = globalenv()), envir = globalenv())
                
                ev2 <- new.env(parent = globalenv())
                if (length(names(ev)) > 0) {
                    copyEnv(ev, ev2)
                }
                
                pdf(templotfile)
                dev.control("enable")
                tc <- tryCatch(eval(parse(text = foo), envir = ev2), error = function(e) e, warning = function(w) w)
                
                globjs <- ls(envir = globalenv())
                
                if (length(globjs) >= 0) {
                    
                    for (i in globjs) { 
                        assign(i, get(i, globalenv()), ev)
                    }
                    rm(list = ls(envir = globalenv()), envir = globalenv())
                }
                
                if (length(dev.list()) > 0) {
                    testplot <- recordPlot()
                    sapply(dev.list(), dev.off)
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
                else if (length(capture.output(tc)) > 0) {
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
            
            hashes_after <- lapply(ev, function(x) {
                fastdigest(x)
            })
            
            caliblist_after <- ""
            if (!identical(caliblist[1:2], list(dataset = "", condition = ""))) {
                caliblist_after <- fastdigest(ev[[caliblist$dataset]][[caliblist$condition]])
            }
            
            added <- setdiff(names(hashes_after), names(hashes_before))
            deleted <- setdiff(names(hashes_before), names(hashes_after))
            common <- intersect(names(hashes_before), names(hashes_after))
            modified <- names(hashes_before)[!is.element(hashes_before[common], hashes_after[common])]
            
            if (length(modified) > 0) {
                tosend$modified <- infobjs(ev, modified, scrollvh)
            }
            
            if (length(added) > 0) {
                tosend$added <- infobjs(ev, added)
            }
            
            if (length(deleted) > 0) {
                tosend$deleted <- as.list(deleted)
            }
            
            if (!identical(caliblist_before, caliblist_after)) {
                tosend$poinths <- list(dataset = caliblist$dataset,
                                       condition = caliblist$condition,
                                       vals = unname(as.vector(ev[[caliblist$dataset]][, caliblist$condition])))
                if (caliblist$findth) {
                    tosend$poinths$thvals <- findTh(ev[[caliblist$dataset]][, caliblist$condition], n = caliblist$nth)
                    if (length(tosend$poinths$thvals) == 1) {
                        
                        tosend$poinths$thvals <- as.list(tosend$poinths$thvals)
                    }
                    tosend$poinths$message <- "OK"
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
            
            session$sendCustomMessage(type = "ping", paste("bar", foo))
            
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
    
    session$sendCustomMessage(type = "fullinfo", list(infobjs = infobjs(ev, ls(ev)), console = NULL))
        
})

