`possibleNumeric` <-
function(x) {
    # as.character converts everything (especially factors)
    return(!any(is.na(suppressWarnings(as.numeric(na.omit(as.character(x)))))))
}
