import sys
import numpy as np
import pandas as pd
import scipy.stats as stats

# Individual,Position,n_percent,dip_percent,Mutation,BadReads

df = pd.read_csv(sys.stdin, usecols = ['Individual', 'Position', 'Mutation', 'BadReads'])

# df = df[df.Position >= 6558][df.Position <= 6853]
# df = df[df.Position >= 6784][df.Position <= 6853]
# df = df[df.Position >= 6860][df.Position <= 9499]
df = df[df.Position >= 1309][df.Position <= 10124]

bins = np.linspace(df.Position.min(), df.Position.max(), 70)
df.Position = np.digitize(df.Position, bins)
df.Position = df.Position.apply(lambda x: bins[x-1])
gb = df.groupby(['Individual', 'Position'], as_index=False).mean()

gb.to_csv(sys.stdout)
