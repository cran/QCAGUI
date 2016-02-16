\name{pof}

\alias{pof}
\alias{is.pof}

\title{Compute Set-Relational Parameters of Fit}

\description{
This function computes inclusion (consistency) and coverage scores.
}

\usage{
pof(setms, outcome, data, relation = "nec", inf.test = "",
    incl.cut1 = 0.75, incl.cut0 = 0.5, add = "", ...)

is.pof(x)
}

\arguments{
  \item{setms}{A data frame of set membership scores, or a matrix of implicants, 
        or a vector of implicant matrix line numbers, or a string expression}
  \item{outcome}{The name of the outcome, or a numerical vector containing the
        outcome values from a particular dataset.}
  \item{data}{The working data set.}
  \item{relation}{The set relation to \code{outcome}, either \code{"nec"} or
        \code{"suf"}}
  \item{inf.test}{The inference-statistical test to be performed (currently only
        \code{"binom"} for bivalent and multivalent crisp-set variables).}
  \item{incl.cut1}{The upper inclusion cut-off against which the
        empirical inclusion score is tested if \code{inf.test = "binom"}.}
  \item{incl.cut0}{The lower inclusion cut-off against which the
        empirical inclusion score is tested if \code{inf.test = "binom"}.}
  \item{add}{Additional measures to complement the default ones.}
  \item{...}{Other arguments (not used in this function).}
  \item{x}{An object of class "pof".}
}

\details{
The argument \code{setms} specifies a data frame of \emph{set} membership scores, 
where \emph{set} refers to any kind of set, including simple sets, combinations 
returned by \code{superSubset()} (\code{coms}), prime implicants returned by 
\code{eqmcc()} (\code{pims}) or any other compound set. \code{setms} can also be
a string expression, written in disjunctive normal form.

The function also accepts a matrix of implicants with the value representation 
of \code{createMatrix()}, or even a corresponding vector of implicant matrix line 
numbers.

Starting with version 2.0-1, the function also accepts a text string containing a
formula, in conjunction with the data where the column names in the formula are found.

If a string, the argument \code{outcome} specifies the outcome to be explained, and
for standard reasons it should be provided as upper case letters (it will nevertheless
be converted to upper case letters, by default).
Outcomes from multivalent variables require curly-bracket notation (\code{O{value}}).
Multivalue notation is allowed, values between the curly brackets being separated by
a comma (for example \code{O{1,2}}). Negation of the outcome can also be performed
using the tilde \code{~} operator, for example \code{~O{1,2}}, which is interpreted
as: "all values in X except 1 and 2" and it becomes the new outcome to be explained.

The argument \code{inf.test} provides functionality for adjudicating between
rival hypotheses on the basis of inference-statistical tests. Currently, only an
exact binomial test (\code{"binom"}) is available, which requires the data to
contain only bivalent or multivalent crisp set variables. Two one-tailed tests
are performed. The null hypothesis with respect to \code{incl.cut1} is that the
empirical inclusion score of each element in \code{setms} is not lower than the
upper critical inclusion cut-off provided in \code{incl.cut1}. The null hypothesis
with respect to \code{incl.cut0} is that the empirical inclusion score of each
element in \code{setms} is not higher than the lower critical inclusion cut-off
provided in \code{incl.cut0}.

The argument \code{add} complements the standard measures of inclusion, coverage and
PRI with other, established measures that are under testing implementation, or
candidate measures that await their recognition as standard.

One such example of an established measure is \code{ron}, suggested by
Schneider & Wagemann's (2012) relevance of necessity formula.

Starting with version 2.0-0, this function also accepts and recognize negation of both
\code{setms} and \code{outcome} using the boolean subtraction from 1. If the names of
the conditions are provided via an optional (undocumented) argument \code{conditions},
the colnames of the \code{setms} object are negated using \code{deMorgan()}.

Starting with version 2.0-1, the logical argument \code{neg.out} is deprecated, but
backwards compatible. \code{neg.out = TRUE} and a tilde \code{~} in the outcome name 
don't cancel each other out, either one (or even both) signaling if the \code{outcome}
should be negated.

When argument \code{setms} is a DNF expression, it is the only place where the
everything (including the \code{outcome}) can be negated using lower case letters, with
or without a tilde. Lower case letters and a tilde does cancel each other out, for
example \code{~X} is interpreted as \code{x}, while \code{~x} is interpreted as \code{X}.

}

\references{
Emmenegger, Patrick. 2011. \dQuote{Job Security Regulations in Western Democracies: 
A Fuzzy Set Analysis.} \emph{European Journal of Political Research} 50 (3):336-64.
DOI: \href{http://dx.doi.org/10.1111/j.1475-6765.2010.01933.x}{10.1111/j.1475-6765.2010.01933.x}.

Krook, Mona Lena. 2010. \dQuote{Women's Representation in Parliament: A Qualitative 
Comparative Analysis.} \emph{Political Studies} 58 (5):886-908.
DOI: \href{http://dx.doi.org/10.1111/j.1467-9248.2010.00833.x}{10.1111/j.1467-9248.2010.00833.x}.

Schneider, C. and Wagemann, C. (2012) \emph{Set-Theoretic Metods for the Social Sciences.
A Guide to Qualitative Comparative Analysis}. Cambridge: Cambridge University Press.
}

\seealso{\code{\link{eqmcc}}, \code{\link{superSubset}}, \code{\link{translate}}}

\examples{
# csQCA using Krook (2010)
#-------------------------
data(d.represent)
head(d.represent)

# first also compute negations
x <- d.represent[, 1:5]
WNP <- d.represent$WNP
 
# necessity parameters of fit for all conditions
pof(x, WNP)

# necessity parameters of fit for their negations
pof(1 - x, WNP)

# using the deMorgan() function to negate
pof(1 - x, WNP, conditions = names(x))

# for the negated outcome
pof(x, 1 - WNP)

# same thing with
pof(x, "~WNP", d.represent)

# negated conditions and negated outcome
pof(1 - x, 1 - WNP)

# sufficiency parameters of fit
pof(x, WNP, relation = "suf") 

# for the negated outcome
pof(x, 1 - WNP, relation = "suf")

# exact binomial tests of sufficiency and necessity inclusion
pof(x, WNP, inf.test = "binom", relation = "suf",
    incl.cut1 = 0.75, incl.cut0 = 0.5)

pof(x, WNP, inf.test = "binom", 
    incl.cut1 = 0.75, incl.cut0 = 0.5)

# fsQCA using Emmenegger (2011)
#------------------------------
data(d.jobsecurity)

# first test for minimally necessary combinations with superSubset(), 
# then check whether these combinations are also necessary for the 
# negation of the outcome
Emm.nr <- superSubset(d.jobsecurity, outcome = "JSR", incl.cut = 0.965, 
    cov.cut = 0.6)
Emm.nr

pof(Emm.nr$coms, 1 - d.jobsecurity$JSR) 

# first derive the conservative solution, then check whether the 
# negations of the prime implicants are also sufficient for the outcome 
Emm.sc <- eqmcc(d.jobsecurity, outcome = "JSR", incl.cut1 = 0.9, details = TRUE)
Emm.sc

# notice the negation of the pims' names
pof(1 - Emm.sc$pims, d.jobsecurity$JSR, relation = "suf")

# parameters of fit for matrix of implicants;
# "-1" is the placeholder for an eliminated variable;
# e.g.: R*p*V and S*c*L*P*v
#      "S"  "C"  "L"  "R"  "P"  "V"
#     [,1] [,2] [,3] [,4] [,5] [,6]
#[1,]   -1   -1   -1    1    0    1
#[2,]    1    0    1   -1    1    0
confs <- matrix(c(-1,-1,-1, 1, 0, 1, 
                   1, 0, 1,-1, 1, 0), nrow = 2, byrow = TRUE)

pof(confs, outcome = "JSR", d.jobsecurity, relation = "suf")

# or even vectors of line numbers from the implicant matrix
pof(c(43, 57), "JSR", d.jobsecurity, relation = "suf")

# parameters of fit for a data frame
x <- data.frame(A = c(1,1,1,0,1), B = c(1,1,1,0,1),
                C = c(0,1,0,0,1), D = c(0,0,1,0,1),
                O = c(1,1,1,0,1))

pof(x[, -5], x$O)

# for a single column from that data frame
pof(x$A, x$O)

# for multiple columns from that data frame
pof(x[, 1:2], x$O)

# using an expression, translated using the function translate()
data(d.urban)
pof("MLC + FRB => CP", data=d.urban)

pof("SRv + CLPv + SCRP + SLRP => ~JSR", data=d.jobsecurity)

}

\keyword{functions}
