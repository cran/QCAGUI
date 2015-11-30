\name{truthTable}
\alias{truthTable}
\alias{is.tt}

\title{Create a Truth Table}

\description{
This function creates truth tables from any kind of common input data. For
crisp-set variables, cases are assigned directly to their respective configuration.
For fuzzy-set variables, the function first finds the one configuration of which
a case is more a member than not before assigning it.
}

\usage{
truthTable(data, outcome = "", neg.out = FALSE, conditions = "", 
           n.cut = 1, incl.cut1 = 1, incl.cut0 = 1, complete = FALSE, 
           show.cases = FALSE, sort.by = "", use.letters = FALSE,
           inf.test = "", ...)

is.tt(x)
}

\arguments{
  \item{data}{A data set of bivalent crisp-set or fuzzy-set variables or multivalent
        crisp-set variables.}
  \item{outcome}{Scalar, the name of the outcome.}
  \item{neg.out}{Logical, use negation of \code{outcome}.}
  \item{conditions}{A character vector of condition variables' names, or a single
        string containing the condition variables' names separated by commas.}
  \item{n.cut}{The minimum number of cases with set membership score above 0.5 
        for an output function value of "0", "1" or "C".}
  \item{incl.cut1}{The minimum sufficiency inclusion score for an output function 
        value of "1".}
  \item{incl.cut0}{The maximum sufficiency inclusion score for an output function 
        value of "0".}
  \item{complete}{Logical, print complete truth table.}
  \item{show.cases}{Logical, print case names.}
  \item{sort.by}{Sort the truth table according to various columns.}
  \item{use.letters}{Logical, use simple letters instead of original variable 
        names.}
  \item{inf.test}{A vector specifying the inference-statistical test to be 
        performed (currently only \code{"binom"}) and the critical significance 
        level.}
  \item{...}{Other arguments (for backward compatibility).}
  \item{x}{An object of class "tt".}
}

\details{
The argument \code{data} requires a suitable data set. Suitable data sets have 
the following structure: values of 0 and 1 for bivalent crisp-set variables, 
values between 0 and 1 for bivalent fuzzy-set variables, and values beginning with 
0 at increments of 1 for multivalent crisp-set variables. The placeholder "-" 
indicates a "don't care" value in auxiliary conditions that specify temporal order 
between other substantive conditions in tQCA. These values lead to the exclusion 
of the auxiliary condition from the computation of parameters of fit. 

The argument \code{conditions} specifies the names of the condition variables.
If omitted, all variables in \code{data} are used except \code{outcome}.

Configurations that contain fewer than \code{n.cut} cases with membership scores 
above 0.5 are coded as logical remainders (\code{OUT = "?"}). If the number of 
such cases is at least \code{n.cut}, configurations with an inclusion score of 
at least \code{incl.cut1} are coded positive (\code{OUT = "1"}), configurations 
with an inclusion score below \code{incl.cut1} but with at least \code{incl.cut0} 
are coded as a contradiction (\code{OUT = "C"}), and configurations with an 
inclusion score below \code{incl.cut0} are coded negative (\code{OUT = "0"}). 
If \code{incl.cut0} is unspecified, it is set equal to \code{incl.cut1} and no 
contradictions can occur.

The logical argument \code{show.cases} controls whether case names are displayed
next to their corresponding configuration (do not use with many cases and/or
long case names).

The \code{sort.by} argument orders all configurations by any of the columns
present in the truth table. Typically, sorting occurs by their inclusion scores 
(\emph{incl}) and/or the number of cases with membership above 0.5 they contain 
(\emph{n}), in either order.

\code{sort.by} can also be a named logical vector, with the names indicating the
columns to sort and the logical value indicating a decreasing order (\code{TRUE})
or not.

Aternatively, the (now unformal) \code{decreasing} argument can be used either as
a logical vector of the same length as \code{sort.by}, or a single logical value
which will be used for all columns in \code{sort.by}. If the length of the 
\code{decreasing} is shorter than \code{sort.by}'s, it will be augmented with
\code{TRUE} values. If \code{sort.by} is already defined as a logical vector, 
\code{decreasing} will be ignored.

If the conditions are already named with single letters, the argument 
\code{use.letters} will have no effect.

The argument \code{inf.test} provides functionality for basing output function
value codings on inference-statistical tests. Currently, only an exact binomial
test (\code{"binom"}) is available, which requires the data to contain only
bivalent or multivalent crisp set variables. The argument requires a vector of
length two, comprising the test and a critical significance level. If the
empirical inclusion score of a configuration is not significantly lower than the
upper critical inclusion cut-off \code{incl.cut1}, it will be coded positive
(\code{OUT = "1"}). If it is significantly lower than \code{incl.cut1} but still
significantly higher than the the lower critical inclusion cut-off
\code{incl.cut0}, it will be coded as a contradiction (\code{OUT = "C"}). If it
is not significantly higher than \code{incl.cut0}, it will be coded negative
(\code{OUT = "0"}).

For backward compatibility, the (non-formal) logical argument \code{PRI} returns
PRI (proportional reduction in inconsistency) scores (see Schneider and Wagemann 
2012, pp. 241-249; Thiem and Dusa 2013, pp. 63-64, 78-79).
}

\value{An object of class "tt", which is a list with the following components:\cr
  \item{tt}{The truth table.}
  \item{indexes}{The configuration line numbers.}
  \item{noflevels}{A vector with the number of condition variable values.}
  \item{initial.data}{The initial data.}
  \item{recoded.data}{Recoded data (if crisp, same as \code{initial.data}; if 
                      fuzzy, dichotomized version of \code{initial.data}).}
  \item{cases}{The cases with membership above 0.5 in each configuration.}
  \item{options}{The command options used.}
  \item{rowsorder}{Only if \code{sort.by} was used, containing the order of
        the rows after sorting.}
}

\references{
Emmenegger, Patrick. 2011. \dQuote{Job Security Regulations in Western Democracies: 
A Fuzzy Set Analysis.} \emph{European Journal of Political Research} 50 (3):336-64.
DOI: \href{http://dx.doi.org/10.1111/j.1475-6765.2010.01933.x}{10.1111/j.1475-6765.2010.01933.x}.

Hartmann, Christof, and Joerg Kemmerzell. 2010. \dQuote{Understanding Variations 
in Party Bans in Africa.} \emph{Democratization} 17 (4):642-65.
DOI: \href{http://dx.doi.org/10.1080/13510347.2010.491189}{10.1080/13510347.2010.491189}.

Krook, Mona Lena. 2010. \dQuote{Women's Representation in Parliament: A Qualitative 
Comparative Analysis.} \emph{Political Studies} 58 (5):886-908.
DOI: \href{http://dx.doi.org/10.1111/j.1467-9248.2010.00833.x}{10.1111/j.1467-9248.2010.00833.x}.

Ragin, Charles C. 1987. \emph{The Comparative Method: Moving beyond Qualitative and 
Quantitative Strategies}. Berkeley: University of California Press.

Ragin, Charles C. 2008. \emph{Redesigning Social Inquiry: Fuzzy Sets and Beyond}. 
Chicago: University of Chicago Press.

Ragin, Charles C., and Sarah Ilene Strand. 2008. \dQuote{Using Qualitative Comparative 
Analysis to Study Causal Order: Comment on Caren and Panofsky (2005).} 
\emph{Sociological Methods & Research} 36 (4):431-41.
DOI: \href{http://dx.doi.org/10.1177/0049124107313903}{10.1177/0049124107313903}.

Schneider, Carsten Q., and Claudius Wagemann. 2012. \emph{Set-Theoretic Methods 
for the Social Sciences: A Guide to Qualitative Comparative Analysis (QCA)}. 
Cambridge: Cambridge University Press.

Thiem, Alrik, and Adrian Dusa. 2013. \emph{Qualitative Comparative Analysis with R: 
A User's Guide}. New York: Springer.

}

\seealso{\code{\link{eqmcc}}}

\examples{
# csQCA using Krook (2010)
#-------------------------
data(d.represent)
head(d.represent)

# print truth table
truthTable(d.represent, outcome = "WNP")

# print complete truth table, show cases, and first sort by 
# inclusion scores in decreasing order, then by number of cases
# in increasing order
truthTable(d.represent, outcome = "WNP", complete = TRUE, 
  show.cases = TRUE, sort.by = "incl = TRUE, n = FALSE")
  
# same thing with
truthTable(d.represent, outcome = "WNP", complete = TRUE, 
  show.cases = TRUE, sort.by = "incl, n",
  decreasing = "TRUE, FALSE")

# code configurations with single case as remainders
Kro.tt <- truthTable(d.represent, outcome = "WNP", n.cut = 2, 
  show.cases = TRUE)
Kro.tt

# print cases that were assigned to remainders based on n.cut
Kro.tt$excluded

# fsQCA using Emmenegger (2011)
#------------------------------
data(d.jobsecurity)
head(d.jobsecurity)

# code non-remainder configurations with inclusion scores 
# between 0.5 and 0.9 as contradictions
Emm.tt <- truthTable(d.jobsecurity, outcome = "JSR", incl.cut1 = 0.9, 
  incl.cut0 = 0.5)
Emm.tt

# truth table based on negated outcome set
Emm.tt <- truthTable(d.jobsecurity, outcome = "JSR", neg.out = TRUE, 
  incl.cut1 = 0.9, incl.cut0 = 0.5)
Emm.tt

# mvQCA using Hartmann and Kemmerzell (2010)
#-------------------------------------------
data(d.partybans)
head(d.partybans)

# code non-remainder configurations with inclusion scores below 1 
# but above 0.4 as contradictions 
HK.tt <- truthTable(d.partybans, outcome = "PB", 
  conditions = "C, F, T, V", incl.cut0 = 0.4)
HK.tt

# list the number of levels (values)  
HK.tt$noflevels

# which configurations have more than 2 cases?
HK.tt$tt[which(HK.tt$tt$n > 2), ]

# code output function values in truth table based on 
# exact binomial test (condition variable V dropped)
HK.tt <- truthTable(d.partybans, outcome = "PB", 
  conditions = "C, F, T", incl.cut1 = 0.9, incl.cut0 = 0.4, 
  show.cases = TRUE, inf.test = "binom, 0.1")
HK.tt

# tQCA using Ragin and Strand (2008)
#-----------------------------------
data(d.graduate)
head(d.graduate)

# tQCA truth table with "don't care" values
truthTable(d.graduate, outcome = "REC")

}

\keyword{functions}
