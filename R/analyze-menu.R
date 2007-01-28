# last modified 26 May 2006 by A. Dusa

# Analyze menu dialogs

truth.table <- function() {
    require(QCA)
    dataSet <- activeDataSet()
    variableList <- eval(parse(text=paste("names(", dataSet,")")), envir=.GlobalEnv)
    if (getRcmdr("sort.names")) variableList <- sort(variableList)
    
    top <- tktoplevel()
    tkwm.title(top, "Analyze the truth table for the active dataset")
    
    onOK <- function() {
        showcases <- tclvalue(showcasesVariable) == "1"
        complete <- tclvalue(completeVariable) == "1"
        outcomeVar <- variableList[as.integer(tkcurselection(outcomeBox)) + 1]
        conditionsVar <- variableList[as.integer(tkcurselection(conditionsBox)) + 1]
        cndts <- paste('c("', paste(conditionsVar, collapse='", "'), '")', sep="")
        if (length(conditionsVar) > 0) {
            command <- paste('truthTable(', dataSet, ', outcome=', paste('"', outcomeVar, '"', sep=""),
            ', conditions=', cndts, ', show.cases=', showcases, ', complete=', complete, ')', sep="")
            } else {
            command <- paste('truthTable(', dataSet, ', outcome=', paste('"', outcomeVar, '"', sep=""),
                ', show.cases=', showcases, ', complete=', complete, ')', sep="")
            }
        doItAndPrint(command)
        tkdestroy(top)
        tkfocus(CommanderWindow())
        }
    
    top1 <- tkframe(top)
    
    top1Left <- tkframe(top1)
    outcomeBox <- tklistbox(top1Left, height=min(5, length(variableList)),
                            selectmode="single", background="white", exportselection=FALSE)
    scrollbarLeft <- tkscrollbar(top1Left, repeatinterval=5, command=function(...) tkyview(outcomeBox, ...))
    tkconfigure(outcomeBox, yscrollcommand=function(...) tkset(scrollbarLeft, ...))
    for (var in variableList) tkinsert(outcomeBox, "end", var)
    tkgrid(tklabel(top1Left, text="Select the outcome variable\n(only one)", fg="blue"), sticky="w")
    tkgrid(outcomeBox, scrollbarLeft, sticky="nw")
    tkgrid.configure(scrollbarLeft, sticky="wns")
    tkgrid.configure(outcomeBox, sticky="ew")
    
    top1Middle <- tkframe(top1)
    tkgrid(tklabel(top1Middle, text="  "))
    
    top1Right <- tkframe(top1)
    selectmodeRcmdr <- getRcmdr("multiple.select.mode")
    conditionsBox <- tklistbox(top1Right, height=min(5, length(variableList)),
                               selectmode=selectmodeRcmdr, background="white", exportselection=FALSE)
    scrollbarRight <- tkscrollbar(top1Right, repeatinterval=5, command=function(...) tkyview(conditionsBox, ...))
    tkconfigure(conditionsBox, yscrollcommand=function(...) tkset(scrollbarRight, ...))
    for (var in variableList) tkinsert(conditionsBox, "end", var)
    tkgrid(tklabel(top1Right, text="Select the conditions\n(two or more)", fg="blue"), sticky="w")
    tkgrid(conditionsBox, scrollbarRight, sticky="nw")
    tkgrid.configure(scrollbarRight, sticky="wns")
    tkgrid.configure(conditionsBox, sticky="ew")
    
    tkpack(top1Left, top1Middle, top1Right, side="left")
    
    top2 <- tkframe(top)
    
    tkgrid(tklabel(top2, text=" ")) # Blank line
    
    cbOptions <- c("showcases", "complete")
    cbLabels <- c("Show cases:", "Complete:")
    initialValues <- c(1, 0)
    
    for (i in 1:length(cbOptions)) {
        cbText <- paste(cbOptions[i], "Text", sep="")
        assign(cbText, tklabel(top2, text=cbLabels[i]))
        CheckBox <- paste(cbOptions[i], "CB", sep="")
        assign(CheckBox, tkcheckbutton(top2))
        cbVariable <- paste(cbOptions[i], "Variable", sep="")
        assign(cbVariable, tclVar(initialValues[i]))
        tkconfigure(get(CheckBox), variable=get(cbVariable))
        tkgrid(get(cbText), get(CheckBox), sticky="e")
        }
    
    tkgrid(tklabel(top2, text=" ")) # Blank line
    
    OKCancelHelp(helpSubject="truthTable")  
    
    tkpack(top1, top2, buttonsFrame, side="top")
    }




q.mc.c <- function() {
    require(QCA)
    dataSet <- activeDataSet()
    variableList <- eval(parse(text=paste("names(", dataSet,")")), envir=.GlobalEnv)
    if (getRcmdr("sort.names")) variableList <- sort(variableList)
    
    top <- tktoplevel()
    tkwm.title(top, "Perform the Quine-McCluskey minimization algorithm")
    
    onOK <- function(){
        diffmat <- tclvalue(diffmatVariable) == "1"
        quiet <- tclvalue(quietVariable) == "1"
        details <- tclvalue(detailsVariable) == "1"
        chart <- tclvalue(chartVariable) == "1"
        use.letters <- tclvalue(uselettersVariable) == "1"
        show.cases <- tclvalue(showcasesVariable) == "1"
        #tt <- tclvalue(truthtableVariable) == "1"
        
        outcome1 <- as.character(tclvalue(outcome1Variable))
        outcome0 <- as.character(tclvalue(outcome0Variable))
        contradictions <- as.character(tclvalue(contradictionsVariable))
        remainders <- as.character(tclvalue(remaindersVariable))
        
        incl.rem <- expl.1 <- expl.0 <- expl.ctr <- incl.1 <- incl.0 <- incl.ctr <- FALSE
        
        aa <- c("expl.1", "expl.0", "expl.ctr", "incl.1", "incl.0", "incl.ctr", "incl.rem",
                "quiet", "details", "chart", "use.letters", "show.cases")
        bb <- c( expl.1,   expl.0,   expl.ctr,   incl.1,   incl.0,   incl.ctr,   incl.rem,
                 quiet,   details,   chart,   use.letters,   show.cases)
        
        bb[c(1, 4, 2, 5, 3, 6)] <- c(sapply(c(outcome1, outcome0, contradictions),
                                              function(idx) idx == c("explain", "include")))
        if (remainders == "include") {bb[7] <- TRUE}
        
        TFoptions <- paste(aa[bb], collapse="=TRUE, ")
        if (!diffmat) TFoptions <- paste(TFoptions, "diffmat=FALSE, ", sep="") 
        
        
        if (length(aa[bb]) == 0) {
            qmcc.options <- ""
            }
        else {
            qmcc.options <- paste(", ", paste(aa[bb], collapse="=TRUE, "), "=TRUE", sep="")
            if (!diffmat) qmcc.options <- paste(qmcc.options, ", diffmat=FALSE", sep="")
            }
        
        outcomeVar <- variableList[as.integer(tkcurselection(outcomeBox)) + 1]
        conditionsVar <- variableList[as.integer(tkcurselection(conditionsBox)) + 1]
        cndts <- paste(', conditions=c("', paste(conditionsVar, collapse='", "'), '")', sep="")
        if (length(conditionsVar) == 0) {cndts <- ""}
        
        command <- paste('qmcc(', dataSet, ', outcome=', paste('"', outcomeVar, '"', sep=""), cndts, qmcc.options, ')', sep="")
            
        
        doItAndPrint(command)
        tkdestroy(top)
        tkfocus(CommanderWindow())
        }
    
    onCancel <- function() {
        tkdestroy(top)
        tkfocus(CommanderWindow())
        }
    
    top1 <- tkframe(top)
    
    top1Left <- tkframe(top1)
    outcomeBox <- tklistbox(top1Left, height=min(5, length(variableList)),
                            selectmode="single", background="white", exportselection=FALSE)
    scrollbarLeft <- tkscrollbar(top1Left, repeatinterval=5, command=function(...) tkyview(outcomeBox, ...))
    tkconfigure(outcomeBox, yscrollcommand=function(...) tkset(scrollbarLeft, ...))
    for (var in variableList) tkinsert(outcomeBox, "end", var)
    tkgrid(tklabel(top1Left, text="Select the outcome variable\n(only one)", fg="blue"), sticky="w")
    tkgrid(outcomeBox, scrollbarLeft, sticky="nw")
    tkgrid.configure(scrollbarLeft, sticky="wns")
    tkgrid.configure(outcomeBox, sticky="ew")
    
    top1Middle <- tkframe(top1)
    tkgrid(tklabel(top1Middle, text="  "))
    
    top1Right <- tkframe(top1)
    selectmodeRcmdr <- getRcmdr("multiple.select.mode")
    conditionsBox <- tklistbox(top1Right, height=min(5, length(variableList)),
                               selectmode=selectmodeRcmdr, background="white", exportselection=FALSE)
    scrollbarRight <- tkscrollbar(top1Right, repeatinterval=5, command=function(...) tkyview(conditionsBox, ...))
    tkconfigure(conditionsBox, yscrollcommand=function(...) tkset(scrollbarRight, ...))
    for (var in variableList) tkinsert(conditionsBox, "end", var)
    tkgrid(tklabel(top1Right, text="Select the conditions\n(two or more)", fg="blue"), sticky="w")
    tkgrid(conditionsBox, scrollbarRight, sticky="nw")
    tkgrid.configure(scrollbarRight, sticky="wns")
    tkgrid.configure(conditionsBox, sticky="ew")
    
    tkpack(top1Left, top1Middle, top1Right, side="left")
    
    top2 <- tkframe(top)
    
    tkgrid(tklabel(top2, text=" ")) # Blank line
    
    text0 <- tklabel(top2, text="   ")
    text1 <- tklabel(top2, text="Outcome 0  ")
    text2 <- tklabel(top2, text="Outcome 1  ")
    text3 <- tklabel(top2, text="Contradictions  ")
    text4 <- tklabel(top2, text="Remainders  ")
    
    frame0 <- tkframe(top2)
    tkgrid(tklabel(frame0, text="Explain  "), 
           tklabel(frame0, text="Include for\nreduction"),
           tklabel(frame0, text="  Exclude"))
    tkgrid(text0, frame0)
    
    values <- c("explain", "include", "exclude")
    
    frame1 <- tkframe(top2, relief="ridge", borderwidth=2)
    outcome0Variable <- tclVar("exclude")
    frame1rb1 <- tkradiobutton(frame1, variable=outcome0Variable, value=values[1])
    frame1rb2 <- tkradiobutton(frame1, variable=outcome0Variable, value=values[2])
    frame1rb3 <- tkradiobutton(frame1, variable=outcome0Variable, value=values[3])
    tkgrid(frame1rb1, tklabel(frame1, text="        "), frame1rb2, tklabel(frame1, text="        "), frame1rb3)
    tkgrid(text1, frame1)
    
    frame2 <- tkframe(top2, relief="ridge", borderwidth=2)
    outcome1Variable <- tclVar("explain")
    frame2rb1 <- tkradiobutton(frame2, variable=outcome1Variable, value=values[1])
    frame2rb2 <- tkradiobutton(frame2, variable=outcome1Variable, value=values[2])
    frame2rb3 <- tkradiobutton(frame2, variable=outcome1Variable, value=values[3])
    tkgrid(frame2rb1, tklabel(frame2, text="        "), frame2rb2, tklabel(frame2, text="        "), frame2rb3)
    tkgrid(text2, frame2)
    
    frame3 <- tkframe(top2, relief="ridge", borderwidth=2)
    contradictionsVariable <- tclVar("exclude")
    frame3rb1 <- tkradiobutton(frame3, variable=contradictionsVariable, value=values[1])
    frame3rb2 <- tkradiobutton(frame3, variable=contradictionsVariable, value=values[2])
    frame3rb3 <- tkradiobutton(frame3, variable=contradictionsVariable, value=values[3])
    tkgrid(frame3rb1, tklabel(frame3, text="        "), frame3rb2, tklabel(frame3, text="        "), frame3rb3)
    tkgrid(text3, frame3)
    
    frame4 <- tkframe(top2, relief="ridge", borderwidth=2)
    remaindersVariable <- tclVar("include")
    frame4rb1 <- tkradiobutton(frame4, variable=remaindersVariable, value=values[1], state="disabled")
    frame4rb2 <- tkradiobutton(frame4, variable=remaindersVariable, value=values[2])
    frame4rb3 <- tkradiobutton(frame4, variable=remaindersVariable, value=values[3])
    tkgrid(frame4rb1, tklabel(frame4, text="        "), frame4rb2, tklabel(frame4, text="        "), frame4rb3)
    tkgrid(text4, frame4)
    
    tkgrid.configure(text0, text1, text2, text3, text4, sticky="e")
    
    tkgrid(tklabel(top2, text=" ")) # Blank line
    
    top3 <- tkframe(top)
    
    cbOptions <- c("diffmat", "useletters", "chart", "showcases", "details", "quiet")
    cbLabels <- c("Generate differences matrix:", "Use letters instead variables' names:", 
                  "Show prime implicants chart:", "Show cases for solution:",
                  "Some details:", "Quiet (no details at all):")
    initialValues <- c(1, 1, 0, 0, 0, 0)
    
    CBvalues <- rep(FALSE, 4)
    modified <- rep(FALSE, 3)
    
    chartCommand <- function() {
        if (CBvalues[4]) {
            tkdeselect(quietCB)
            CBvalues[2:4] <<- FALSE
            }
        CBvalues[1] <<- !CBvalues[1]
        modified[1:3] <<- FALSE
        }
    
    showcasesCommand <- function() {
        if (CBvalues[4]) {
            tkdeselect(quietCB)
            CBvalues[c(1, 3, 4)] <<- FALSE
            }
        CBvalues[2] <<- !CBvalues[2]
        modified[1:3] <<- FALSE
        }
    
    detailsCommand <- function() {
        if (CBvalues[4]) {
            tkdeselect(quietCB)
            CBvalues[c(1, 2, 4)] <<- FALSE
            }
        CBvalues[3] <<- !CBvalues[3]
        modified[1:3] <<- FALSE
        }
    
    quietCommand <- function() {
        if (!CBvalues[4]) {
            CBvalues[4] <<- !CBvalues[4]
            if (CBvalues[1]) {
                modified[1] <<- TRUE
                CBvalues[1] <<- !CBvalues[1]
                tkdeselect(chartCB)
                }
            if (CBvalues[2]) {
                modified[2] <<- TRUE
                CBvalues[2] <<- !CBvalues[2]
                tkdeselect(showcasesCB)
                }
            if (CBvalues[3]) {
                modified[3] <<- TRUE
                CBvalues[3] <<- !CBvalues[3]
                tkdeselect(detailsCB)
                }
            } else {
            CBvalues[4] <<- !CBvalues[4]
            if (modified[1]) {
                CBvalues[1] <<- !CBvalues[1]
                tkselect(chartCB)
                }
            if (modified[2]) {
                CBvalues[2] <<- !CBvalues[2]
                tkselect(showcasesCB)
                }
            if (modified[3]) {
                CBvalues[3] <<- !CBvalues[3]
                tkselect(detailsCB)
                }
            }
        }
    
    for (i in 1:6) {
        CheckBox <- paste(cbOptions[i], "CB", sep="")
        assign(CheckBox, tkcheckbutton(top3))
        cbVariable <- paste(cbOptions[i], "Variable", sep="")
        assign(cbVariable, tclVar(initialValues[i]))
        if (i < 3) {
            tkconfigure(get(CheckBox), variable=get(cbVariable))
            } else if (i == 3) {
            tkconfigure(get(CheckBox), variable=get(cbVariable), command=chartCommand)
            } else if (i == 4) {
            tkconfigure(get(CheckBox), variable=get(cbVariable), command=showcasesCommand)
            } else if (i == 5) {
            tkconfigure(get(CheckBox), variable=get(cbVariable), command=detailsCommand)
            } else {
            tkconfigure(get(CheckBox), variable=get(cbVariable), command=quietCommand)
            }
        tkgrid(tklabel(top3, text=cbLabels[i]), get(CheckBox), sticky="e")
        }
    
    tkgrid(tklabel(top3, text=" ")) # Blank line
    
    OKCancelHelp(helpSubject="qmcc")  
    
    tkpack(top1, top2, top3, buttonsFrame, side="top")
    }


Factorize <- function() {
    require(QCA)
    
    top <- tktoplevel()
    tkwm.title(top, "Factorize minimized solution")
    
    top1 <- tkframe(top)
    tkgrid(tklabel(top1, text=" ")) # Blank line
    dsname <- tclVar(gettextRcmdr(""))
    entryDsname <- tkentry(top1, width="50", textvariable=dsname)
    tkgrid(tklabel(top1, text=gettextRcmdr("Write or copy and paste the solution:")), entryDsname, sticky="e")
    tkgrid.configure(entryDsname, sticky="w")
    
    onOK <- function(){
        useletters <- tclvalue(use.lettersVariable) == "1"
        rb1 <- tclvalue(rb1Variable) == "1"
        rb2 <- tclvalue(rb2Variable) == "1"
        optional <- ""
        if (any(c(rb1, rb2))) {
            optional <- paste(", ", c("sort.by.literals", "sort.by.number")[c(rb1, rb2)], "=TRUE", sep="")
            }
        command <- paste('factorize("', tclvalue(dsname), '", use.letters=', useletters, optional, ')', sep="")
        doItAndPrint(command)
        closeDialog()
        tkfocus(CommanderWindow())
        }
    
    top2 <- tkframe(top)
    
    cbTop <- tkframe(top2)
    tkgrid(tklabel(cbTop, text=" ")) # Blank line
    
    initialValues <- c(1)
    use.lettersCB <- tkcheckbutton(cbTop)
    use.lettersVariable <- tclVar(initialValues)
    tkconfigure(use.lettersCB, variable=use.lettersVariable)
    
    tkgrid(tklabel(cbTop, text="Conditions' names are simple letters:"), use.lettersCB, sticky="w")
    
    
    middle <- tkframe(top2)
    tkgrid(tklabel(middle, text="    "))
    
    
    rbTop <- tkframe(top2)
    
    tkgrid(tklabel(rbTop, text=" ")) # Blank line
    
    rb1value <- rb2value <- FALSE
    
    rb1Command <- function() {
        rb1value <<- !rb1value
        if (rb2value) {
            rb2value <<- !rb2value
            tkdeselect(rb2CB)
            }
        }
    
    rb2Command <- function() {
        rb2value <<- !rb2value
        if (rb1value) {
            rb1value <<- !rb1value
            tkdeselect(rb1CB)
            }
        }
    
    initialValues <- c(0, 0)
    rb1CB <- tkcheckbutton(rbTop)
    rb1Variable <- tclVar(initialValues[1])
    tkconfigure(rb1CB, variable=rb1Variable, command=rb1Command)
    tkgrid(tklabel(rbTop, text="Sort by number of literals as common factor:"), rb1CB, sticky="e")
    
    rb2CB <- tkcheckbutton(rbTop)
    rb2Variable <- tclVar(initialValues[2])
    tkconfigure(rb2CB, variable=rb2Variable, command=rb2Command)
    tkgrid(tklabel(rbTop, text="Sort by number of factorized elements:"), rb2CB, sticky="e")
    
    tkpack(cbTop, middle, rbTop, side="left")
    
    OKCancelHelp(helpSubject="factorize")
    tkpack(top1, top2, buttonsFrame, side="top")
    dialogSuffix(rows=2, columns=2, focus=entryDsname)
    }

