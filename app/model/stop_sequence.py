import pandas as pd
import numpy as np
import datetime
import os
import joblib
import re

def stop_sequence_generate(line_file, trip_file):
    df_route = pd.read_csv('./leavetimes_by_line/' + line_file, keep_default_na=True, sep=',\s+', delimiter=';', skipinitialspace=True)
    df_route = df_route.drop(['DATASOURCE','PLANNEDTIME_DEP','ACTUALTIME_DEP','PASSENGERS','PASSENGERSIN','PASSENGERSOUT','DISTANCE','SUPPRESSED','JUSTIFICATIONID','LASTUPDATE','NOTE'],1)
    df_trips = pd.read_csv(trip_file, keep_default_na=True, sep=',\s+', delimiter=';', skipinitialspace=True)
    df_trips = df_trips.drop(['DATASOURCE','TENDERLOT','SUPPRESSED','JUSTIFICATIONID','BASIN','ACTUALTIME_ARR','ACTUALTIME_DEP','PLANNEDTIME_ARR','LASTUPDATE','NOTE'],1)
    df_trips = df_trips.rename(columns={'PLANNEDTIME_DEP': 'TRIPS_PLANNEDTIME_DEP'})

    df = pd.merge(df_route, df_trips, on=['DAYOFSERVICE', 'TRIPID','ROUTEID'])
    df['TRIPID'] = df['TRIPID'].astype('object')

    df = df[[
     'LINEID',
     'ROUTEID',
     'DIRECTION',
     'PROGRNUMBER',
     'STOPPOINTID',
     ]]

    df = df.iloc[df.astype(str).drop_duplicates().index]

    df = df.apply(lambda x: x.reset_index(drop=True))

    gl = df.groupby(['ROUTEID'])
    gl.apply(lambda _df: _df.sort_values(by=['PROGRNUMBER']))

    key_list_l = []

    for k, gp in gl:
        key_list_l.append(k)

    ge= list()
    
    for i in range(len(key_list_l)):
        ge.append(gl.get_group(key_list_l[i]).sort_values(by=['PROGRNUMBER']).apply(lambda x: x.reset_index(drop=True)))

    for i in range(len(key_list_l)):
        sequence = list()
        sequence.extend(ge[i]['STOPPOINTID'].tolist())

        ge[i]['sequence'] = [sequence] * len(ge[i])

    df3 = pd.concat(ge)
    df3 = df3.apply(lambda x: x.reset_index(drop=True))

    df4 = df3[[
     'LINEID',
     'ROUTEID',
     'DIRECTION',
     'sequence'
     ]]

    df4 = df4.iloc[df4.astype(str).drop_duplicates().index]
    df4 = df4.apply(lambda x: x.reset_index(drop=True))

    df4.to_csv('./stop_sequence/stop_' + df4.iloc[0]['LINEID'] + '.csv', index=False)