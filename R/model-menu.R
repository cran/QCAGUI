# Model menu dialogs

# last modified 2011-12-22 by J. Fox

selectActiveModel <- function(){
	models <- listAllModels()
	.activeModel <- ActiveModel()
	if ((length(models) == 1) && !is.null(.activeModel)) {
		Message(message=gettextRcmdr("There is only one model in memory."),
				type="warning")
		tkfocus(CommanderWindow())
		return()
	}
	if (length(models) == 0){
		Message(message=gettextRcmdr("There are no models from which to choose."),
				type="error")
		tkfocus(CommanderWindow())
		return()
	}
	initializeDialog(title=gettextRcmdr("Select Model"))
	.activeDataSet <- ActiveDataSet()
	initial <- if (is.null(.activeModel)) NULL else which(.activeModel == models) - 1
	modelsBox <- variableListBox(top, models, title=gettextRcmdr("Models (pick one)"), 
			initialSelection=initial)
	onOK <- function(){
		model <- getSelection(modelsBox)
		closeDialog()
		if (length(model) == 0) {
			tkfocus(CommanderWindow())
			return()
		}
		dataSet <- as.character(get(model)$call$data)
		if (length(dataSet) == 0){
			errorCondition(message=gettextRcmdr("There is no dataset associated with this model."))
			return()
		}
		dataSets <- listDataSets()
		if (!is.element(dataSet, dataSets)){
			errorCondition(message=sprintf(gettextRcmdr("The dataset associated with this model, %s, is not in memory."), dataSet))
			return()
		}
		if (is.null(.activeDataSet) || (dataSet != .activeDataSet)) activeDataSet(dataSet)
		putRcmdr("modelWithSubset", "subset" %in% names(get(model)$call))
		activeModel(model)
		tkfocus(CommanderWindow())
	}
	OKCancelHelp()
	nameFrame <- tkframe(top)
	tkgrid(labelRcmdr(nameFrame, fg="blue", text=gettextRcmdr("Current Model: ")), 
			labelRcmdr(nameFrame, text=tclvalue(getRcmdr("modelName"))), sticky="w")
	tkgrid(nameFrame, sticky="w", columnspan="2")
	tkgrid(getFrame(modelsBox), columnspan="2", sticky="w")
	tkgrid(buttonsFrame, columnspan=2, sticky="w")
	dialogSuffix(rows=3, columns=2)
}

