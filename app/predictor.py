import pandas as pd
import numpy as np
import datetime
from datetime import datetime
import os
import joblib
import re
import sklearn
import json




def get_prediction(model, m_args, data_dir):
    def convert_secs(seconds): 
        seconds = seconds % (24 * 3600) 
        hour = seconds // 3600
        seconds %= 3600
        minutes = seconds // 60
        seconds = round(seconds % 60)
        
        return {'hours': hour, 'minutes': minutes, 'seconds': seconds}

    

    json_str = json.dumps(
        {
            "LINEID": m_args['lineid'],
            "STOPPOINTID1": m_args['start_stop'],
            "STOPPOINTID2": m_args['end_stop'],
            "SUBMIT_TIME": m_args['time_secs'],
            "DAYOFWEEK": m_args['dow'],
            "HOLIDAY": m_args['holiday'],
            "feels_like": m_args['feels_like'],
            "temp": m_args['temp'],
            "clouds_all": m_args['clouds_all'],
            "weather_main": m_args['weather_main']
        
        })



    json_form = json.loads(json_str)

    df_query = pd.DataFrame([json_form])

    LINEID = str(df_query.loc[0]['LINEID'])
    SUBMIT_TIME = int(df_query['SUBMIT_TIME'])
    STOPOINTID1 = str(int(df_query['STOPPOINTID1']))
    STOPOINTID2 = str(int(df_query['STOPPOINTID2']))



    df_sequence = pd.read_csv(os.path.join(data_dir, 'stop_sequence', 'stop_{0}.csv'.format(m_args['lineid'])))


    route_list = []

    for index, row in df_sequence.iterrows():
        stop_list = row['sequence'].strip('][').split(', ')
        if (STOPOINTID1 in stop_list) and (STOPOINTID2 in stop_list) and (stop_list.index(STOPOINTID1) < stop_list.index(STOPOINTID2)):
            route_list.append(index)

    df_route_list = df_sequence.iloc[route_list].apply(lambda x: x.reset_index(drop=True))


    try:
        DIRECTION = df_route_list.loc[0]['DIRECTION']
    except Exception as e:
        print(e)

    df_query = df_query.drop(['SUBMIT_TIME'],axis=1)


    df_query_stop1 = df_query.drop(['STOPPOINTID2'],axis=1)
    df_query_stop2 = df_query.drop(['STOPPOINTID1'],axis=1)

    df_timetable = pd.read_csv(os.path.join(data_dir,'timetable_new_file', 'timetable_{0}.csv'.format(m_args['lineid'])))


    df_timetable = df_timetable.astype('str')


    df_timetable1 = df_timetable[df_timetable['STOPPOINTID']== STOPOINTID1]
    df_timetable1 = df_timetable1.rename({'STOPPOINTID': 'STOPPOINTID1'}, axis=1)
    df_timetable1 = df_timetable1.rename({'PROGRNUMBER': 'PROGRNUMBER1'}, axis=1)

    df_timetable2 = df_timetable[df_timetable['STOPPOINTID']== STOPOINTID2]
    df_timetable2 = df_timetable2.rename({'STOPPOINTID': 'STOPPOINTID2'}, axis=1)
    df_timetable2 = df_timetable2.rename({'PROGRNUMBER': 'PROGRNUMBER2'}, axis=1)

    df_timetable = pd.merge(df_timetable1, df_timetable2, on=['LINEID','ROUTEID','DIRECTION','TRIPS_PLANNEDTIME_DEP','DAYOFWEEK'])


    df_timetable


    df_timetable1 = df_timetable.drop(['STOPPOINTID2','PROGRNUMBER2'], axis=1)
    df_timetable2 = df_timetable.drop(['STOPPOINTID1','PROGRNUMBER1'], axis=1)


    df_timetable1 = df_timetable1.rename({'PROGRNUMBER1': 'PROGRNUMBER'}, axis=1)
    df_timetable2 = df_timetable2.rename({'PROGRNUMBER2': 'PROGRNUMBER'}, axis=1)


    df_fill_stop1 = pd.merge(df_timetable1, df_query_stop1, on=['LINEID','DAYOFWEEK','STOPPOINTID1'])
    df_fill_stop2 = pd.merge(df_timetable2, df_query_stop2, on=['LINEID','DAYOFWEEK','STOPPOINTID2'])


    df_fill_stop1 = df_fill_stop1.drop(['STOPPOINTID1'],axis=1)
    df_fill_stop2 = df_fill_stop2.drop(['STOPPOINTID2'],axis=1)


    df_fill_stop1_rev = df_fill_stop1.astype({'LINEID': 'category','ROUTEID':'category','PROGRNUMBER':'float64','DIRECTION':'category','TRIPS_PLANNEDTIME_DEP':'float64','DAYOFWEEK':'category','HOLIDAY':'category',"temp":"float64", "feels_like":"float64","clouds_all":"float64","weather_main":"category"})



    df_fill_stop2_rev = df_fill_stop2.astype({'LINEID': 'category','ROUTEID':'category','PROGRNUMBER':'float64','DIRECTION':'category','TRIPS_PLANNEDTIME_DEP':'float64','DAYOFWEEK':'category','HOLIDAY':'category',"temp":"float64", "feels_like":"float64","clouds_all":"float64","weather_main":"category"})

    df_fill_stop1_rev = df_fill_stop1_rev.sort_values(by=['TRIPS_PLANNEDTIME_DEP'])
    df_fill_stop2_rev = df_fill_stop2_rev.sort_values(by=['TRIPS_PLANNEDTIME_DEP'])


    df_fill_stop1_rev = df_fill_stop1_rev.apply(lambda x: x.reset_index(drop=True))
    df_fill_stop2_rev = df_fill_stop2_rev.apply(lambda x: x.reset_index(drop=True))


    departure_list = df_fill_stop1_rev['TRIPS_PLANNEDTIME_DEP'].tolist()

    list(df_fill_stop1_rev.columns.values.tolist())

    df_fill_stop1_rev =  df_fill_stop1_rev[[
    'LINEID',
    'ROUTEID',
    'DIRECTION',
    'PROGRNUMBER',
    'TRIPS_PLANNEDTIME_DEP',
    'DAYOFWEEK',
    'HOLIDAY',
    'temp',
    'feels_like',
    'clouds_all',
    'weather_main',
    ]]


    df_fill_stop2_rev =  df_fill_stop2_rev[[
    'LINEID',
    'ROUTEID',
    'DIRECTION',
    'PROGRNUMBER',
    'TRIPS_PLANNEDTIME_DEP',
    'DAYOFWEEK',
    'HOLIDAY',
    'temp',
    'feels_like',
    'clouds_all',
    'weather_main',
    ]]


    fill_stop1_pred = model.predict(df_fill_stop1_rev)
    fill_stop2_pred = model.predict(df_fill_stop2_rev)



    for index, item in enumerate(fill_stop1_pred, start=0):
        if item > SUBMIT_TIME:
            arrival_start_secs = item
            arrival_end_secs = fill_stop2_pred[index]
            break

    journey_info = {}

    try:
        journey_info["arrival_startstop"] = convert_secs(arrival_start_secs)
        journey_info["arrival_endstop"] = convert_secs(arrival_end_secs)
        journey_info["journey_time"] = convert_secs(arrival_end_secs - arrival_start_secs)
        return journey_info
        
    except Exception as e:
        print(str(e))
        journey_info["error"] = "model error"
        return journey_info
