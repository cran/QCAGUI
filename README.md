# QCAGUI

[![Build Status](https://travis-ci.org/rstudio/shiny.svg?branch=master)](https://travis-ci.org/dusadrian/QCAGUI)


The package QCAGUI continues and complements the package QCA with a graphical user interface written in Javascript,
using the package shiny. The interface is cross-platform and opens in a webpage which communicates with R via a local
web server. Every click in the interface is reactively transformed into a suitable R command, the result being printed
in an output dialog which mimics the R console. In addition to QCA functionality, the interface also provides XY plots
and Venn diagrams up to 7 causal conditions, a data browser and various other dialogs to recode and calibrate data.

QCAGUI contains an extensive set of functions to perform Qualitative Comparative Analysis:
crisp sets (csQCA), temporal (tQCA), multi-value (mvQCA), fuzzy sets (fsQCA), and
even coincidence analysis (CNA).

QCA is a methodology that bridges the qualitative and quantitative divide
in social science research. It uses a boolean algorithm that results in a minimal
causal combination which explains a given phenomenon.


## Installation

To install the stable version from CRAN, simply run the following from an R console:

```r
install.packages("QCAGUI")
```

To install the latest development builds directly from GitHub, run this instead:

```r
if (!require("devtools"))
  install.packages("devtools")
devtools::install_github("dusadrian/QCAGUI")
```


## License

The package QCAGUI is licensed under the GPLv3, with additional licences for external libraries
(see files in the inst directory for additional details)
