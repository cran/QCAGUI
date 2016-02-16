\name{factorize}

\alias{factorize}

\title{Factorize Set-Theoretic Expressions}

\description{
This function finds all possibilities for factorizing a set-theoretic expression.
}

\usage{
factorize(expression, snames = "", pos = FALSE, tilde, ...)
}

\arguments{
  \item{expression}{A string representing a set-theoretic expression or a solution 
        object of class \dQuote{qca}.}
  \item{snames}{The set names}
  \item{pos}{Logical, if possible factorize using product(s) of sums.}
  \item{tilde}{Logical, use a tilde for a negation.}
  \item{...}{Other arguments (mainly for backward compatibility).}
}

\details{
In set theory, the intersection operator \dQuote{*} is distributive over the union 
operator \dQuote{+} such that for any three sets \eqn{a}, \eqn{b} and \eqn{c}, the 
following law holds: \eqn{(a*b) + (a*c) = a*(b + c)}{(a*b) + (a*c) = a*(b + c)} 
(Hohn 1966, pp.78-80; South 1974, p.12). The \code{factorize()} function finds 
all possible sets \eqn{a}{a} for any set-theoretic expression. Factorized 
versions of the initial expression(s) can be sorted in decreasing order by the 
number of factorizing sets or in decreasing order by the number of factorized sets.

Starting with version 2.1 of the package, a number of arguments have been deprecated.
For example, \code{prod.split}, because intersections are usually indicated by a star
\dQuote{*} sign, and sometimes products are not indicated by anything (for example
when the set names are single letters.

The argument \code{snames} is only needed when products are not indicated by any
sign at all, and the set names have more than one letter each (see function
\code{translate()} for more details).

}

\value{A list with the following components:\cr
  \item{initial}{The initial expression.}
  \item{factored}{The factorizations of the initial expression.}
}

\references{
Hohn, Franz E. 1966. \emph{Applied Boolean Algebra: An Elementary Introduction}. 
2nd ed. New York: Macmillan.

South, G. F. 1974. \emph{Boolean Algebra and Its Uses}. New York: Van Nostrand Reinhold.
}

\seealso{\code{\link{translate}}}

\examples{

# results presented in alphabetical order
factorize("one*TWO*four + one*THREE + THREE*four")

# to preserve a certain order of the set names
factorize("one*TWO*four + one*THREE + THREE*four",
          snames = "ONE, TWO, THREE, FOUR")

factorize("~ONE*TWO*~FOUR + ~ONE*THREE + THREE*~FOUR",
          snames = "ONE, TWO, THREE, FOUR")


# factorize solution objects directly
data(d.partybans)
HK.sol <- eqmcc(d.partybans, outcome = "PB", conditions = "C, F, T, V", 
  include = "?")
factorize(HK.sol)

data(d.jobsecurity)
Emm.sol <- eqmcc(d.jobsecurity, outcome = "JSR", incl.cut1 = 0.9)
factorize(Emm.sol)

# using pos - products of sums
factorize("a*c + a*D + b*c + b*D", pos = TRUE)

}

\keyword{functions}
