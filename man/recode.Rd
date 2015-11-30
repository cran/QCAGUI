\name{recode}

\alias{recode}

\title{Recode a variable}

\description{
Recodes a vector (numeric, character or factor) according to a set of rules.
Similar to the \code{recode} function in package \code{car}, but more flexible.
}

\usage{
recode(x, rules, ...)
}

\arguments{
    \item{x}{any kind of vector, numeric, character or factor.}
    \item{rules}{character string or a vector of character strings
                 for recoding specifications}
    \item{...}{other parameters, for compatibility with other functions such as
               \code{recode} in package \code{car} but also \code{factor} in package \code{base}}
}

\details{
Similar to the \code{recode} function in package \code{car}, the recoding rules are 
separated by semicolons, of the form \code{input=output}, and allow for:

\describe{
\item{a single value}{\code{1=0}}
\item{a range of values}{\code{2:5=1}}
\item{a set of values}{\code{c(6,7,10)=2}}
\item{\code{else}}{everything that is not covered by the previously specified rules} 
}

Contrary to the \code{recode} function in package {car}, this function
allows the \code{:} sequence operator (even for factors), so that a rule such as
\code{c(1,3,5:7)}, or \code{c(a,d,f:h)} would be valid.

Actually, since all rules are specified in a string, it really doesn't matter
if the \code{c()} function is used or not. For compatibility reasons it accepts it, but
a more simple way to specify a set of rules is \code{"1,3,5:7=A; else=B"}

Special values \code{lo} and \code{hi} may also appear in the range of values.

In the package \code{car}, a character \code{output} would have to be quoted, like \code{"1:2='A'"}
but that is not mandatory is this function, \code{"1:2=A"} would do just as well.
Output values such as \code{"NA"} or \code{"missing"} are converted to \code{NA}.

Another difference from the \code{car} package: the output is <not> automatically converted to a factor even if the original variable
is a factor. That option is left to the user's decision to specify \code{as.factor.result}, defaulted
to \code{FALSE}.

Since the two functions have the same name, it is possible that users loading both
packages to use one instead of the other (depending which package is loaded first).
In order to preserve functionality, special efforts have been made to ensure this
function performs exactly as the other one (plus more).

In order to minimize possible namespace collisions with package \code{car}, special efforts
have been done to ensure perfect compatibility with the other \code{recode()} function. The
argument \code{...} allows for more arguments specific to the \code{car} package,
such as \code{as.factor.result}, \code{as.numeric.result} and \code{levels}. In addition, it also
accepts \code{labels} and \code{ordered} specific to function \code{factor} in package \code{base}.

Blank spaces outside category labels are ignored, see the last example.
}

\examples{
x <- rep(1:3, 3)
x
#  [1] 1 2 3 1 2 3 1 2 3

recode(x, "1:2 = A; else = B")
#  [1] "A" "A" "B" "A" "A" "B" "A" "A" "B"

set.seed(1234)
x <- factor(sample(letters[1:10], 20, replace = TRUE),
          levels = letters[1:10])
x
#  [1] b g g g i g a c g f g f c j c i c c b c
# Levels: a b c d e f g h i j

recode(x, "b:d = 1; g:hi = 2; else = NA") # note the "hi" special value
#  [1]  1  2  2  2  2  2 NA  1  2 NA  2 NA  1  2  1  2  1  1  1  1

recode(x, "a, c:f = A; g:hi = B; else = C", as.factor.result = TRUE)
#  [1] C B B B B B A A B A B A A B A B A A C A
# Levels: A B C

recode(x, "a, c:f = 1; g:hi = 2; else = 3", as.factor.result = TRUE,
       labels = c("one", "two", "three"), ordered = TRUE)
#  [1] three two   two   two   two   two   one   one   two   one  
# [11] two   one   one   two   one   two   one   one   three one  
# Levels: one < two < three  


set.seed(1234)
categories <- c("An", "example", "that has", "spaces")
x <- factor(sample(categories, 20, replace = TRUE),
            levels = categories)

sort(x)
#  [1] An       An       An       An       An       example 
#  [7] example  example  example  that has that has that has
# [13] that has that has that has that has that has spaces  
# [19] spaces   spaces  
# Levels: An example that has spaces

recode(sort(x), "An : 'that has' = 1; spaces = 2")
#  [1] 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 2 2 2

# same thing with
recode(sort(x), "An : that has = 1; spaces = 2")
#  [1] 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 2 2 2
}

\keyword{functions}
