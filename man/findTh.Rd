\name{findTh}

\alias{findTh}

\title{Find calibration thresholds}

\description{
The purpose of this function is to automatically find calibration thresholds
for a numerical causal condition, to be split into separate groups.
}

\usage{
findTh(x, n = 1, hclustm = "ward.D2", distm = "canberra", ...)
}

\arguments{
  \item{x}{A numerical causal condition.}
  \item{n}{The number of thresholds to find.}
  \item{hclustm}{The agglomeration (clustering) method to be used.}
  \item{distm}{The distance measure to be used.}
  \item{...}{Other arguments (mainly for backwards compatibility).}
}

\details{
The process of calibration into crisp sets assumes expert knowledge about the
best threshold(s) which separates the raw data into the most meaningful
groups.

In the absence of such knowledge, an automatic procedure might help grouping
the raw data according to statistical clustering techniques.

The number of groups to split depends on the number of thresholds: one
thresholds splits into two groups, two thresholds splits into three groups etc.

Previous versions of this function had an argument named \bold{\code{groups}} instead
of argument \bold{\code{n}}, but they are bacwards compatible.

For more details about how many groups can be formed with how many thresholds,
see \code{?cutree}.

More details about the clustering techniques used in this function are found
using \code{?hclust}, and also more details about different distance measures
can be found with \code{?dist}. This function uses their default values.

Starting with version 2.2, this function changed the default values for arguments
\bold{\code{hclustm}} and \bold{\code{distm}}. Previously, they were left at their
defaults from the original functions \bold{\code{hclust()}} and \bold{\code{dist()}}
but now they have changed to better identify groupings for QCA analysis, see examples.

The method "ward.D2" implements Ward's original clustering criterion based on
minimum variance method to find compact, spherical clusters (perfect for QCA
analyses), while the distance "canberra" is also well suited to find compact
clusters, with the additional note that it needs non-negative values (which
is also the most common case in the QCA research).

}

\value{
A numeric vector of length \bold{\code{n}}.
}

\author{
Adrian Dusa
}


\seealso{\code{\link{cutree}}, \code{\link{hclust}}, \code{\link{dist}}}

\examples{

# hypothetical list of country GDPs, clearly separated
# into either two or three groups
gdp <- c(460, 500, 900, 2000, 2100, 2400, 15000, 16000, 20000)


# find one threshold to separate into two groups
findTh(gdp)
# 8700


# find two thresholds to separate into two groups
findTh(gdp, n = 2)
# 1450 8700


# using the (old) defaults from the original functions
findTh(gdp, n = 2, hclustm = "complete", distm = "euclidean")
# 8700 18000 (?)

}

\keyword{functions}

