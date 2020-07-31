import os
import os.path
import json
import pandas as pd
import joblib 


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
                "DIRECTION": m_args['direction'],
                "SUBMIT_TIME": m_args['time_secs'],
                "DAYOFWEEK": m_args['dow'],
                "HOLIDAY": m_args['holiday'],
                "rain": m_args['rain'],
                "temp": m_args['temp'],
                "vapour_pressure": m_args['vp'],
                "rel_hum": m_args['rh']
            })
        
    json_form = json.loads(json_str)
    df_query = pd.DataFrame([json_form])

    SUBMIT_TIME = int(df_query['SUBMIT_TIME'])

    df_query_stop1 = df_query[['LINEID',
                            'STOPPOINTID1',
                            'DIRECTION',
                            'DAYOFWEEK',
                            'HOLIDAY',
                            'rain',
                            'temp',
                            'vapour_pressure',
                            'rel_hum']]

    df_query_stop2 = df_query[['LINEID',
                            'STOPPOINTID2',
                            'DIRECTION',
                            'DAYOFWEEK',
                            'HOLIDAY',
                            'rain',
                            'temp',
                            'vapour_pressure',
                            'rel_hum']]

    df_query_stop1 = df_query_stop1.rename({'STOPPOINTID1': 'STOPPOINTID'}, axis=1)
    df_query_stop2 = df_query_stop2.rename({'STOPPOINTID2': 'STOPPOINTID'}, axis=1)

    try:
        #df_timetable = pd.read_csv(os.path.join(data_dir, 'timetable_file/timetable_{0}.csv'.format(m_args['lineid'])))
        df_timetable = pd.read_csv(os.path.join(data_dir, 'timetable_file\\timetable_{0}.csv'.format(m_args['lineid'])))
    except:
        journey_info["error"] = "file structure error"
        return journey_info

    df_timetable = df_timetable.astype('str')
    df_query_stop1 = df_query_stop1.astype('str')
    df_query_stop2 = df_query_stop2.astype('str')

    df_fill_stop1 = pd.merge(df_timetable, df_query_stop1, on=['LINEID', 'STOPPOINTID','DIRECTION','DAYOFWEEK'])
    df_fill_stop2 = pd.merge(df_timetable, df_query_stop2, on=['LINEID', 'STOPPOINTID','DIRECTION','DAYOFWEEK'])

    df_fill_stop1 = df_fill_stop1.rename({'STOPPOINTID': 'STOPPOINTID1'}, axis=1)
    df_fill_stop2 = df_fill_stop2.rename({'STOPPOINTID': 'STOPPOINTID2'}, axis=1)

    df_fill = pd.merge(df_fill_stop1, df_fill_stop2, on=['LINEID','ROUTEID','DIRECTION','DAYOFWEEK','TRIPS_PLANNEDTIME_DEP','HOLIDAY','rain','temp','vapour_pressure','rel_hum'])

    df_fill_stop1 = df_fill[['LINEID',
                            'ROUTEID',
                            'STOPPOINTID1',
                            'DIRECTION',
                            'TRIPS_PLANNEDTIME_DEP',
                            'DAYOFWEEK',
                            'HOLIDAY',
                            'rain',
                            'temp',
                            'vapour_pressure',
                            'rel_hum']]

    df_fill_stop2 = df_fill[['LINEID',
                            'ROUTEID',
                            'STOPPOINTID2',
                            'DIRECTION',
                            'TRIPS_PLANNEDTIME_DEP',
                            'DAYOFWEEK',
                            'HOLIDAY',
                            'rain',
                            'temp',
                            'vapour_pressure',
                            'rel_hum']]

    df_fill_stop1 = df_fill_stop1.rename({'STOPPOINTID1': 'STOPPOINTID'}, axis=1)
    df_fill_stop2 = df_fill_stop2.rename({'STOPPOINTID2': 'STOPPOINTID'}, axis=1)

    df_fill_stop1_rev = df_fill_stop1.astype({'LINEID': 'category','ROUTEID':'category','STOPPOINTID':'category','DIRECTION':'category','TRIPS_PLANNEDTIME_DEP':'int64','DAYOFWEEK':'category','HOLIDAY':'category','rain':'float64','temp':'float64','vapour_pressure':'float64','rel_hum':'float64'})
    df_fill_stop2_rev = df_fill_stop2.astype({'LINEID': 'category','ROUTEID':'category','STOPPOINTID':'category','DIRECTION':'category','TRIPS_PLANNEDTIME_DEP':'int64','DAYOFWEEK':'category','HOLIDAY':'category','rain':'float64','temp':'float64','vapour_pressure':'float64','rel_hum':'float64'})

    df_fill_stop1_rev = df_fill_stop1_rev.sort_values(by=['TRIPS_PLANNEDTIME_DEP'])
    df_fill_stop2_rev = df_fill_stop2_rev.sort_values(by=['TRIPS_PLANNEDTIME_DEP'])

    df_fill_stop1_rev = pd.get_dummies(df_fill_stop1_rev)
    df_fill_stop2_rev = pd.get_dummies(df_fill_stop2_rev)

    try:
        #model_columns = joblib.load(os.path.join(data_dir, 'model_columns/columns_{0}.pkl'.format(m_args['lineid'])))
        model_columns = joblib.load(os.path.join(data_dir, 'model_columns\\columns_{0}.pkl'.format(m_args['lineid'])))
    except:
        journey_info["error"] = "file structure error"
        return journey_info

    for col in model_columns:
        if col not in df_fill_stop1_rev.columns:
            df_fill_stop1_rev[col] = 0
        if col not in df_fill_stop2_rev.columns:
            df_fill_stop2_rev[col] = 0

    df_fill_stop1_rev = df_fill_stop1_rev[model_columns]
    df_fill_stop2_rev = df_fill_stop2_rev[model_columns]

    fill_stop1_pred = model.predict(df_fill_stop1_rev)
    fill_stop2_pred = model.predict(df_fill_stop2_rev)


    for item in fill_stop1_pred:
        if item > SUBMIT_TIME:
            departure_index = list(fill_stop1_pred).index(item)
            arrival_start_secs = item
            break
    
    try:
        arrival_end_secs = list(fill_stop2_pred)[departure_index]
        journey_info = {}
        journey_info["arrival_startstop"] = convert_secs(arrival_start_secs)
        journey_info["arrival_endstop"] = convert_secs(arrival_end_secs)
        journey_info["journey_time"] = convert_secs(arrival_end_secs - arrival_start_secs)

        return journey_info
    except:
        journey_info["error"] = "model error"
        return journey_info
