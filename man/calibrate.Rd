\name{calibrate}

\alias{calibrate}

\title{Calibrate Crisp and Fuzzy Set Variables}

\description{
This function produces crisp and fuzzy sets from base variables and some specified 
threshold(s). The calibration of fuzzy sets is possible for positive and negative 
end-point and mid-point concepts, using the method of transformational assignment.
}

\usage{
calibrate(x, type = "crisp", thresholds = NA, include = TRUE, 
          logistic = TRUE, idm = 0.95, ecdf = FALSE, p = 1, q = 1)
}

\arguments{
  \item{x}{An interval or ratio-scaled base variable.}
  \item{type}{The calibration type, either "crisp" or "fuzzy".}
  \item{thresholds}{A vector of (named) thresholds.}
  \item{include}{Logical, include threshold(s) in the set (\code{type = "crisp"} 
        only).}
  \item{logistic}{Calibrate to fuzzy sets using the logistic function.}
  \item{idm}{The set inclusion degree of membership for the logistic function.}
  \item{ecdf}{Calibrate to fuzzy sets using the empirical cumulative distribution 
        function of the base variable.}
  \item{p}{Parameter: if \eqn{p > 1} concentration, if \eqn{0 < p < 1} dilation 
           below crossover.}
  \item{q}{Parameter: if \eqn{q > 1} dilation, if \eqn{0 < q < 1} concentration 
           above crossover.}
}

\details{
Calibration is the process by which set membership scores are assigned to cases.
With interval and ratio-scaled base variables, calibration can be based on
transformational assignments using (piecewise-defined) membership functions.

For \code{type = "crisp"}, one threshold produces two crisp sets: 0 and 1. 
More thresholds produce multiple crisp sets. For example, two thresholds 
produce three crisp sets: 0, 1 and 2.

For \code{type = "fuzzy"}, this function can generate fuzzy sets by linear, 
s-shaped, inverted s-shaped and logistic transformation for end-point concepts. 
It can generate fuzzy sets by trapezoidal, triangular and bell-shaped transformation
for mid-point concepts (Bojadziev and Bojadziev 2007; Clark et al. 2008; Thiem 2014; 
Thiem and Dusa 2013).

The \code{thresholds} argument can be specified either as a simple numeric vector,
or as a named numeric vector. If used as a named vector, the names for the end-point
concepts should be:\cr

\tabular{ll}{
    \code{"e"} \tab for the full set exclusion\cr
    \code{"c"} \tab for the set crossover\cr
    \code{"i"} \tab for the full set inclusion\cr
}

and for mid-point concepts the names should be:\cr

\tabular{ll}{
    \code{"e1"} \tab for the first (left) threshold for full set exclusion\cr
    \code{"c1"} \tab for the first (left) threshold for set crossover\cr
    \code{"i1"} \tab for the first (left) threshold for full set inclusion\cr
    \code{"i2"} \tab for the second (right) threshold for full set inclusion\cr
    \code{"c2"} \tab for the second (right) threshold for set crossover\cr
    \code{"e2"} \tab for the second (right) threshold for full set exclusion\cr
}

If used as a simple numerical vector, the order of the values matter.

If \code{e} \eqn{<} \code{c} \eqn{<} \code{i}, then the membership 
function is increasing from \code{e} to \code{i}. If \code{i} \eqn{<} 
\code{c} \eqn{<} \code{e}, then the membership function is decreasing from 
\code{i} to \code{e}.

Same for mid-point concepts, if \code{e1} \eqn{<} \code{c1} \eqn{<} \code{i1}
\eqn{\le} \code{i2} \eqn{<} \code{c2} \eqn{<} \code{e2}, then the membership function
is first increasing from \code{e1} to \code{i1}, then flat between \code{i1} and 
\code{i2}, and finally decreasing from \code{i2} to \code{e2}. In contrast, 
if \code{i1} \eqn{<} \code{c1} \eqn{<} \code{e1} \eqn{\le} \code{e2}
\eqn{<} \code{c2} \eqn{<} \code{i1}, then the membership function is first 
decreasing from \code{i1} to \code{e1}, then flat between \code{e1} and 
\code{e2}, and finally increasing from \code{e2} to \code{i2}.

The parameters \code{p} and \code{q} control the degree of concentration and 
dilation. They should be left at their default values unless good reasons for 
changing them exist.

When \code{logistic = TRUE} (default), the argument \code{idm} specifies the
inclusion degree of membership in the set.

If \code{ecdf = TRUE}, calibration is based on the empirical cumulative distribution 
function of \code{x}.
}

\value{
A numeric vector of set membership scores between 0 and 1 for bivalent crisp and
fuzzy set variables, or a numeric vector of set values for multivalent set variables 
(beginning with 0 at increments of 1).
}

\references{
Bojadziev, George, and Maria Bojadziev. 2007. \emph{Fuzzy Logic for Business, Finance, 
and Management}. 2nd ed. Hackensack, NJ: World Scientific.

Clark, Terry D., Jennifer M. Larson, John N. Mordeson, Joshua D. Potter, and 
Mark J. Wierman. 2008. \emph{Applying Fuzzy Mathematics to Formal Models in Comparative 
Politics}. Berlin: Springer.

Thiem, Alrik. 2014. \dQuote{Membership Function Sensitivity of Descriptive Statistics 
in Fuzzy-Set Relations.} \emph{International Journal of Social Research Methodology} 
17 (6):625-42. 
DOI: \href{http://dx.doi.org/10.1080/13645579.2013.806118}{10.1080/13645579.2013.806118}.

Thiem, Alrik, and Adrian Dusa. 2013. \emph{Qualitative Comparative Analysis with R: 
A User's Guide}. New York: Springer.
}

\examples{
# base variable; random draw from standard normal distribution
set.seed(30)
x <- rnorm(30)

# calibration thresholds
th <- quantile(x, seq(from = 0.1, to = 0.9, length = 5))

# calibration of bivalent crisp set variables
calibrate(x, thresholds = th[3])

# calibration of trivalent crisp set variables
calibrate(x, thresholds = c(th[2], th[4]))

# fuzzy-set calibration (positive end-point concept, linear)
plot(x, calibrate(x, type = "fuzzy",
                  thresholds = c("e"=th[1], "c"=th[3], "i"=th[5])), 
     ylab = "Fuzzy Set Membership")

# fuzzy-set calibration (positive and corresponding negative
# end-point concept, logistic)
plot(x, calibrate(x, type = "fuzzy",
                  thresholds = c("e"=th[1], "c"=th[3], "i"=th[5]), 
                  logistic = TRUE, idm = 0.99),
     ylab = "Fuzzy Set Membership")
points(x, calibrate(x, type = "fuzzy",
                    thresholds = c("e"=th[5], "c"=th[3], "i"=th[1]),
                    logistic = TRUE, idm = 0.99))

# fuzzy-set calibration (positive end-point concept, ECDF)
plot(x, calibrate(x, type = "fuzzy",
                  thresholds = c("e"=th[1], "c"=th[3], "i"=th[5]), 
                  ecdf = TRUE),
     ylab = "Fuzzy Set Membership")

# fuzzy-set calibration (negative end-point concept, s-shaped)
plot(x, calibrate(x, type = "fuzzy",
                  thresholds = c("e"=th[5], "c"=th[3], "i"=th[1]), 
                  p = 2, q = 2),
     ylab = "Fuzzy Set Membership")

# fuzzy-set calibration (positive mid-point concept, triangular)
plot(x, calibrate(x, type = "fuzzy",
                  thresholds = th[c(1,2,3,3,4,5)]),
     ylab = "Fuzzy Set Membership")

# same thing with
ths <- th[c(1,2,3,3,4,5)]
names(ths) <- c("e1", "c1", "i1", "i2", "c2", "e2")
plot(x, calibrate(x, type = "fuzzy", thresholds = ths),
     ylab = "Fuzzy Set Membership")

# fuzzy-set calibration (negative mid-point concept, bell-shaped)
plot(x, calibrate(x, type = "fuzzy", p = 3, q = 3,
                  thresholds = th[c(3,2,1,5,4,3)]),
     ylab = "Fuzzy Set Membership")

# same thing with
names(ths) <- c("i1", "c1", "e1", "e2", "c2", "i2")
plot(x, calibrate(x, type = "fuzzy", p = 3, q = 3, thresholds = ths),
     ylab = "Fuzzy Set Membership")
}


\keyword{functions}
