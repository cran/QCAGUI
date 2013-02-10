# Graphs menu dialogs

# last modified 2012-08-29 by J. Fox
#  applied patch to improve window behaviour supplied by Milan Bouchet-Valat 2011-09-22

indexPlot <- function () {
	defaults <- list(initial.x = NULL, initial.type = "spikes", initial.identify = 0) 
	dialog.values <- getDialog("indexPlot", defaults)
	initializeDialog(title = gettextRcmdr("Index Plot"))
	xBox <- variableListBox(top, Numeric(), title = gettextRcmdr("Variable (pick one)"), 
			initialSelection = varPosn (dialog.values$initial.x, "numeric"))
	onOK <- function() {
		x <- getSelection(xBox)
		initial.type <- type <- tclvalue(typeVariable)
		identify <- tclvalue(identifyVariable) == "1"
		putDialog ("indexPlot", list(initial.x = x, initial.type = type, initial.identify = identify))
		closeDialog()
		if (length(x) == 0) {
			errorCondition(recall = indexPlot, message = gettextRcmdr("You must select a variable"))
			return()
		}
		type <- if (tclvalue(typeVariable) == "spikes") 
					"h"
				else "p"
		.activeDataSet <- ActiveDataSet()
		command <- paste("plot(", .activeDataSet, "$", x, ", type=\"", 
				type, "\")", sep = "")
		doItAndPrint(command)
		if (par("usr")[3] <= 0) 
			doItAndPrint("abline(h=0, col=\"gray\")")
		if (identify) {
			RcmdrTkmessageBox(title = "Identify Points", message = paste(gettextRcmdr("Use left mouse button to identify points,\n"), 
							gettextRcmdr(if (MacOSXP()) 
												"esc key to exit."
											else "right button to exit."), sep = ""), icon = "info", 
					type = "ok")
			command <- paste("identify(", .activeDataSet, "$", 
					x, ", labels=rownames(", .activeDataSet, "))", 
					sep = "")
			doItAndPrint(command)
		}
		activateMenus()
		tkfocus(CommanderWindow())
	}
	OKCancelHelp(helpSubject = "plot", reset = "indexPlot")
	optionsFrame <- tkframe(top)
	typeVariable <- tclVar(dialog.values$initial.type)
	spikesButton <- ttkradiobutton(optionsFrame, variable = typeVariable, 
			value = "spikes")
	pointsButton <- ttkradiobutton(optionsFrame, variable = typeVariable, 
			value = "points")
	identifyVariable <- tclVar(dialog.values$initial.identify)
	identifyCheckBox <- tkcheckbutton(optionsFrame, variable = identifyVariable)
	tkgrid(getFrame(xBox), sticky = "nw")
	tkgrid(labelRcmdr(optionsFrame, text = gettextRcmdr("Identify observations\nwith mouse"), 
					justify = "left"), identifyCheckBox, sticky = "w")
	tkgrid(labelRcmdr(optionsFrame, text = gettextRcmdr("Spikes")), 
			spikesButton, sticky = "w")
	tkgrid(labelRcmdr(optionsFrame, text = gettextRcmdr("Points")), 
			pointsButton, sticky = "w")
	tkgrid(optionsFrame, sticky = "w")
	tkgrid(buttonsFrame, sticky = "w")
	dialogSuffix(rows = 2, columns = 1)
}

Histogram <- function () {
	defaults <- list(initial.x = NULL, initial.scale = "frequency", 
			initial.bins = gettextRcmdr ("<auto>")) 
	dialog.values <- getDialog("Histogram", defaults)
	initializeDialog(title = gettextRcmdr("Histogram"))
	xBox <- variableListBox(top, Numeric(), title = gettextRcmdr("Variable (pick one)"), 
			initialSelection = varPosn (dialog.values$initial.x, "numeric"))
	onOK <- function() {
		x <- getSelection(xBox)
		closeDialog()
		if (length(x) == 0) {
			errorCondition(recall = Histogram, message = gettextRcmdr("You must select a variable"))
			return()
		}
		bins <- tclvalue(binsVariable)
		opts <- options(warn = -1)
		binstext <- if (bins == gettextRcmdr("<auto>")) 
					"\"Sturges\""
				else as.numeric(bins)
		options(opts)
		scale <- tclvalue(scaleVariable)
		putDialog ("Histogram", list (initial.x = x, initial.bins = bins, initial.scale = scale))
		command <- paste("Hist(", ActiveDataSet(), "$", x, ", scale=\"", 
				scale, "\", breaks=", binstext, ", col=\"darkgray\")", 
				sep = "")
		doItAndPrint(command)
		activateMenus()
		tkfocus(CommanderWindow())
	}
	OKCancelHelp(helpSubject = "Hist", reset = "Histogram")
	radioButtons(name = "scale", buttons = c("frequency", "percent", 
					"density"), labels = gettextRcmdr(c("Frequency counts", 
							"Percentages", "Densities")), title = gettextRcmdr("Axis Scaling"), 
			initialValue = dialog.values$initial.scale)
	binsFrame <- tkframe(top)
	binsVariable <- tclVar(dialog.values$initial.bins)
	binsField <- ttkentry(binsFrame, width = "8", textvariable = binsVariable)
	tkgrid(getFrame(xBox), sticky = "nw")
	tkgrid(labelRcmdr(binsFrame, text = gettextRcmdr("Number of bins: ")), 
			binsField, sticky = "w")
	tkgrid(binsFrame, sticky = "w")
	tkgrid(scaleFrame, sticky = "w")
	tkgrid(buttonsFrame, sticky = "w")
	tkgrid.configure(binsField, sticky = "e")
	dialogSuffix(rows = 4, columns = 1)
}

stemAndLeaf <- function () {
	Library("aplpack")
	defaults <- list(initial.x = NULL, initial.leafs.auto="1", initial.unit = 0,  initial.m = "auto", 
			initial.trim = 1, initial.depths = 1, initial.reverse = 1, initial.style = "Tukey") 
	dialog.values <- getDialog("stemAndLeaf", defaults)
	initializeDialog(title = gettextRcmdr("Stem and Leaf Display"), 
			preventCrisp = TRUE)
	xBox <- variableListBox(top, Numeric(), title = gettextRcmdr("Variable (pick one)"), 
			initialSelection = varPosn (dialog.values$initial.x, "numeric"))
	displayDigits <- tclVar(formatC(10^dialog.values$initial.unit))
	leafsDigitValue <- tclVar(dialog.values$initial.unit)
	onDigits <- function(...) {
		tclvalue(displayDigits) <- formatC(10^as.numeric(tclvalue(leafsDigitValue)), 
				format = "fg", big.mark = ",")
		tclvalue(leafsAutoVariable) <- "0"
	}
	radioButtons(name = "parts", buttons = c("auto", "one", "two", 
					"five"), values = c("auto", "1", "2", "5"), labels = c(gettextRcmdr("Automatic"), 
					"   1", "   2", "   5"), title = gettextRcmdr("Parts Per Stem"), 
			initialValue = dialog.values$initial.m)
	radioButtons(name = "style", buttons = c("Tukey", "bare"), 
			labels = gettextRcmdr(c("Tukey", "Repeated stem digits")), 
			title = gettextRcmdr("Style of Divided Stems"), 
			initialValue = dialog.values$initial.style)
	checkBoxes(frame = "optionsFrame", boxes = c("trimOutliers", 
					"showDepths", "reverseNegative"), initialValues = c(dialog.values$initial.trim,
					dialog.values$initial.depths, dialog.values$initial.reverse),
			labels = gettextRcmdr(c("Trim outliers", "Show depths", 
							"Reverse negative leaves")))
	leafsFrame <- tkframe(top)
	leafsDigitValue <- tclVar(dialog.values$initial.unit) #tclVar("0")
	leafsDigitSlider <- tkscale(leafsFrame, from = -6, to = 6, 
			showvalue = FALSE, variable = leafsDigitValue, resolution = 1, 
			orient = "horizontal", command = onDigits)
	leafsDigitShow <- labelRcmdr(leafsFrame, textvariable = displayDigits, 
			width = 8, justify = "right")
	leafsAutoVariable <- tclVar("1") # tclVar(dialog.values$initial.leafs.auto)
	leafsDigitCheckBox <- tkcheckbutton(leafsFrame, variable = leafsAutoVariable)
	onOK <- function() {
		x <- getSelection(xBox)
		m <- tclvalue(partsVariable)
		style <- tclvalue (styleVariable)
		trim <- tclvalue (trimOutliersVariable)
		depths <- tclvalue (showDepthsVariable)
		reverse <- tclvalue (reverseNegativeVariable)
		unit <- if (tclvalue(leafsAutoVariable) == "1") 
					""
				else paste(", unit=", 10^as.numeric(tclvalue(leafsDigitValue)), 
							sep = "")
		putDialog ("stemAndLeaf", list(initial.x = x, initial.leafs.auto=tclvalue(leafsAutoVariable),
						initial.unit = as.numeric(tclvalue(leafsDigitValue)),  initial.m = m, 
						initial.trim = trim, initial.depths = depths, initial.reverse = reverse, 
						initial.style = style))
		closeDialog()
		if (length(x) == 0) {
			errorCondition(recall = stemAndLeaf, message = gettextRcmdr("You must select a variable"))
			return()
		}
		trim <- if (tclvalue(trimOutliersVariable) == "1") 
					""
				else ", trim.outliers=FALSE"
		depths <- if (tclvalue(showDepthsVariable) == "1") 
					""
				else ", depths=FALSE"
		reverse <- if (tclvalue(reverseNegativeVariable) == "1") 
					""
				else ", reverse.negative.leaves=FALSE"
		m <- if (tclvalue(partsVariable) == "auto") 
					""
				else paste(", m=", tclvalue(partsVariable), sep = "")
		style <- if (tclvalue(styleVariable) == "Tukey") 
					""
				else ", style=\"bare\""
		command <- paste("stem.leaf(", ActiveDataSet(), "$", 
				x, style, unit, m, trim, depths, reverse, ", na.rm=TRUE)", 
				sep = "")
		doItAndPrint(command)
		tkfocus(CommanderWindow())
	}
	OKCancelHelp(helpSubject = "stem.leaf", reset = "stemAndLeaf")
	tkgrid(getFrame(xBox), sticky = "nw")
	tkgrid(labelRcmdr(leafsFrame, text = gettextRcmdr("Leafs Digit:  "), 
					fg = "blue"), labelRcmdr(leafsFrame, text = gettextRcmdr("Automatic")), 
			leafsDigitCheckBox, labelRcmdr(leafsFrame, text = gettextRcmdr("  or set:"), 
					fg = "red"), leafsDigitShow, leafsDigitSlider, sticky = "w")
	tkgrid(leafsFrame, sticky = "w")
	tkgrid(partsFrame, sticky = "w")
	tkgrid(styleFrame, sticky = "w")
	tkgrid(labelRcmdr(top, text = gettextRcmdr("Options"), fg = "blue"), 
			sticky = "w")
	tkgrid(optionsFrame, sticky = "w")
	tkgrid(buttonsFrame, sticky = "w")
	tclvalue(leafsAutoVariable) <- dialog.values$initial.leafs.auto
	dialogSuffix(rows = 7, columns = 1, preventCrisp = TRUE)
}

boxPlot <- function () {
    defaults <- list(initial.x = NULL, initial.identify = "y", initialGroup=NULL) 
    dialog.values <- getDialog("boxPlot", defaults)
    initializeDialog(title = gettextRcmdr("Boxplot"))
    xBox <- variableListBox(top, Numeric(), title = gettextRcmdr("Variable (pick one)"), 
                            initialSelection = varPosn (dialog.values$initial.x, "numeric"))
    radioButtons(name = "identify", buttons = c("y", "identify", "none"), 
                 labels = gettextRcmdr(c("Automatically", "With mouse", "No")), 
                 title = gettextRcmdr("Identify Outliers"), 
                 initialValue = dialog.values$initial.identify)
    initial.group <- dialog.values$initial.group
    .groups <- if (is.null(initial.group)) FALSE else initial.group
    onOK <- function() {
        x <- getSelection(xBox)
        identifyPoints <- tclvalue(identifyVariable)
        putDialog ("boxPlot", list(initial.x = x, initial.identify = identifyPoints, 
                                   initial.group=if (.groups == FALSE) NULL else .groups))
        closeDialog()
        if (length(x) == 0) {
            errorCondition(recall = boxPlot, message = gettextRcmdr("You must select a variable"))
            return()
        }
        .activeDataSet <- ActiveDataSet()
        var <- paste(.activeDataSet, "$", x, sep = "")
        if (identifyPoints == "identify")
            RcmdrTkmessageBox(title = "Identify Points", 
                              message = paste(gettextRcmdr("Use left mouse button to identify points,\n"), 
                                              gettextRcmdr(if (MacOSXP()) "esc key to exit."
                                                           else "right button to exit."), sep = ""), 
                              icon = "info", type = "ok")
        if (is.null(.groups) || .groups == FALSE) {
            command <- paste("Boxplot( ~ ", x, ", data=", .activeDataSet, ', id.method="', 
                             identifyPoints, '")', sep="")
            doItAndPrint(command)
        }
        else {
            command <- paste("Boxplot(", x, "~", .groups, ", data=", .activeDataSet, 
                             ', id.method="', identifyPoints, '")', sep = "")
            doItAndPrint(command)
        }
        activateMenus()
        tkfocus(CommanderWindow())
    }
    groupsBox(boxPlot, initialGroup=initial.group, 
              initialLabel=if (is.null(initial.group)) gettextRcmdr("Plot by groups") else paste(gettextRcmdr("Plot by:"), initial.group))
    OKCancelHelp(helpSubject = "boxplot", reset = "boxPlot")
    tkgrid(getFrame(xBox), sticky = "nw")
    tkgrid(identifyFrame, stick = "w")
    tkgrid(groupsFrame, sticky = "w")
    tkgrid(buttonsFrame, sticky = "w")
    dialogSuffix(rows = 4, columns = 1)
}

scatterPlot <- function () {
	require("car")
	defaults <- list(initial.x = NULL, initial.y = NULL, initial.jitterx = 0, initial.jittery = 0, 
			initial.logstringx = 0, initial.logstringy = 0, initial.log = 0, initial.box = 1, 
			initial.line = 1, initial.smooth = 1, initial.spread = 1, initial.span = 50,
			initial.subset = gettextRcmdr ("<all valid cases>"), initial.ylab = gettextRcmdr ("<auto>"), 
			initial.xlab = gettextRcmdr("<auto>"), initial.pch = gettextRcmdr("<auto>"), 
			initial.cexValue = 1, initial.cex.axisValue = 1, initial.cex.labValue = 1, initialGroup=NULL, initial.lines.by.group=1) 
	dialog.values <- getDialog("scatterPlot", defaults)
	initial.group <- dialog.values$initial.group
	.linesByGroup <- if (dialog.values$initial.lines.by.group == 1) TRUE else FALSE
	.groups <- if (is.null(initial.group)) FALSE else initial.group
	initializeDialog(title = gettextRcmdr("Scatterplot"))
	.numeric <- Numeric()
	variablesFrame <- tkframe(top)
	xBox <- variableListBox(variablesFrame, .numeric, title = gettextRcmdr("x-variable (pick one)"), 
			initialSelection = varPosn (dialog.values$initial.x, "numeric"))
	yBox <- variableListBox(variablesFrame, .numeric, title = gettextRcmdr("y-variable (pick one)"), 
			initialSelection = varPosn (dialog.values$initial.y, "numeric"))
	optionsParFrame <- tkframe(top)
	checkBoxes(window = optionsParFrame, frame = "optionsFrame", 
			boxes = c("identify", "jitterX", "jitterY", "logX", "logY", 
					"boxplots", "lsLine", "smoothLine", "spread"), initialValues = c(dialog.values$initial.log, 
					dialog.values$initial.jitterx, dialog.values$initial.jittery, 
					dialog.values$initial.logstringx, dialog.values$initial.logstringy,
					dialog.values$initial.box, dialog.values$initial.line, dialog.values$initial.smooth,
					dialog.values$initial.spread),labels = gettextRcmdr(c("Identify points", 
							"Jitter x-variable", "Jitter y-variable", "Log x-axis", 
							"Log y-axis", "Marginal boxplots", "Least-squares line", 
							"Smooth line", "Show spread")), title = gettextRcmdr("Options"))
	sliderValue <- tclVar(dialog.values$initial.span)
	slider <- tkscale(optionsFrame, from = 0, to = 100, showvalue = TRUE, 
			variable = sliderValue, resolution = 5, orient = "horizontal")
	subsetBox(subset.expression = dialog.values$initial.subset)
	labelsFrame <- tkframe(top)
	xlabVar <- tclVar(dialog.values$initial.xlab)
	ylabVar <- tclVar(dialog.values$initial.ylab)
	xlabFrame <- tkframe(labelsFrame)
	xlabEntry <- ttkentry(xlabFrame, width = "25", textvariable = xlabVar)
	xlabScroll <- ttkscrollbar(xlabFrame, orient = "horizontal", 
			command = function(...) tkxview(xlabEntry, ...))
	tkconfigure(xlabEntry, xscrollcommand = function(...) tkset(xlabScroll, 
						...))
	tkgrid(labelRcmdr(xlabFrame, text = gettextRcmdr("x-axis label"), 
					fg = "blue"), sticky = "w")
	tkgrid(xlabEntry, sticky = "w")
	tkgrid(xlabScroll, sticky = "ew")
	ylabFrame <- tkframe(labelsFrame)
	ylabEntry <- ttkentry(ylabFrame, width = "25", textvariable = ylabVar)
	ylabScroll <- ttkscrollbar(ylabFrame, orient = "horizontal", 
			command = function(...) tkxview(ylabEntry, ...))
	tkconfigure(ylabEntry, xscrollcommand = function(...) tkset(ylabScroll, 
						...))
	tkgrid(labelRcmdr(ylabFrame, text = gettextRcmdr("y-axis label"), 
					fg = "blue"), sticky = "w")
	tkgrid(ylabEntry, sticky = "w")
	tkgrid(ylabScroll, sticky = "ew")
	tkgrid(xlabFrame, labelRcmdr(labelsFrame, text = "     "), 
			ylabFrame, sticky = "w")
	parFrame <- tkframe(optionsParFrame)
	pchVar <- tclVar(dialog.values$initial.pch)
	pchEntry <- ttkentry(parFrame, width = 25, textvariable = pchVar)
	cexValue <- tclVar(dialog.values$initial.cexValue)
	cex.axisValue <- tclVar(dialog.values$initial.cex.axisValue)
	cex.labValue <- tclVar(dialog.values$initial.cex.labValue)
	cexSlider <- tkscale(parFrame, from = 0.5, to = 2.5, showvalue = TRUE, 
			variable = cexValue, resolution = 0.1, orient = "horizontal")
	cex.axisSlider <- tkscale(parFrame, from = 0.5, to = 2.5, 
			showvalue = TRUE, variable = cex.axisValue, resolution = 0.1, 
			orient = "horizontal")
	cex.labSlider <- tkscale(parFrame, from = 0.5, to = 2.5, 
			showvalue = TRUE, variable = cex.labValue, resolution = 0.1, 
			orient = "horizontal")
	onOK <- function() {
		x <- getSelection(xBox)
		y <- getSelection(yBox)
		jitter <- if ("1" == tclvalue(jitterXVariable) && "1" == 
						tclvalue(jitterYVariable)) 
					", jitter=list(x=1, y=1)"
				else if ("1" == tclvalue(jitterXVariable)) 
					", jitter=list(x=1)"
				else if ("1" == tclvalue(jitterYVariable)) 
					", jitter=list(y=1)"
				else ""
		logstring <- ""
		if ("1" == tclvalue(logXVariable)) 
			logstring <- paste(logstring, "x", sep = "")
		if ("1" == tclvalue(logYVariable)) 
			logstring <- paste(logstring, "y", sep = "")
		log <- tclvalue(identifyVariable)
		box <- tclvalue(boxplotsVariable)
		line <- tclvalue(lsLineVariable)
		smooth <-  tclvalue(smoothLineVariable)
		spread <- tclvalue(spreadVariable)
		span <- as.numeric(tclvalue(sliderValue))
		initial.subset <- subset <- tclvalue(subsetVariable)
		subset <- if (trim.blanks(subset) == gettextRcmdr("<all valid cases>")) 
					""
				else paste(", subset=", subset, sep = "")
		cex.axis <- as.numeric(tclvalue(cex.axisValue))
		cex <- as.numeric(tclvalue(cexValue))
		cex.lab <- as.numeric(tclvalue(cex.labValue))
		xlab <- trim.blanks(tclvalue(xlabVar))
		xlab <- if (xlab == gettextRcmdr("<auto>")) 
					""
				else paste(", xlab=\"", xlab, "\"", sep = "")
		ylab <- trim.blanks(tclvalue(ylabVar))
		ylab <- if (ylab == gettextRcmdr("<auto>")) 
					""
				else paste(", ylab=\"", ylab, "\"", sep = "")
		pch <- gsub(" ", ",", tclvalue(pchVar))
		putDialog ("scatterPlot", list (initial.x = x, initial.y = y, initial.jitterx = tclvalue(jitterXVariable),
						initial.jittery = tclvalue(jitterYVariable), initial.logstringx = tclvalue(logXVariable),
						initial.logstringy = tclvalue(logYVariable), initial.log = log, initial.box = box, 
						initial.line = line, initial.smooth = smooth, initial.spread = spread,
						initial.span = span, initial.subset = initial.subset, initial.xlab = tclvalue(xlabVar),
						initial.ylab = tclvalue(ylabVar), initial.cexValue = tclvalue(cexValue), 
						initial.cex.axisValue = tclvalue(cex.axisValue), initial.cex.labValue = tclvalue(cex.labValue), 
						initial.pch = pch, initial.group=if (.groups == FALSE) NULL else .groups,
						initial.lines.by.group=if (.linesByGroup) 1 else 0))
		closeDialog()
		if ("" == pch) {
			errorCondition(recall = scatterPlot, message = gettextRcmdr("No plotting characters."))
			return()
		}
		pch <- if (trim.blanks(pch) == gettextRcmdr("<auto>")) 
					""
				else paste(", pch=c(", pch, ")", sep = "")
		if (length(x) == 0 || length(y) == 0) {
			errorCondition(recall = scatterPlot, message = gettextRcmdr("You must select two variables"))
			return()
		}
		if (x == y) {
			errorCondition(recall = scatterPlot, message = gettextRcmdr("x and y variables must be different"))
			return()
		}
		.activeDataSet <- ActiveDataSet()
		log <- if (logstring != "") 
					paste(", log=\"", logstring, "\"", sep = "")
				else ""
		if ("1" == tclvalue(identifyVariable)) {
			RcmdrTkmessageBox(title = "Identify Points", message = paste(gettextRcmdr("Use left mouse button to identify points,\n"), 
							gettextRcmdr(if (MacOSXP()) 
												"esc key to exit."
											else "right button to exit."), sep = ""), icon = "info", 
					type = "ok")
			idtext <- ", id.method=\"identify\""
		}
		else idtext <- ""
		box <- if ("1" == tclvalue(boxplotsVariable)) 
					"'xy'"
				else "FALSE"
		line <- if ("1" == tclvalue(lsLineVariable)) 
					"lm"
				else "FALSE"
		smooth <- as.character("1" == tclvalue(smoothLineVariable))
		spread <- as.character("1" == tclvalue(spreadVariable))
		cex <- if (cex == 1) 
					""
				else paste(", cex=", cex, sep = "")
		cex.axis <- if (cex.axis == 1) 
					""
				else paste(", cex.axis=", cex.axis, sep = "")
		cex.lab <- if (cex.lab == 1) 
					""
				else paste(", cex.lab=", cex.lab, sep = "")
		if (.groups == FALSE) {
			doItAndPrint(paste("scatterplot(", y, "~", x, log, 
							", reg.line=", line, ", smooth=", smooth, ", spread=", 
							spread, idtext, ", boxplots=", box, ", span=", 
							span/100, jitter, xlab, ylab, cex, cex.axis, 
							cex.lab, pch, ", data=", .activeDataSet, subset, 
							")", sep = ""))
		}
		else {
			doItAndPrint(paste("scatterplot(", y, "~", x, " | ", 
							.groups, log, ", reg.line=", line, ", smooth=", smooth, 
							", spread=", spread, idtext, ", boxplots=", box, 
							", span=", span/100, jitter, xlab, ylab, cex, 
							cex.axis, cex.lab, pch, ", by.groups=", .linesByGroup, 
							", data=", .activeDataSet, subset, ")", sep = ""))
		}
		activateMenus()
		tkfocus(CommanderWindow())
	}
	groupsBox(scatterPlot, plotLinesByGroup = TRUE, initialGroup=initial.group, initialLinesByGroup=dialog.values$initial.lines.by.group,
			initialLabel=if (is.null(initial.group)) gettextRcmdr("Plot by groups") else paste(gettextRcmdr("Plot by:"), initial.group))
	OKCancelHelp(helpSubject = "scatterplot", reset = "scatterPlot")
	tkgrid(getFrame(xBox), getFrame(yBox), sticky = "nw")
	tkgrid(variablesFrame, sticky = "w")
	tkgrid(labelRcmdr(optionsFrame, text = gettextRcmdr("Span for smooth")), 
			slider, sticky = "w")
	tkgrid(labelRcmdr(parFrame, text = gettextRcmdr("Plotting Parameters"), 
					fg = "blue"), sticky = "w")
	tkgrid(labelRcmdr(parFrame, text = gettextRcmdr("Plotting characters")), 
			pchEntry, stick = "w")
	tkgrid(labelRcmdr(parFrame, text = gettextRcmdr("Point size")), 
			cexSlider, sticky = "w")
	tkgrid(labelRcmdr(parFrame, text = gettextRcmdr("Axis text size")), 
			cex.axisSlider, sticky = "w")
	tkgrid(labelRcmdr(parFrame, text = gettextRcmdr("Axis-labels text size")), 
			cex.labSlider, sticky = "w")
	tkgrid(optionsFrame, parFrame, sticky = "nw")
	tkgrid(optionsParFrame, sticky = "w")
	tkgrid(labelsFrame, sticky = "w")
	tkgrid(subsetFrame, sticky = "w")
	tkgrid(groupsFrame, sticky = "w")
	tkgrid(labelRcmdr(top, text = " "))
	tkgrid(buttonsFrame, columnspan = 2, sticky = "w")
	dialogSuffix(rows = 8, columns = 2)
}

scatterPlotMatrix <- function () {
	require("car")
	defaults <- list(initial.variables = NULL, initial.line = 1, initial.smooth = 1, initial.spread = 0, 
			initial.span = 50, initial.diag = "density", initial.subset = gettextRcmdr ("<all valid cases>"),
			initialGroup=NULL, initial.lines.by.group=1) 
	dialog.values <- getDialog("scatterPlotMatrix", defaults)
	initial.group <- dialog.values$initial.group
	.linesByGroup <- if (dialog.values$initial.lines.by.group == 1) TRUE else FALSE
	.groups <- if (is.null(initial.group)) FALSE else initial.group
	initializeDialog(title = gettextRcmdr("Scatterplot Matrix"))
	variablesBox <- variableListBox(top, Numeric(), title = gettextRcmdr("Select variables (three or more)"), 
			selectmode = "multiple", initialSelection = varPosn (dialog.values$initial.variables, "numeric"))
	checkBoxes(frame = "optionsFrame", boxes = c("lsLine", "smoothLine", 
					"spread"), initialValues = c(dialog.values$initial.line, dialog.values$initial.smooth,
					dialog.values$initial.spread), labels = gettextRcmdr(c("Least-squares lines", 
							"Smooth lines", "Show spread")))
	sliderValue <- tclVar(dialog.values$initial.span)
	slider <- tkscale(optionsFrame, from = 0, to = 100, showvalue = TRUE, 
			variable = sliderValue, resolution = 5, orient = "horizontal")
	radioButtons(name = "diagonal", buttons = c("density", "histogram", 
					"boxplot", "oned", "qqplot", "none"), labels = gettextRcmdr(c("Density plots", 
							"Histograms", "Boxplots", "One-dimensional scatterplots", 
							"Normal QQ plots", "Nothing (empty)")), title = gettextRcmdr("On Diagonal"), 
			initialValue = dialog.values$initial.diag)
	subsetBox(subset.expression = dialog.values$initial.subset)
	onOK <- function() {
		variables <- getSelection(variablesBox)
		closeDialog()
		if (length(variables) < 3) {
			errorCondition(recall = scatterPlotMatrix, message = gettextRcmdr("Fewer than 3 variable selected."))
			return()
		}
		line <- if ("1" == tclvalue(lsLineVariable)) 
					"lm"
				else "FALSE"
		smooth <- as.character("1" == tclvalue(smoothLineVariable))
		spread <- as.character("1" == tclvalue(spreadVariable))
		span <- as.numeric(tclvalue(sliderValue))
		diag <- as.character(tclvalue(diagonalVariable))
		initial.subset <- subset <- tclvalue(subsetVariable)
		subset <- if (trim.blanks(subset) == gettextRcmdr("<all valid cases>")) ""
				else paste(", subset=", subset, sep="")
		putDialog("scatterPlotMatrix", list(initial.variables = variables, initial.line = tclvalue (lsLineVariable), 
						initial.smooth = tclvalue(smoothLineVariable),initial.spread = tclvalue (spreadVariable), 
						initial.span = span, initial.diag = diag, initial.subset = initial.subset, 
						initial.group=if (.groups == FALSE) NULL else .groups,
						initial.lines.by.group=if (.linesByGroup) 1 else 0))
		.activeDataSet <- ActiveDataSet()
		if (.groups == FALSE) {
			command <- paste("scatterplotMatrix(~", paste(variables, 
							collapse = "+"), ", reg.line=", line, ", smooth=", 
					smooth, ", spread=", spread, ", span=", span/100, 
					", diagonal = '", diag, "', data=", .activeDataSet, 
					subset, ")", sep = "")
			logger(command)
			justDoIt(command)
		}
		else {
			command <- paste("scatterplotMatrix(~", paste(variables, 
							collapse = "+"), " | ", .groups, ", reg.line=", 
					line, ", smooth=", smooth, ", spread=", spread, 
					", span=", span/100, ", diagonal= '", diag, "', by.groups=", 
					.linesByGroup, ", data=", .activeDataSet, subset, 
					")", sep = "")
			logger(command)
			justDoIt(command)
		}
		activateMenus()
		tkfocus(CommanderWindow())
	}
	groupsBox(scatterPlot, plotLinesByGroup = TRUE, initialGroup=initial.group, initialLinesByGroup=dialog.values$initial.lines.by.group,
			initialLabel=if (is.null(initial.group)) gettextRcmdr("Plot by groups") else paste(gettextRcmdr("Plot by:"), initial.group))
	OKCancelHelp(helpSubject = "scatterplotMatrix", reset = "scatterPlotMatrix")
	tkgrid(getFrame(variablesBox), sticky = "nw")
	tkgrid(labelRcmdr(optionsFrame, text = gettextRcmdr("Span for smooth")), 
			slider, sticky = "w")
	tkgrid(optionsFrame, sticky = "w")
	tkgrid(diagonalFrame, sticky = "w")
	tkgrid(subsetFrame, sticky = "w")
	tkgrid(groupsFrame, sticky = "w")
	tkgrid(buttonsFrame, columnspan = 2, sticky = "w")
	dialogSuffix(rows = 6, columns = 2)
}

barGraph <- function () {
	defaults <- list (initial.variable = NULL)
	dialog.values <- getDialog ("barGraph", defaults)
	initializeDialog(title = gettextRcmdr("Bar Graph"))
	variableBox <- variableListBox(top, Factors(), title = gettextRcmdr("Variable (pick one)"), 
			initialSelection = varPosn (dialog.values$initial.variable, "factor"))
	onOK <- function() {
		variable <- getSelection(variableBox)
		putDialog ("barGraph", list (initial.variable = variable))
		closeDialog()
		if (length(variable) == 0) {
			errorCondition(recall = barGraph, message = gettextRcmdr("You must select a variable"))
			return()
		}
		command <- paste("barplot(table(", ActiveDataSet(), "$", 
				variable, "), xlab=\"", variable, "\", ylab=\"Frequency\")", 
				sep = "")
		logger(command)
		justDoIt(command)
		activateMenus()
		tkfocus(CommanderWindow())
	}
	OKCancelHelp(helpSubject = "barplot", reset = "barGraph")
	tkgrid(getFrame(variableBox), sticky = "nw")
	tkgrid(buttonsFrame, sticky = "w")
	dialogSuffix(rows = 2, columns = 1)
}

pieChart <- function () {
	Library("colorspace")
	defaults <- list (initial.variable = NULL)
	dialog.values <- getDialog ("pieChart", defaults)
	initializeDialog(title = gettextRcmdr("Pie Chart"))
	variableBox <- variableListBox(top, Factors(), title = gettextRcmdr("Variable (pick one)"), 
			initialSelection = varPosn (dialog.values$initial.variable, "factor"))
	onOK <- function() {
		variable <- getSelection(variableBox)
		putDialog ("pieChart", list (initial.variable = variable))
		closeDialog()
		if (length(variable) == 0) {
			errorCondition(recall = pieChart, message = gettextRcmdr("You must select a variable"))
			return()
		}
		.activeDataSet <- ActiveDataSet()
		command <- (paste("pie(table(", .activeDataSet, "$", 
							variable, "), labels=levels(", .activeDataSet, "$", 
							variable, "), main=\"", variable, "\", col=rainbow_hcl(length(levels(", 
							.activeDataSet, "$", variable, "))))", sep = ""))
		logger(command)
		justDoIt(command)
		activateMenus()
		tkfocus(CommanderWindow())
	}
	OKCancelHelp(helpSubject = "pie", reset = "pieChart")
	tkgrid(getFrame(variableBox), sticky = "nw")
	tkgrid(buttonsFrame, sticky = "w")
	dialogSuffix(rows = 3, columns = 1)
}

linePlot <- function () {
	defaults <- list(initial.x = NULL, initial.y = NULL, initial.axisLabel = gettextRcmdr ("<use y-variable names>"), 
			initial.legend = 0) 
	dialog.values <- getDialog("linePlot", defaults)
	initializeDialog(title = gettextRcmdr("Line Plot"))
	variablesFrame <- tkframe(top)
	.numeric <- Numeric()
	xBox <- variableListBox(variablesFrame, .numeric, title = gettextRcmdr("x variable (pick one)"),
			initialSelection = varPosn (dialog.values$initial.x, "numeric"))
	yBox <- variableListBox(variablesFrame, .numeric, title = gettextRcmdr("y variables (pick one or more)"), 
			selectmode = "multiple", initialSelection = varPosn (dialog.values$initial.y, "numeric"))
	axisLabelVariable <- tclVar(dialog.values$initial.axisLabel)
	axisLabelFrame <- tkframe(top)
	axisLabelEntry <- ttkentry(axisLabelFrame, width = "40", 
			textvariable = axisLabelVariable)
	axisLabelScroll <- ttkscrollbar(axisLabelFrame, orient = "horizontal", 
			command = function(...) tkxview(axisLabelEntry, ...))
	tkconfigure(axisLabelEntry, xscrollcommand = function(...) tkset(axisLabelScroll, 
						...))
	legendFrame <- tkframe(top)
	legendVariable <- tclVar(dialog.values$initial.legend)
	legendCheckBox <- tkcheckbutton(legendFrame, variable = legendVariable)
	onOK <- function() {
		y <- getSelection(yBox)
		x <- getSelection(xBox)
		closeDialog()
		if (0 == length(x)) {
			errorCondition(recall = linePlot, message = gettextRcmdr("No x variable selected."))
			return()
		}
		if (0 == length(y)) {
			errorCondition(recall = linePlot, message = gettextRcmdr("No y variables selected."))
			return()
		}
		if (is.element(x, y)) {
			errorCondition(recall = linePlot, message = gettextRcmdr("x and y variables must be different."))
			return()
		}
		.activeDataSet <- ActiveDataSet()
		.x <- na.omit(eval(parse(text = paste(.activeDataSet, 
										"$", x, sep = "")), envir = .GlobalEnv))
		if (!identical(order(.x), seq(along.with = .x))) {
			response <- tclvalue(RcmdrTkmessageBox(message = gettextRcmdr("x-values are not in order.\nContinue?"), 
							icon = "warning", type = "okcancel", default = "cancel"))
			if (response == "cancel") {
				onCancel()
				return()
			}
		}
		axisLabel <- tclvalue(axisLabelVariable)
		legend <- tclvalue(legendVariable) == "1"
		putDialog ("linePlot", list(initial.x = x, initial.y = y, initial.axisLabel = axisLabel, 
						initial.legend = legend))
		if (axisLabel == gettextRcmdr("<use y-variable names>")) {
			axisLabel <- if (legend) 
						""
					else if (length(y) == 1) 
						y
					else paste(paste("(", 1:length(y), ") ", y, sep = ""), 
								collapse = ", ")
		}
		pch <- if (length(y) == 1) 
					", pch=1"
				else ""
		if (legend && length(y) > 1) {
			mar <- par("mar")
			top <- 3.5 + length(y)
			command <- paste(".mar <- par(mar=c(", mar[1], ",", 
					mar[2], ",", top, ",", mar[4], "))", sep = "")
			logger(command)
			justDoIt(command)
		}
		command <- paste("matplot(", .activeDataSet, "$", x, 
				", ", .activeDataSet, "[, ", paste("c(", paste(paste("\"", 
										y, "\"", sep = ""), collapse = ","), ")", sep = ""), 
				"], type=\"b\", lty=1, ylab=\"", axisLabel, "\"", 
				pch, ")", sep = "")
		logger(command)
		justDoIt(command)
		if (legend && length(y) > 1) {
			n <- length(y)
			cols <- rep(1:6, 1 + n%/%6)[1:n]
			logger(".xpd <- par(xpd=TRUE)")
			justDoIt(".xpd <- par(xpd=TRUE)")
			usr <- par("usr")
			command <- paste("legend(", usr[1], ", ", usr[4] + 
							1.2 * top * strheight("x"), ", legend=", paste("c(", 
							paste(paste("\"", y, "\"", sep = ""), collapse = ","), 
							")", sep = ""), ", col=c(", paste(cols, collapse = ","), 
					"), lty=1, pch=c(", paste(paste("\"", as.character(1:n), 
									"\"", sep = ""), collapse = ","), "))", sep = "")
			logger(command)
			justDoIt(command)
			logger("par(mar=.mar)")
			justDoIt("par(mar=.mar)")
			logger("par(xpd=.xpd)")
			justDoIt("par(xpd=.xpd)")
		}
		activateMenus()
		tkfocus(CommanderWindow())
	}
	OKCancelHelp(helpSubject = "matplot", reset = "linePlot")
	tkgrid(getFrame(xBox), labelRcmdr(variablesFrame, text = "    "), 
			getFrame(yBox), sticky = "nw")
	tkgrid(variablesFrame, sticky = "nw")
	tkgrid(labelRcmdr(axisLabelFrame, text = gettextRcmdr("Label for y-axis"), 
					fg = "blue"), sticky = "w")
	tkgrid(axisLabelEntry, sticky = "w")
	tkgrid(axisLabelScroll, sticky = "ew")
	tkgrid(axisLabelFrame, sticky = "w")
	tkgrid(labelRcmdr(legendFrame, text = gettextRcmdr("Plot legend")), 
			legendCheckBox, sticky = "w")
	tkgrid(legendFrame, sticky = "w")
	tkgrid(buttonsFrame, stick = "w")
	dialogSuffix(rows = 4, columns = 1)
}

QQPlot <- function () {
# this function modified by Martin Maechler
	require("car")
	defaults <- list(initial.x = NULL, initial.identify = 0, initial.dist = "norm", initial.df = "",
			initial.chisqdf = "", initial.fdf1 = "", initial.fdf2 = "", initial.othername = "", 
			initial.otherparam = "")
	dialog.values <- getDialog("QQPlot", defaults)
	initializeDialog(title = gettextRcmdr("Quantile-Comparison (QQ) Plot"))
	xBox <- variableListBox(top, Numeric(), title = gettextRcmdr("Variable (pick one)"), 
			initialSelection = varPosn (dialog.values$initial.x, "numeric"))
	onOK <- function() {
		x <- getSelection(xBox)
		initial.dist <-dist <- tclvalue(distVariable)
		identify <- tclvalue(identifyVariable)
		tdf <- tclvalue(tDfVariable)
		chisqdf <- tclvalue(chisqDfVariable)
		fdf1 <- tclvalue(FDf1Variable)
		fdf2 <- tclvalue(FDf2Variable)
		othername <- tclvalue(otherNameVariable)
		otherparam <- tclvalue(otherParamsVariable)
		putDialog ("QQPlot", list (initial.x = x, initial.dist = initial.dist,
						initial.identify = identify, initial.df = tdf, initial.chisqdf = chisqdf,
						initial.fdf1 = fdf1, initial.fdf2 = fdf2, initial.othername = othername, 
						initial.otherparam = otherparam))
		closeDialog()
		if (0 == length(x)) {
			errorCondition(recall = QQPlot, message = gettextRcmdr("You must select a variable."))
			return()
		}
		save <- options(warn = -1)
		on.exit(save)
		retryMe <- function(msg) {
			Message(message = msg, type = "error")
			QQPlot()
		}
		switch(dist, norm = {
					args <- "dist=\"norm\""
				}, t = {
					df <- tclvalue(tDfVariable)
					df.num <- as.numeric(df)
					if (is.na(df.num) || df.num < 1) {
						retryMe(gettextRcmdr("df for t must be a positive number."))
						return()
					}
					args <- paste("dist=\"t\", df=", df, sep = "")
				}, chisq = {
					df <- tclvalue(chisqDfVariable)
					df.num <- as.numeric(df)
					if (is.na(df.num) || df.num < 1) {
						retryMe(gettextRcmdr("df for chi-square must be a positive number."))
						return()
					}
					args <- paste("dist=\"chisq\", df=", df, sep = "")
				}, f = {
					df1 <- tclvalue(FDf1Variable)
					df2 <- tclvalue(FDf2Variable)
					df.num1 <- as.numeric(df1)
					df.num2 <- as.numeric(df2)
					if (is.na(df.num1) || df.num1 < 1 || is.na(df.num2) || 
							df.num2 < 1) {
						retryMe(gettextRcmdr("numerator and denominator \ndf for F must be positive numbers."))
						return()
					}
					args <- paste("dist=\"f\", df1=", df1, ", df2=", 
							df2, sep = "")
				}, {
					dist <- tclvalue(otherNameVariable)
					params <- tclvalue(otherParamsVariable)
					args <- paste("dist=\"", dist, "\", ", params, sep = "")
				})
		.activeDataSet <- ActiveDataSet()
		if ("1" == tclvalue(identifyVariable)) {
			RcmdrTkmessageBox(title = "Identify Points", message = paste(gettextRcmdr("Use left mouse button to identify points,\n"), 
							gettextRcmdr(if (MacOSXP()) 
												"esc key to exit."
											else "right button to exit."), sep = ""), icon = "info", 
					type = "ok")
			idtext <- paste(", labels=rownames(", .activeDataSet, 
					"), id.method=\"identify\"", sep = "")
		}
		else idtext <- ""
		command <- paste("qqPlot", "(", .activeDataSet, "$", 
				x, ", ", args, idtext, ")", sep = "")
		doItAndPrint(command)
		activateMenus()
		tkfocus(CommanderWindow())
	}
	OKCancelHelp(helpSubject = "qqPlot", reset = "QQPlot")
	distFrame <- tkframe(top)
	distVariable <- tclVar(dialog.values$initial.dist)
	normalButton <- ttkradiobutton(distFrame, variable = distVariable, 
			value = "norm")
	tButton <- ttkradiobutton(distFrame, variable = distVariable, 
			value = "t")
	chisqButton <- ttkradiobutton(distFrame, variable = distVariable, 
			value = "chisq")
	FButton <- ttkradiobutton(distFrame, variable = distVariable, 
			value = "f")
	otherButton <- ttkradiobutton(distFrame, variable = distVariable, 
			value = "other")
	tDfFrame <- tkframe(distFrame)
	tDfVariable <- tclVar(dialog.values$initial.df)
	tDfField <- ttkentry(tDfFrame, width = "6", textvariable = tDfVariable)
	chisqDfFrame <- tkframe(distFrame)
	chisqDfVariable <- tclVar(dialog.values$initial.chisqdf)
	chisqDfField <- ttkentry(chisqDfFrame, width = "6", textvariable = chisqDfVariable)
	FDfFrame <- tkframe(distFrame)
	FDf1Variable <- tclVar(dialog.values$initial.fdf1)
	FDf1Field <- ttkentry(FDfFrame, width = "6", textvariable = FDf1Variable)
	FDf2Variable <- tclVar(dialog.values$initial.fdf2)
	FDf2Field <- ttkentry(FDfFrame, width = "6", textvariable = FDf2Variable)
	otherParamsFrame <- tkframe(distFrame)
	otherParamsVariable <- tclVar(dialog.values$initial.otherparam)
	otherParamsField <- ttkentry(otherParamsFrame, width = "30", 
			textvariable = otherParamsVariable)
	otherNameVariable <- tclVar(dialog.values$initial.othername)
	otherNameField <- ttkentry(otherParamsFrame, width = "10", 
			textvariable = otherNameVariable)
	identifyVariable <- tclVar(dialog.values$initial.identify)
	identifyFrame <- tkframe(top)
	identifyCheckBox <- tkcheckbutton(identifyFrame, variable = identifyVariable)
	tkgrid(getFrame(xBox), sticky = "nw")
	tkgrid(labelRcmdr(identifyFrame, text = gettextRcmdr("Identify observations with mouse")), 
			identifyCheckBox, sticky = "w")
	tkgrid(identifyFrame, sticky = "w")
	tkgrid(labelRcmdr(distFrame, text = gettextRcmdr("Distribution"), 
					fg = "blue"), columnspan = 6, sticky = "w")
	tkgrid(labelRcmdr(distFrame, text = gettextRcmdr("Normal")), 
			normalButton, sticky = "w")
	tkgrid(labelRcmdr(tDfFrame, text = gettextRcmdr("df = ")), 
			tDfField, sticky = "w")
	tkgrid(labelRcmdr(distFrame, text = "t"), tButton, tDfFrame, 
			sticky = "w")
	tkgrid(labelRcmdr(chisqDfFrame, text = gettextRcmdr("df = ")), 
			chisqDfField, sticky = "w")
	tkgrid(labelRcmdr(distFrame, text = gettextRcmdr("Chi-square")), 
			chisqButton, chisqDfFrame, sticky = "w")
	tkgrid(labelRcmdr(FDfFrame, text = gettextRcmdr("Numerator df = ")), 
			FDf1Field, labelRcmdr(FDfFrame, text = gettextRcmdr("Denominator df = ")), 
			FDf2Field, sticky = "w")
	tkgrid(labelRcmdr(distFrame, text = "F"), FButton, FDfFrame, 
			sticky = "w")
	tkgrid(labelRcmdr(otherParamsFrame, text = gettextRcmdr("Specify: ")), 
			otherNameField, labelRcmdr(otherParamsFrame, text = gettextRcmdr("Parameters: ")), 
			otherParamsField, sticky = "w")
	tkgrid(labelRcmdr(distFrame, text = gettextRcmdr("Other")), 
			otherButton, otherParamsFrame, sticky = "w")
	tkgrid(distFrame, sticky = "w")
	tkgrid(buttonsFrame, sticky = "w")
	dialogSuffix(rows = 5, columns = 1)
}

PlotMeans <- function () {
	defaults <- list(initial.groups = NULL, initial.response = NULL, initial.error.bars = "se",
			initial.level = "0.95") 
	dialog.values <- getDialog("PlotMeans", defaults)
	initializeDialog(title = gettextRcmdr("Plot Means"))
	groupBox <- variableListBox(top, Factors(), title = gettextRcmdr("Factors (pick one or two)"), 
			selectmode = "multiple", initialSelection = varPosn (dialog.values$initial.groups, "factor"))
	responseBox <- variableListBox(top, Numeric(), title = gettextRcmdr("Response Variable (pick one)"),
			initialSelection = varPosn (dialog.values$initial.response, "numeric"))
	onOK <- function() {
		groups <- getSelection(groupBox)
		response <- getSelection(responseBox)
		closeDialog()
		if (0 == length(groups)) {
			errorCondition(recall = PlotMeans, message = gettextRcmdr("No factors selected."))
			return()
		}
		if (2 < length(groups)) {
			errorCondition(recall = PlotMeans, message = gettextRcmdr("More than two factors selected."))
			return()
		}
		if (0 == length(response)) {
			errorCondition(recall = PlotMeans, message = gettextRcmdr("No response variable selected."))
			return()
		}
		.activeDataSet <- ActiveDataSet()
		error.bars <- tclvalue(errorBarsVariable)
		level <- if (error.bars == "conf.int") 
					paste(", level=", tclvalue(levelVariable), sep = "")
				else ""
		putDialog ("PlotMeans", list(initial.groups = groups, initial.response = response, 
						initial.error.bars = error.bars, initial.level = tclvalue(levelVariable)))
		if (length(groups) == 1) 
			doItAndPrint(paste("plotMeans(", .activeDataSet, 
							"$", response, ", ", .activeDataSet, "$", groups[1], 
							", error.bars=\"", error.bars, "\"", level, ")", 
							sep = ""))
		else {
			if (eval(parse(text = paste("length(levels(", .activeDataSet, 
									"$", groups[1], ")) < length(levels(", .activeDataSet, 
									"$", groups[2], "))", sep = "")))) 
				groups <- rev(groups)
			doItAndPrint(paste("plotMeans(", .activeDataSet, 
							"$", response, ", ", .activeDataSet, "$", groups[1], 
							", ", .activeDataSet, "$", groups[2], ", error.bars=\"", 
							error.bars, "\"", level, ")", sep = ""))
		}
		activateMenus()
		tkfocus(CommanderWindow())
	}
	optionsFrame <- tkframe(top)
	errorBarsVariable <- tclVar(dialog.values$initial.error.bars)
	seButton <- ttkradiobutton(optionsFrame, variable = errorBarsVariable, 
			value = "se")
	sdButton <- ttkradiobutton(optionsFrame, variable = errorBarsVariable, 
			value = "sd")
	confIntButton <- ttkradiobutton(optionsFrame, variable = errorBarsVariable, 
			value = "conf.int")
	noneButton <- ttkradiobutton(optionsFrame, variable = errorBarsVariable, 
			value = "none")
	levelVariable <- tclVar(dialog.values$initial.level)
	levelEntry <- ttkentry(optionsFrame, width = "6", textvariable = levelVariable)
	buttonsFrame <- tkframe(top)
	OKCancelHelp(helpSubject = "plotMeans", reset = "PlotMeans")
	tkgrid(getFrame(groupBox), getFrame(responseBox), sticky = "nw")
	tkgrid(labelRcmdr(optionsFrame, text = gettextRcmdr("Error Bars"), 
					fg = "blue"), sticky = "w")
	tkgrid(labelRcmdr(optionsFrame, text = gettextRcmdr("Standard errors")), 
			seButton, sticky = "w")
	tkgrid(labelRcmdr(optionsFrame, text = gettextRcmdr("Standard deviations")), 
			sdButton, sticky = "w")
	tkgrid(labelRcmdr(optionsFrame, text = gettextRcmdr("Confidence intervals")), 
			confIntButton, labelRcmdr(optionsFrame, text = gettextRcmdr("   Level of confidence:")), 
			levelEntry, sticky = "w")
	tkgrid(labelRcmdr(optionsFrame, text = gettextRcmdr("No error bars")), 
			noneButton, sticky = "w")
	tkgrid(optionsFrame, columnspan = 2, sticky = "w")
	tkgrid(buttonsFrame, columnspan = 2, sticky = "w")
	dialogSuffix(rows = 3, columns = 2)
}

saveBitmap <- function () {
    env <- environment()
    updateWidth <- function(...){
        if (tclvalue(aspectVariable) == "1"){
            tclvalue(heightVariable) <- round(aspect*as.numeric(tclvalue(widthVariable)))
        }
    }
    updateHeight <- function(...){
        if (tclvalue(aspectVariable) == "1"){
            tclvalue(widthVariable) <- round((1/aspect)*as.numeric(tclvalue(heightVariable)))
        }
    }
    updateSize <- function(...){
        units <- tclvalue(unitsVariable)
        size <- dev.size(units=units)
        if (units == "in") {
            wmin <- min(3, size[1])
            wmax <- max(10, size[1])
            hmin <- min(3, size[2])
            hmax <- max(10, size[2])
            rmin <- 50
            rmax <- 300
            res <- if (tclvalue(resVariable) == "72") 72 else round(2.54*as.numeric(tclvalue(resVariable)))
        }
        else if (units == "cm") {
            wmin <- min(8, size[1])
            wmax <- max(25, size[1])
            hmin <- min(8, size[2])
            hmax <- max(25, size[2])
            rmin <- 20
            rmax <- 120
            res <- round(as.numeric(tclvalue(resVariable))/2.54)
        }
        else {
            wmin <- min(200, size[1])
            wmax <- max(1000, size[1])
            hmin <- min(200, size[2])
            hmax <- max(1000, size[2])
            rmin <- 50
            rmax <- 300
            res <- 72
        }
        tkconfigure(widthSlider, from = wmin, to = wmax)
        tkconfigure(heightSlider,  from = hmin, to = hmax)
        tkconfigure(wlabel, text = paste(gettextRcmdr(c("Width", " (", all.units[units], ")")), collapse=""))
        tkconfigure(hlabel, text = paste(gettextRcmdr(c("Height",  " (", all.units[units], ")")), collapse=""))
        tkconfigure(rlabel, text = paste(gettextRcmdr(c("Resolution (pixels/", unit[units], ")")), collapse=""))
        tkconfigure(resSlider, from=rmin, to=rmax, state = if (tclvalue(unitsVariable) == "px") "disabled" else "normal")
        tkconfigure(disabled, text = if (units == "px") gettextRcmdr("[disabled]") else "")
        tclvalue(widthVariable) <- size[1]
        tclvalue(heightVariable) <- size[2]
        tclvalue(resVariable) <- res
    }
    all.units <- c("inches", "cm", "pixels")
    names(all.units) <- c("in", "cm", "px")
    unit <- c("inch", "cm", "inch")
    names(unit) <- c("in", "cm", "px")
    if (1 == dev.cur()) {
        Message(gettextRcmdr("There is no current graphics device to save."), 
                type = "error")
        return()
    }
    defaults <- list (initial.type = "png", initial.pointsize=12, initial.units="in", initial.res = 72)
    dialog.values <- getDialog ("saveBitmap", defaults)
    units <- dialog.values$initial.units
    size <- dev.size(units=units)
    aspect <- size[2]/size[1]
    if (units == "in") {
        wmin <- min(3, size[1])
        wmax <- max(10, size[1])
        hmin <- min(3, size[2])
        hmax <- max(10, size[2])
        rmin <- 50
        rmax <- 300
        res <- dialog.values$initial.res
    }
    else if (units == "cm") {
        wmin <- min(8, size[1])
        wmax <- max(25, size[1])
        hmin <- min(8, size[2])
        hmax <- max(25, size[2])
        rmin <- 20
        rmax <- 120
        res <- dialog.values$initial.res
    }
    else {
        wmin <- min(200, size[1])
        wmax <- max(1000, size[1])
        hmin <- min(200, size[2])
        hmax <- max(1000, size[2])
        rmin <- 50
        rmax <- 300
        res <- 72
    }
    initializeDialog(title = gettextRcmdr("Save Graph as Bitmap"))
    radioButtons(name = "filetype", buttons = c("png", "jpeg"), 
                 labels = c("PNG", "JPEG"), title = gettextRcmdr("Graphics File Type"),
                 initialValue = dialog.values$initial.type)
    radioButtons(name = "units", buttons = c("in", "cm", "px"), 
                 labels = gettextRcmdr(c("inches", "cm", "pixels")), title = gettextRcmdr("Units"),
                 initialValue = dialog.values$initial.units, command=updateSize)
    sliderFrame <- tkframe(top)
    widthVariable <- tclVar(size[1])
    widthSlider <- tkscale(sliderFrame, from = wmin, to = wmax, 
                           showvalue = TRUE, variable = widthVariable, resolution = 1, 
                           orient = "horizontal", command=updateWidth)
    heightVariable <- tclVar(size[2])
    heightSlider <- tkscale(sliderFrame, from = hmin, to = hmax, 
                            showvalue = TRUE, variable = heightVariable, resolution = 1, 
                            orient = "horizontal", command=updateHeight)
    pointSizeVariable <- tclVar(dialog.values$initial.pointsize)
    pointSizeSlider <- tkscale(sliderFrame, from = 6, to = 16, 
                               showvalue = TRUE, variable = pointSizeVariable, resolution = 1, 
                               orient = "horizontal")
    resVariable <- tclVar(res)
    resSlider <- tkscale(sliderFrame, from = rmin, to = rmax, 
                         showvalue = TRUE, variable = resVariable, resolution = 1, 
                         orient = "horizontal")
    tkconfigure(resSlider,  state = if (tclvalue(unitsVariable) == "px") "disabled" else "normal")
    aspectVariable <- tclVar("1")
    aspectFrame <- tkframe(top)
    aspectCheckBox <- tkcheckbutton(aspectFrame, variable = aspectVariable)
    onOK <- function() {
        closeDialog()
        width <- tclvalue(widthVariable)
        height <- tclvalue(heightVariable)
        type <- tclvalue(filetypeVariable)
        pointsize <- tclvalue(pointSizeVariable)
        units <- tclvalue(unitsVariable)
        res <- tclvalue(resVariable)
        putDialog ("saveBitmap", list (initial.type = type, initial.pointsize = pointsize, initial.units=units, initial.res=res))
        if (type == "png") {
            ext <- "png"
            filetypes <- gettextRcmdr("{\"All Files\" {\"*\"}} {\"PNG Files\" {\".png\" \".PNG\"}}")
            initial <- "RGraph.png"
        }
        else {
            ext <- "jpg"
            filetypes <- gettextRcmdr("{\"All Files\" {\"*\"}} {\"JPEG Files\" {\".jpg\" \".JPG\" \".jpeg\" \".JPEG\"}}")
            initial <- "RGraph.jpg"
        }
        filename <- tclvalue(tkgetSaveFile(filetypes = filetypes, 
                                           defaultextension = ext, initialfile = initial, parent = CommanderWindow()))
        if (filename == "") 
            return()
        command <- paste("dev.print(", type, ", filename=\"", 
                         filename, "\", width=", width, ", height=", height, ", pointsize=", pointsize, ', units="', units, 
                         if(units == "px") '")' else paste('", res=', res, ')', sep=""), sep = "")
        doItAndPrint(command)
        Message(paste(gettextRcmdr("Graph saved to file"), filename), 
                type = "note")
    }
    OKCancelHelp(helpSubject = "png", reset = "saveBitmap")
    tkgrid(filetypeFrame, sticky = "w")
    tkgrid(unitsFrame, stick="w")
    tkgrid(labelRcmdr(aspectFrame, text = gettextRcmdr("Fixed aspect ratio (height:width)")),
           aspectCheckBox, sticky="w")
    tkgrid(aspectFrame, sticky="w")
    tkgrid(wlabel <- labelRcmdr(sliderFrame, text = paste(gettextRcmdr(c("Width", " (", all.units[units], ")")), collapse="")), 
           widthSlider, sticky = "sw")
    tkgrid(hlabel <- labelRcmdr(sliderFrame, text = paste(gettextRcmdr(c("Height",  " (", all.units[units], ")")), collapse="")), 
           heightSlider, sticky = "sw")
    tkgrid(rlabel <- labelRcmdr(sliderFrame, text = paste(gettextRcmdr(c("Resolution", "(", "pixels", "/", unit[units], ")")), collapse="")), 
           resSlider, 
           disabled <- labelRcmdr(sliderFrame, text = if (units == "px") gettextRcmdr("[disabled]") else ""),
           sticky = "sw")
    tkgrid(labelRcmdr(sliderFrame, text = gettextRcmdr("Text size (points)")), 
           pointSizeSlider, sticky = "sw")
    tkgrid(sliderFrame, sticky = "w")
    tkgrid(buttonsFrame, sticky = "w")
    dialogSuffix(rows = 5, columns = 1)
}

savePDF <- function () {
    updateWidth <- function(...){
        if (tclvalue(aspectVariable) == "1"){
            tclvalue(heightVariable) <- round(aspect*as.numeric(tclvalue(widthVariable)), 1)
        }
    }
    updateHeight <- function(...){
        if (tclvalue(aspectVariable) == "1"){
            tclvalue(widthVariable) <- round((1/aspect)*as.numeric(tclvalue(heightVariable)), 1)
        }
    }
    updateSize <- function(...){
        units <- tclvalue(unitsVariable)
        size <- dev.size(units=units)
        if (units == "in") {
            wmin <- min(3, size[1])
            wmax <- max(10, size[1])
            hmin <- min(3, size[2])
            hmax <- max(10, size[2])
        }
        else {
            wmin <- min(8, size[1])
            wmax <- max(25, size[1])
            hmin <- min(8, size[2])
            hmax <- max(25, size[2])
        }
        tkconfigure(widthSlider, from = wmin, to = wmax)
        tkconfigure(heightSlider,  from = hmin, to = hmax)
        tkconfigure(wlabel, text = paste(gettextRcmdr(c("Width", " (", all.units[units], ")")), collapse=""))
        tkconfigure(hlabel, text = paste(gettextRcmdr(c("Height",  " (", all.units[units], ")")), collapse=""))
        tclvalue(widthVariable) <- size[1]
        tclvalue(heightVariable) <- size[2]
    }
    all.units <- c("inches", "cm")
    names(all.units) <- c("in", "cm")
    if (1 == dev.cur()) {
        Message(gettextRcmdr("There is no current graphics device to save."), 
                type = "error")
        return()
    }
    defaults <- list (initial.type = "pdf", initial.pointsize = 12, initial.units="in")
    dialog.values <- getDialog ("savePDF", defaults)
    units <- dialog.values$initial.units
    size <- dev.size(units=units)
    aspect <- size[2]/size[1]
    size <- round(size, 1)
    if (units == "in") {
        wmin <- min(3, size[1])
        wmax <- max(10, size[1])
        hmin <- min(3, size[2])
        hmax <- max(10, size[2])
    }
    else {
        wmin <- min(8, size[1])
        wmax <- max(25, size[1])
        hmin <- min(8, size[2])
        hmax <- max(25, size[2])
    }
    initializeDialog(title = gettextRcmdr("Save Graph as PDF/Postscript"))
    radioButtons(name = "filetype", buttons = c("pdf", "postscript", 
                                                "eps"), labels = gettextRcmdr(c("PDF", "Postscript", 
                                                                                "Encapsulated Postscript")), title = gettextRcmdr("Graphics File Type"), 
                 initialValue = dialog.values$initial.type)
    radioButtons(name = "units", buttons = c("in", "cm"), 
                 labels = gettextRcmdr(c("inches", "cm")), title = gettextRcmdr("Units"),
                 initialValue = dialog.values$initial.units, command=updateSize)
    aspectVariable <- tclVar("1")
    aspectFrame <- tkframe(top)
    aspectCheckBox <- tkcheckbutton(aspectFrame, variable = aspectVariable)
    sliderFrame <- tkframe(top)
    widthVariable <- tclVar(size[1])
    widthSlider <- tkscale(sliderFrame, from = wmin, to = wmax, 
                           showvalue = TRUE, 
                           variable = widthVariable, resolution = 0.1, orient = "horizontal", 
                           command=updateWidth)
    heightVariable <- tclVar(size[2])
    heightSlider <- tkscale(sliderFrame, from = hmin, to = hmax, 
                            showvalue = TRUE, 
                            variable = heightVariable, resolution = 0.1, orient = "horizontal",
                            command=updateHeight)
    pointSizeVariable <- tclVar(dialog.values$initial.pointsize)
    pointSizeSlider <- tkscale(sliderFrame, from = 6, to = 16, 
                               showvalue = TRUE, variable = pointSizeVariable, resolution = 1, 
                               orient = "horizontal")
    onOK <- function() {
        closeDialog()
        width <- tclvalue(widthVariable)
        height <- tclvalue(heightVariable)
        type <- tclvalue(filetypeVariable)
        units <- tclvalue(unitsVariable)
        pointsize <- tclvalue(pointSizeVariable)
        putDialog ("savePDF", list (initial.type = type, initial.pointsize = pointsize, initial.units=units))
        if (units == "cm") {
            width <- round(as.numeric(width)/2.54, 1)
            height <- round(as.numeric(height)/2.54, 1)
        } 
        if (type == "pdf") {
            ext <- "pdf"
            filetypes <- gettextRcmdr("{\"All Files\" {\"*\"}} {\"PDF Files\" {\".pdf\" \".PDF\"}}")
            initial <- "RGraph.pdf"
        }
        else if (type == "postscript") {
            ext <- "ps"
            filetypes <- gettextRcmdr("{\"All Files\" {\"*\"}} {\"Postscript Files\" {\".ps\" \".PS\"}}")
            initial <- "RGraph.ps"
        }
        else {
            ext <- "eps"
            filetypes <- gettextRcmdr("{\"All Files\" {\"*\"}} {\"Encapsulated Postscript Files\" {\".eps\" \".EPS\"}}")
            initial <- "RGraph.eps"
        }
        filename <- tclvalue(tkgetSaveFile(filetypes = filetypes, 
                                           defaultextension = ext, initialfile = initial, parent = CommanderWindow()))
        if (filename == "") 
            return()
        command <- if (type == "eps") 
            paste("dev.copy2eps(file=\"", filename, "\", width=", 
                  width, ", height=", height, ", pointsize=", pointsize, 
                  ")", sep = "")
        else paste("dev.print(", type, ", file=\"", filename, 
                   "\", width=", width, ", height=", height, ", pointsize=", 
                   pointsize, ")", sep = "")
        doItAndPrint(command)
        Message(paste(gettextRcmdr("Graph saved to file"), filename), 
                type = "note")
    }
    OKCancelHelp(helpSubject = "pdf", reset = "savePDF")
    tkgrid(filetypeFrame, sticky = "w")
    tkgrid(unitsFrame, stick="w")
    tkgrid(labelRcmdr(aspectFrame, text = gettextRcmdr("Fixed aspect ratio (height:width)")),
           aspectCheckBox, sticky="w")
    tkgrid(aspectFrame, sticky="w")
    tkgrid(wlabel <- labelRcmdr(sliderFrame, text = paste(gettextRcmdr(c("Width", " (", all.units[units], ")")), collapse="")), 
           widthSlider, sticky = "sw")
    tkgrid(hlabel <- labelRcmdr(sliderFrame, text = paste(gettextRcmdr(c("Height",  " (", all.units[units], ")")), collapse="")), 
           heightSlider, sticky = "sw")
    tkgrid(labelRcmdr(sliderFrame, text = gettextRcmdr("Text size (points)")), 
           pointSizeSlider, sticky = "sw")
    tkgrid(sliderFrame, sticky = "w")
    tkgrid(buttonsFrame, sticky = "w")
    dialogSuffix(rows = 4, columns = 1)
}

# set the colour palette

setPalette <- function() {
	cval <- function(x,y) -sum((x-y)^2)
	contrasting <- function(x)
		optim(rep(127, 3),cval,lower=0,upper=255,method="L-BFGS-B",y=x)$par
	# the following local function from Thomas Lumley via r-help
	convert <- function (color){
		rgb <- col2rgb(color)/255
		L <- c(0.2, 0.6, 0) %*% rgb
		ifelse(L >= 0.2, "#000060", "#FFFFA0")
	}
	env <- environment()
	pal <- palette()
	pickColor <- function(initialcolor, parent){
		tclvalue(.Tcl(paste("tk_chooseColor", .Tcl.args(title = "Select a Color",
										initialcolor=initialcolor, parent=parent))))
	}
	initializeDialog(title=gettextRcmdr("Set Color Palette"))
	hexcolor <- colorConverter(toXYZ = function(hex,...) {
				rgb <- t(col2rgb(hex))/255
				colorspaces$sRGB$toXYZ(rgb,...) },
			fromXYZ = function(xyz,...) {
				rgb <- colorspaces$sRGB$fromXYZ(xyz,..)
				rgb <- round(rgb,5)
				if (min(rgb) < 0 || max(rgb) > 1) as.character(NA)
				else rgb(rgb[1],rgb[2],rgb[3])},
			white = "D65", name = "#rrggbb")
	cols <- t(col2rgb(pal))
	hex <- convertColor(cols, from="sRGB", to=hexcolor, scale.in=255, scale.out=NULL)
	for (i in 1:8) assign(paste("hex", i, sep="."), hex[i], envir=env)
	paletteFrame <- tkframe(top)
	button1 <- tkbutton(paletteFrame, text=hex[1], bg = hex[1],
			fg=convert(hex[1]),
			command=function() {
				color <- pickColor(hex[1], parent=button1)
				fg <- convert(color)
				tkconfigure(button1, bg=color, fg=fg)
				assign("hex.1", color, envir=env)
			}
	)
	button2 <- tkbutton(paletteFrame, text=hex[2], bg = hex[2],
			fg=convert(hex[2]),
			command=function() {
				color <- pickColor(hex[2], parent=button2)
				fg <- convert(color)
				tkconfigure(button2, bg=color, fg=fg)
				assign("hex.2", color, envir=env)
			}
	)
	button3 <- tkbutton(paletteFrame, text=hex[3], bg = hex[3],
			fg=convert(hex[3]),
			command=function() {
				color <- pickColor(hex[3], parent=button3)
				fg <- convert(color)
				tkconfigure(button3, bg=color, fg=fg)
				assign("hex.3", color, envir=env)
			}
	)
	button4 <- tkbutton(paletteFrame, text=hex[4], bg = hex[4],
			fg=convert(hex[4]),
			command=function() {
				color <- pickColor(hex[4], parent=button4)
				fg <- convert(color)
				tkconfigure(button4, bg=color, fg=fg)
				assign("hex.4", color, envir=env)
			}
	)
	button5 <- tkbutton(paletteFrame, text=hex[5], bg = hex[5],
			fg=convert(hex[5]),
			command=function() {
				color <- pickColor(hex[5], parent=button5)
				fg <- convert(color)
				tkconfigure(button5, bg=color, fg=fg)
				assign("hex.5", color, envir=env)
			}
	)
	button6 <- tkbutton(paletteFrame, text=hex[6], bg = hex[6],
			fg=convert(hex[6]),
			command=function() {
				color <- pickColor(hex[6], parent=button6)
				fg <- convert(color)
				tkconfigure(button6, bg=color, fg=fg)
				assign("hex.6", color, envir=env)
			}
	)
	button7 <- tkbutton(paletteFrame, text=hex[7], bg = hex[7],
			fg=convert(hex[7]),
			command=function() {
				color <- pickColor(hex[7], parent=button7)
				fg <- convert(color)
				tkconfigure(button7, bg=color, fg=fg)
				assign("hex.7", color, envir=env)
			}
	)
	button8 <- tkbutton(paletteFrame, text=hex[8], bg = hex[8],
			fg=convert(hex[8]),
			command=function() {
				color <- pickColor(hex[8], parent=button8)
				fg <- convert(color)
				tkconfigure(button8, bg=color, fg=fg)
				assign("hex.8", color, envir=env)
			}
	)
	onOK <- function(){
		closeDialog(top)
		palette(c(hex.1, hex.2, hex.3, hex.4, hex.5, hex.6, hex.7, hex.8))
		Message(gettextRcmdr("Color palette reset.", type="note"))
	}
	OKCancelHelp(helpSubject="palette")
	tkgrid(button1, button2, button3, button4, button5, button6, button7, button8)
	tkgrid(paletteFrame)
	tkgrid(buttonsFrame, sticky="w")
	dialogSuffix(rows=2)
}

stripChart <- function () {
	defaults <- list (initial.group = NULL, initial.response = NULL, initial.plotType = "stack")
	dialog.values <- getDialog("stripChart", defaults)
	initializeDialog(title = gettextRcmdr("Strip Chart"))
	groupBox <- variableListBox(top, Factors(), title = gettextRcmdr("Factors (pick zero or more)"), 
			selectmode = "multiple", initialSelection = varPosn (dialog.values$initial.group, "factor"))
	responseBox <- variableListBox(top, Numeric(), title = gettextRcmdr("Response Variable (pick one)"), 
			initialSelection = varPosn (dialog.values$initial.response, "numeric"))
	onOK <- function() {
		groups <- getSelection(groupBox)
		response <- getSelection(responseBox)
		closeDialog()
		if (0 == length(response)) {
			errorCondition(recall = stripChart, message = gettextRcmdr("No response variable selected."))
			return()
		}
		.activeDataSet <- ActiveDataSet()
		plotType <- tclvalue(plotTypeVariable)
		putDialog ("stripChart", list (initial.group = groups, initial.response = response, 
						initial.plotType = plotType))
		method <- paste(", method=\"", plotType, "\"", sep = "")
		if (length(groups) == 0) 
			doItAndPrint(paste("stripchart(", .activeDataSet, 
							"$", response, method, ", xlab=\"", response, 
							"\")", sep = ""))
		else {
			groupNames <- paste(groups, collapse = "*")
			doItAndPrint(paste("stripchart(", response, " ~ ", 
							groupNames, ", vertical=TRUE", method, ", xlab=\"", 
							groupNames, "\", ylab=\"", response, "\", data=", 
							.activeDataSet, ")", sep = ""))
		}
		activateMenus()
		tkfocus(CommanderWindow())
	}
	radioButtons(name = "plotType", buttons = c("stack", "jitter"), 
			labels = gettextRcmdr(c("Stack", "Jitter")), title = gettextRcmdr("Duplicate Values"), 
			initialValue = dialog.values$initial.plotType)
	buttonsFrame <- tkframe(top)
	OKCancelHelp(helpSubject = "stripchart", reset = "stripChart")
	tkgrid(getFrame(groupBox), getFrame(responseBox), sticky = "nw")
	tkgrid(plotTypeFrame, sticky = "w")
	tkgrid(buttonsFrame, columnspan = 2, sticky = "w")
	dialogSuffix(rows = 3, columns = 2)
}


