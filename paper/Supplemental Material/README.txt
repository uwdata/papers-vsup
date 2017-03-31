This directory contains data tables as well as stimuli for the experiments in our paper.

MonteCarloPoints.pde is a Processing 3.2.1 sketch we used for generating stimuli for this experiment. As the procedure relies on randomness we assign residuals, stimuli will not be identical from run to run, but will embody the required factor levels. MonteCarloPoints requires the apache math commons 3 library.

taskOne.csv and taskTwo.csv correspond to the data from the two experimental tasks in our paper. We anonymized the data by replacing the Mechanical Turk WorkerID with an integer.

Column Key for taskOne.csv

index: the question number
rt: response time, in milliseconds
v: the value of the guessed location, in [0,1]
u: the uncertainty of the guessed location, in [0,1]
type: graph type, in {vsum,2D,juxta}, where “juxta” means two juxtaposed univariate maps, and “2D” means a traditional bivariate map, and “vsum” is our proposed technique.
size: size of the displayed map, either 4 (4x4) or 8 (8x8)
qShort: short name for the question asked:
	1uav: “Click on the map location with the greatest uncertainty”
	0u1v: ”Click on the map location with the least uncertainty AND greatest value”
	0u0v: “Click on the map location with the least uncertainty AND least value”
vError: difference between the guessed value and the requested value
uError: difference between the guessed uncertainty and the requested uncertainty
correct: if the participant clicked the correct location


Column Key for taskTwo.csv

index: the question number
rt: response time, in milliseconds
type: graph type, in {vsum,2D,juxta}, where “juxta” means two juxtaposed univariate maps, and “2D” means a traditional bivariate map, and “vsum” is our proposed technique.
role: the problem framing, either “att” (Attacker) or “def” (Defender)
meanV: the average value of the participant’s guesses. for the def role, this should be as low as possible. for the att role, this should be as high as possible.
meanU: the average uncertainty of the participant’s guesses.
stdV, stdU: standard deviation in value and uncertainty, respectively, in the participant guesses.
