import pandas as pd
import pickle
import os
import sys
import pymysql
from sqslalchemy import create_engine

cols2drop = ['DATASOURCE', 'SUPPRESSED', 'JUSTIFICATIONID', 'NOTE']
dir_tuples = list(os.walk('data/leave_times'))
i = 1

for tuple in dir_tuples:
    try:
        df_splt = pd.read_csv(str(tuple[0]) + '/' + str(*(tuple[2])), sep=";")
        df_splt.drop(cols2drop, axis=1, inplace=True)
#        df_splt['DAYOFSERVICE'] = df_splt['DAYOFSERVICE'].map(lambda x: x[:10])

#        date_cache = {k: pd.to_datetime(k) for k in df_splt['DAYOFSERVICE'].unique()}
#        df_splt['DAYOFSERVICE'] = df_splt['DAYOFSERVICE'].map(date_cache)

#        date_cache = {k: pd.to_datetime(k, format="%d-%b-%y %H:%M:%S") for k in df_splt['LASTUPDATE'].unique()}
#        df_splt['LASTUPDATE'] = df_splt['LASTUPDATE'].map(date_cache)

#        df_splt.to_pickle("pickled_data/stoppoint_leavetimes/splt_{0}.pkl".format(str(*(tuple[2])).split('.')[0]))
        df_splt.to_sql('dublin_bus', if_exists='append'
        print("DONE : {0} DF".format(i))
        i += 1
    except Exception as e:
        print("ERROR:", str(e))

print("FINISHED : TOTAL =", i)

                                                                                                

