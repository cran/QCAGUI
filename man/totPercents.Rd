\name{totPercents}
\alias{totPercents}

\title{Total Percentage Tables}
\description{
  Percentage a matrix or higher-dimensional array of frequency counts by
  rows, columns, or total frequency.
}
\usage{
totPercents(tab, digits=1)
}

\arguments{
  \item{tab}{a matrix or higher-dimensional array of frequency counts.}
  \item{digits}{number of places to the right of the decimal place for percentages.}
}

\value{
  Returns an array of the same size and shape as \code{tab} percentaged by
  by the table total.
}

\author{John Fox \email{jfox@mcmaster.ca}}


\keyword{misc}

