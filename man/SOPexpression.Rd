\name{Interpret SOP expressions: translate, compute, findRows}

\alias{translate}
\alias{compute}
\alias{findRows}

\title{Functions to interpret a SOP expression}

\description{
These functions interpret an expression written in a SOP (sum of products) form, for both
crisp and multivalue QCA. The function translate() translates the expression into a standard
(canonical) SOP form using a matrix of implicants, while compute() uses the first to compute
the scores based on a particular dataset.

The function findRows() takes a QCA expression written in SOP form, and applies it
on a truth table to find all rows that match the pattern in the expression.

For crisp sets notation, upper case letters are considered the presence of that causal
condition, and lower case letters are considered the absence of the respective causal
condition. Tilde is recognized as a negation, even in combination with upper/lower letters.

Functions similar to translate() and compute() have initially been written by Jirka
Lewandowski (2015) but the actual code in these functions has been completely re-written
to integrate it with the package QCAGUI, and expanded with more extensive functionality
(see details and examples below).
}

\usage{
translate(expression = "", snames = "")

compute(expression = "", data, separate = FALSE)

findRows(expression = "", ttobj, remainders = FALSE)
}

\arguments{
  \item{expression}{String: a QCA expression written in sum of products form.}
  \item{snames}{A string containing the sets' names, separated by commas.}
  \item{data}{A dataset with binary cs, mv and fs data.}
  \item{separate}{Logical, perform computations on individual, separate paths.}
  \item{ttobj}{A truth table, an object of class "tt".}
  \item{remainders}{Logical, find remainders only.}
}

\details{
A SOP ("sum of products") is also known as a DNF ("disjunctive normal form"), or in other
words a "union of intersections", for example \bold{\code{A*D + B*c}}.

The same expression can be written in multivalue notation: \bold{\code{A{1}*D{1} + B{1}*C{0}}}.
Both types of expressions are valid, and yield the same result on the same dataset.

For multivalue notation, expressions can contain multiple values to translate, separated
by a comma. If B was a multivalue causal condition, an expression could be:
\bold{\code{A{1} + B{1,2}*C{0}}}.

In this example, all values in B equal to either 1 or 2 will be translated to 1, and the
rest of the (multi)values will be translated to 0.

In multivalue notation, causal snames are expected as upper case letters, and they will be
converted to upper case by default.

The function automatically detects the use of tilde "~" as a negation for a particular
causal condition. \bold{\code{~A}} does two things: it identifies the presence of causal
condition \bold{\code{A}} (because it was specified as upper case) and it recognizes that it
must be negated, because of the  tilde. It works even combined with lower case names:
\bold{\code{~a}}, which is interpreted as \bold{\code{A}}.

For multivalue notation, a pseudo-standard is applied. For a binary causal condition,
\bold{\code{A{0}}} is the negation of \bold{\code{A}}, and \bold{\code{~A{0}}} can be interpreted
as the presence of \bold{\code{A}}. Starting from these two agreed statements, when multiple
values are supplied, the pseudo-standard interprets anything that contains a value of 0 as the
absence of causal condition: \bold{\code{A{0,2}}} will be translated as 0, and upon recoding in
the real data, values 0 and 2 will be recoded to 0 and the rest of the values to 1. 

Similarly, negations work with multivalue snames: \bold{\code{~A{1,2}}} is be interpreted as
"all values except 1 and 2 should be translated as 0", whereas \bold{\code{~A{0,2}}} will be
translated as 1, and all other values except 0 and 2 will be recoded to 0.

The use of the product operator \bold{\code{*}} is redundant when causal snames' names are single
letters (for example \bold{\code{AD + Bc}}), and is also redundant for multivalue data, where 
product terms can be separated by using the curly brackets notation.

When causal snames are binary and their names have multiple letters (for example
\bold{\code{AA + CC*bb}}), the use of the product operator \bold{\code{*}} is preferable but the
function manages to translate an expression even without it (\bold{\code{AA + CCbb}}) by searching
deep in the space of the conditions' names, at the cost of slowing down for a high number of causal
conditions. For this reason, an arbitrary limit of 7 causal \bold{\code{snames}} is imposed, to write an
expression with.
}


\value{
A standard of implicants, with the following codes:
    \tabular{rl}{
         0 \tab absence of a causal condition\cr
         1 \tab presence of a causal condition\cr
        -1 \tab causal condition was eliminated\cr
    }
The matrix was also assigned a class "translate", to eliminate the -1 codes when printed.
}

\author{
Adrian Dusa
}

\references{
Jirka Lewandowski (2015) QCAtools: Helper functions for QCA in R. R package version 0.1
}

\examples{
require("QCA")

translate("A + B*C")

# same thing in multivalue notation
translate("A{1} + B{1}*C{1}")

# using upper/lower letters
translate("A + b*C")

# the negation with tilde is recognised
translate("~A + b*C")

# even in combination of upper/lower letters
translate("~A + ~b*C")

# and even for multivalue variables
translate("~A{1} + ~B{0}*C{1}")

# in multivalue notation, the product sign * is redundant
translate("C{1} + T{2} + T{1}V{0} + C{0}")

# multiple values can be specified
translate("C{1} + T{1,2} + T{1}V{0} + C{0}")

# or even negated
translate("C{1} + ~T{1,2} + T{1}V{0} + C{0}")

# if the expression does not contain the product sign *
# snames are required to complete the translation 
translate("AB + cD", "A, B, C, D")

# snames are not required
translate("PER*FECT + str*ing")

# snames are required
translate("PERFECT + string", "PER, FECT, STR, ING")

# it works even with overlapping columns
# SU overlaps with SUB in SUBER, but the result is still correct
translate("SUBER + subset", "SU, BER, SUB, SET")

\dontrun{
# error because combinations of condition names clash
translate("SUPER + subset", "SUP, ER, SU, PER, SUB, SET")
}

# to print _all_ codes from the standard output matrix
(obj <- translate("A + b*C"))
print(obj, original = TRUE) # also prints the -1 code



# for compute()
data(CVF)
compute("natpride + GEOCON", data = CVF)

# calculating individual paths
compute("natpride + GEOCON", data = CVF, separate = TRUE)



# for findRows()
data(LC)
ttLC <- truthTable(LC, "SURV", show.cases = TRUE)

findRows("DEV*ind*STB", ttLC)


findRows("DEV*ind*STB", ttLC, remainders = TRUE)
}

\keyword{functions}
