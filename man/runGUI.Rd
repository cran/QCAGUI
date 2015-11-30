\name{runGUI}

\alias{runGUI}

\title{run the GUI shiny app for the QCA package}

\description{
Runs the graphical user interface app (\code{qcapp}) based on the \code{shiny} package.
}

\usage{
runGUI(x)
}

\arguments{
  \item{x}{Path to the shiny app.}
}

\details{
This function is nothing but a wrapper to the \code{runApp()} function in package \code{shiny}.
It locatest the \code{qcapp} folder in the path where the QCA package has been installed, and runs it.
}

\keyword{functions}
