\name{deMorgan}

\alias{deMorgan}

\title{Negate Boolean expressions}

\description{
This function negates an boolean expression written in Disjunctive Normal Form.
}

\usage{
deMorgan(expression, prod.split = "", use.tilde = FALSE, complete = TRUE)
}

\arguments{
  \item{expression}{A string representing an expression written in DNF,
        or an object of class \code{"qca"}.}
  \item{prod.split}{The intersection (product) operator (if any).}
  \item{use.tilde}{Logical, use tilde for negation with bivalent variables.}
  \item{complete}{Logical, present the result broken down to individual pieces.}
}

\details{

In Boolean algebra, there are two transformation rules named after the British
mathematician Augustus De Morgan. These rules state that:

1. The complement of the union of two sets is the intersection of their complements.

2. The complement of the intersection of two sets is the union of their complements.

In "normal" language, these would be written as:

1. \code{"not (A and B)" = "(not A) or (not B)"}

2. \code{"not (A or B)" = "(not A) and (not B)"}

Based on these two laws, any Boolean expression written in disjunctive normal form
can be transformed into its negation.

It is also possible to negate all models and solutions from the result of a
Boolean minimization from function \bold{\code{eqmcc()}}. The resulting object, of
class \code{"qca"}, is automatically recognised by this function (provided the
minimization is Boolean).

}

\value{
A list with the following two components:

\tabular{rl}{
  \bold{initial} \tab {The initial expression.}\cr
  \bold{negated} \tab {The negation of the initial expression.}\cr
}

If \bold{\code{x}} is an object of type \code{"qca"}, the result is a list of solutions.
}

\author{
Adrian Dusa
}

\references{
Ragin, Charles C. 1987. \emph{The Comparative Method: Moving beyond Qualitative 
and Quantitative Strategies}. Berkeley: University of California Press.
}

\seealso{\code{\link{eqmcc}}}

\examples{
require("QCA")

# example from Ragin (1987, p.99)
deMorgan("AC + B~C")

# with different intersection operators
deMorgan("AB*EF + ~CD*EF")


# using an object of class "qca" produced with eqmcc()
data(LC)
cLC <- eqmcc(LC, "SURV", include = "?")

deMorgan(cLC)


# parsimonious solution
pLC <- eqmcc(LC, "SURV", include = "?")

deMorgan(pLC)
}

\keyword{functions}
