import sys
import numpy as np
import pandas as pd
import scipy.stats as stats

df = pd.read_csv(sys.stdin, dtype={ 'DepDelay': np.float64 }, usecols = ['DayOfWeek', 'DepTimeBlk', 'DepDelay'])

gb = df.groupby(['DayOfWeek', 'DepTimeBlk'])['DepDelay'].agg({
  'DepDelay': np.mean,
  'StdMeanErr': lambda x: stats.sem(x, nan_policy='omit')
})

gb.to_csv(sys.stdout)
