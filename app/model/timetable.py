import pandas as pd
import numpy as np
import datetime
import os
import joblib
import re
import os, fnmatch

def timetable_generate(line_file, trip_file):
    df_route = pd.read_csv('./leavetimes_by_line/' + line_file, keep_default_na=True, sep=',\s+', delimiter=';', skipinitialspace=True)
    df_route = df_route.drop(['DATASOURCE','PLANNEDTIME_DEP','ACTUALTIME_DEP','PASSENGERS','PASSENGERSIN','PASSENGERSOUT','DISTANCE','SUPPRESSED','JUSTIFICATIONID','LASTUPDATE','NOTE'],1)

    df_trips = pd.read_csv(trip_file, keep_default_na=True, sep=',\s+', delimiter=';', skipinitialspace=True)
    df_trips = df_trips.drop(['DATASOURCE','TENDERLOT','SUPPRESSED','JUSTIFICATIONID','BASIN','ACTUALTIME_ARR','ACTUALTIME_DEP','PLANNEDTIME_ARR','LASTUPDATE','NOTE'],1)
    df_trips = df_trips.rename(columns={'PLANNEDTIME_DEP': 'TRIPS_PLANNEDTIME_DEP'})
    df_timetable = pd.merge(df_route, df_trips, on=['DAYOFSERVICE','TRIPID','ROUTEID'])

    df_timetable = df_timetable[[
        'DAYOFSERVICE',
        'LINEID',
        'ROUTEID',
        'PROGRNUMBER',
        'STOPPOINTID',
        'DIRECTION',
        'TRIPS_PLANNEDTIME_DEP'
        ]]

    def tidy_datetime(time_str):
        if 'JAN'in time_str:
            return str(re.sub('JAN','01', time_str))
        elif 'FEB' in time_str:
            return str(re.sub('FEB','02', time_str))
        elif 'MAR' in time_str:
            return str(re.sub('MAR','03', time_str))
        elif 'APR' in time_str:
            return str(re.sub('APR','04', time_str))
        elif 'MAY' in time_str:
            return str(re.sub('MAY','05', time_str))
        elif 'JUN' in time_str:
            return str(re.sub('JUN','06', time_str))
        elif 'JUL' in time_str:
            return str(re.sub('JUL','07', time_str))
        elif 'AUG' in time_str:
            return str(re.sub('AUG','08', time_str))
        elif 'SEP' in time_str:
            return str(re.sub('SEP','09', time_str))
        elif 'OCT' in time_str:
            return str(re.sub('OCT','10', time_str))
        elif 'NOV' in time_str:
            return str(re.sub('NOV','11', time_str))
        elif 'DEC' in time_str:
            return str(re.sub('DEC','12', time_str))
        return time_str

    df_timetable['DAYOFSERVICE'] = df_timetable['DAYOFSERVICE'].apply(tidy_datetime)

    df_timetable['DAYOFSERVICE'] = pd.to_datetime(df_timetable['DAYOFSERVICE'],format='%d-%m-%y %H:%M:%S').dt.strftime('%Y-%m-%d %H:%M:%S')
    df_timetable['DAYOFSERVICE'] = pd.to_datetime(df_timetable['DAYOFSERVICE'])

#    date_before = datetime.date(2018, 8, 25)
#    date_after = datetime.date(2018, 6, 19)
#
#    summer_lines = ['9','11','27','46A','77A','83','123']
#
#    def summer_line(line):
#        if line in summer_lines:
#            return 1
#        return 0
#
#    def summer_time(datetime):
#        if datetime < date_before and datetime > date_after:
#            return 1
#        return 0

#    df_timetable['summertable'] = (df_timetable['DAYOFSERVICE'].apply(summer_time) & df_timetable['LINEID'].apply(summer_line))

    df_timetable['DAYOFWEEK'] = df_timetable['DAYOFSERVICE'].dt.dayofweek
    df_timetable['MONTH'] = df_timetable['DAYOFSERVICE'].dt.month
    df_timetable['DAY'] = df_timetable['DAYOFSERVICE'].dt.day

    df_timetable = df_timetable[[
        'LINEID',
        'ROUTEID',
        'PROGRNUMBER',
        'STOPPOINTID',
        'DIRECTION',
        'TRIPS_PLANNEDTIME_DEP',
        'DAYOFWEEK'
        ]]

    df_timetable = df_timetable.drop_duplicates()

    df_timetable.sort_values(by=['ROUTEID']).apply(lambda x: x.reset_index(drop=True))

    df_timetable['STOPPOINTID'] = df_timetable['STOPPOINTID'].astype('object')
    df_timetable['PROGRNUMBER'] = df_timetable['PROGRNUMBER'].astype('object')
    df_timetable['DIRECTION'] = df_timetable['DIRECTION'].astype('object')
    df_timetable['DAYOFWEEK'] = df_timetable['DAYOFWEEK'].astype('object')

    df_timetable.to_csv('./timetable_new_file/timetable_' + df_timetable.iloc[0]['LINEID'] + '.csv', index=False)
