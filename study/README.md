# Study Materials

This folder contains the experimental apparatus to run the study, as well as the data tables for this study.

The study requires PHP and javascript to run successfully.

The data are contained in the [Data](data/) folder. The [Exp1](data/Exp1/) folder contains data for our _Identification_ experiment, and [Exp2](data/Exp2/) contains information for our _Prediction_ experiment.

`participants.csv` contains anonymized information about the study participants in each experiment.
The data csvs contain the experimental responses for the identification and prediction tasks, with the following columns:

* `workerId`: The anonymized participant ID.
* `task` : The experimental task. `One` for identification, `Two` for prediction.
* `index` : The question order number.
* `rt`: The time between clicking the ready button, and entering in a response, in milliseconds.
* `binned` : Whether the bivariate map was `continuous` or `discrete`.
* `shape` : Whether the color legend was presented as an `arc` (wedge) or `square`.
* `vsup` : Whether the bivariate map was a VSUP (`yes`) or a traditional map.

There were unique columns for the identification task:

* `v` : The value of the selected target.
* `u` : The uncertainty of the selected target.
* `qV` : The value that was asked for in the question.
* `qU` : The uncertainty that was asked for in the question.
* `vError` : The signed error between `v` and `qV`.
* `uError` : The signed error between `u` and `qU`.
* `error` : `vError` + `uError`.
* `correct` : whether or not the participant selected a correct (`1`) or incorrect (`0`) target.

There were also unique columns for the prediction task:

* `V1`...`V5`: The danger value of the placed tokens.
* `U1`...`U5`: The prediction uncertainty of the placed tokens.
* `meanV`, `meanU`: The average danger and prediction uncertainty of the placed tokens.
* `stdV`, `stdU` : The standard deviation of the danger and prediction uncertainty of the placed tokens.
