This directory contains data tables for the experiments in our paper.

taskOne is our identification task: participants were asked to select a location on a heatmap with a given data and uncertainty value (e.g. “click the location with a value of 0.1 and an uncertainty of 0.1”)

taskTwo is our prediction task: participants were asked to place 5 tokens representing ships on heatmap to maximize the ships’ safety. Data was given as “Danger,” with an associated uncertainty in this danger prediction.

In Exp1, participants only performed taskOne, with 8 different graph/legend types.

In Exp2, participants performed a condensed version of taskOne for validation and training purposes, but the main experimental task was taskTwo. Participants saw only 4 of the 8 possible graph types tested in Exp1.

taskOne.csv and taskTwo.csv correspond to the data from the two experimental tasks (identification, and prediction, respectively) in our paper. We anonymized the data by replacing the Mechanical Turk WorkerID with an integer.

Column Key for taskOne.csv

index: the question number
rt: response time, in milliseconds
v: the value of the guessed location, in [0,1]
u: the uncertainty of the guessed location, in [0,1]
binned: whether the legend was {continuous} or {discrete}
shape: whether the legend was {arc} shaped (called “wedge” in the paper), {square} shaped, or there were two {juxtaposed} univariate legends.
vsum: whether the discrete legend was uniformly binned ({no}), or non-uniformly binned using the Value-Suppressing procedure described in the paper ({yes}).
qV: the target data value.
qU: the target uncertainty value.
vError: difference between the guessed value and the target value
uError: difference between the guessed uncertainty and the target uncertainty
error: vError+uError
correct: if the participant clicked the correct location
condition: a string uniquely picking out one of our eight conditions (vsum x binned x shape).

Column Key for taskTwo.csv

index: the question number
rt: response time, in milliseconds
binned: whether the legend was {continuous} or {discrete}.
shape: whether the legend was {arc} shaped (called “wedge” in the paper), {square} shaped, or there were two {juxtaposed} univariate legends.
vsum: whether the discrete legend was uniformly binned ({no}), or non-uniformly binned using the Value-Suppressing procedure described in the paper ({yes}).
V1-V5: the danger of the 5 tokens placed by the participant
U1-U5: the uncertainty of the 5 tokens placed by the participant.
meanV: the average danger value of the participant’s guesses. the lower this is, the “safer” the tokens placed.
meanU: the average uncertainty of the participant’s guesses.
stdV, stdU: standard deviation in value and uncertainty, respectively, in the participant guesses.
condition: a string uniquely picking out one of our eight conditions (vsum x binned x shape).

Column Key for participants.csv

Education: highest level of educational attainment.
Gender: gender, on a three-value system ({Male,Female,Decline to State or Other}).
GraphFamiliarity: self-assessed familiarity with graphs and charts, on a 5-point Likert.
Age
risk1-risk6: responses on a risk aversion assay from Mandrik & Bao 2005. Each is a 7-point Likert with either positive or negative valence. Higher values indicate more risk aversion, lower values more risk-seeking.
riskAversion: sum of risk1-risk6.

