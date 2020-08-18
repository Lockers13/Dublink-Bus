import pandas as pd
import numpy as np

import datetime
from datetime import datetime
import os
import joblib
import re

from sklearn.compose import ColumnTransformer
from sklearn.datasets import fetch_openml
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import MinMaxScaler, StandardScaler, OneHotEncoder
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.compose import make_column_selector as selector
from xgboost import XGBRegressor

import os, fnmatch

def xgboost_model(line_file, trip_file, weather_file):
    df_route = pd.read_csv('./leavetimes_by_line/' + line_file, keep_default_na=True, sep=',\s+', delimiter=';', skipinitialspace=True)
    df_route = df_route.drop(['DATASOURCE','PLANNEDTIME_DEP','ACTUALTIME_DEP','PASSENGERS','PASSENGERSIN','PASSENGERSOUT','DISTANCE','SUPPRESSED','JUSTIFICATIONID','LASTUPDATE','NOTE'],1)

    df_trips = pd.read_csv(trip_file, keep_default_na=True, sep=',\s+', delimiter=';', skipinitialspace=True)
    df_trips = df_trips.drop(['DATASOURCE','TENDERLOT','SUPPRESSED','JUSTIFICATIONID','BASIN','ACTUALTIME_ARR','ACTUALTIME_DEP','PLANNEDTIME_ARR','LASTUPDATE','NOTE'],1)
    df_trips = df_trips.rename(columns={'PLANNEDTIME_DEP': 'TRIPS_PLANNEDTIME_DEP'})

    df_weather = pd.read_csv(weather_file)
    df_weather.drop(['dt','timezone','city_name','lat','lon','temp_min','temp_max','sea_level','grnd_level','rain_1h','rain_3h','snow_1h','snow_3h','weather_description','wind_deg','weather_icon'],1)

    def drop_UTC(str):
        return str.replace("+0000 UTC", "")

    df_weather['date'] = df_weather['dt_iso'].apply(drop_UTC)
    df_weather = df_weather.drop(['dt_iso'],1)
    df_weather['date'] = pd.to_datetime(df_weather['date'])

    df_weather = df_weather[[
    'date',
    'temp',
    'feels_like',
    'pressure',
    'humidity',
    'wind_speed',
    'clouds_all',
    'weather_main'
    ]]

    df_weather['weather_main'] = df_weather['weather_main'].astype('category')

    df = pd.merge(df_route, df_trips, on=['DAYOFSERVICE', 'TRIPID','ROUTEID'])
    df['TRIPID'] = df['TRIPID'].astype('object')
    df = df[[
    'DAYOFSERVICE',
    'LINEID',
    'ROUTEID',
    'DIRECTION',
    'TRIPID',
    'PROGRNUMBER',
    'STOPPOINTID',
    'PLANNEDTIME_ARR',
    'ACTUALTIME_ARR',
    'VEHICLEID',
    'TRIPS_PLANNEDTIME_DEP'
    ]]

    import re

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

    df['DAYOFSERVICE'] = df['DAYOFSERVICE'].apply(tidy_datetime)

    df['DAYOFSERVICE'] = pd.to_datetime(df['DAYOFSERVICE'],format='%d-%m-%y %H:%M:%S').dt.strftime('%Y-%m-%d %H:%M:%S')
    df['DAYOFSERVICE'] = pd.to_datetime(df['DAYOFSERVICE'])
    df['timestamp'] = df.apply(lambda x: x['DAYOFSERVICE'] + pd.Timedelta(seconds=x['TRIPS_PLANNEDTIME_DEP']), axis=1)
    df = df.sort_values(["timestamp", "PROGRNUMBER"], ascending = (True, True)).apply(lambda x: x.reset_index(drop=True))

    df['timestamp'] = pd.to_datetime(df['timestamp'])

    df['DAYOFWEEK'] = df['timestamp'].dt.dayofweek
    df['MONTH'] = df['timestamp'].dt.month
    df['DAY'] = df['timestamp'].dt.day
    df['date'] = df['timestamp'].dt.round('H')

    df = pd.merge(df, df_weather, on=['date'])
    df = df.drop(['date'],1)

    holiday_list = ['2018-01-01','2018-03-17','2018-03-20','2018-03-30','2018-04-01','2018-04-02','2018-05-07','2018-06-04','2018-06-21','2018-08-06','2018-09-23','2018-10-29','2018-12-21','2018-12-24','2018-12-25','2018-12-26','2018-12-31']

    def holiday(time_str):
        if str(time_str) in holiday_list:
            return 1
        return 0
        
    df['HOLIDAY'] = df['DAYOFSERVICE'].dt.date.apply(holiday)

    df1 = df.apply(lambda x: x.reset_index(drop=True))

    df1['TRIPID'] = df1['TRIPID'].astype('category')
    df1['STOPPOINTID'] = df1['STOPPOINTID'].astype('category')
    df1['VEHICLEID'] = df1['VEHICLEID'].astype('category')
    df1['LINEID'] = df1['LINEID'].astype('category')
    df1['ROUTEID'] = df1['ROUTEID'].astype('category')
    df1['DIRECTION'] = df1['DIRECTION'].astype('category')
    df1['DAYOFWEEK'] = df1['DAYOFWEEK'].astype('category')
    df1['MONTH'] = df1['MONTH'].astype('category')
    df1['DAY'] = df1['DAY'].astype('category')
    df1['HOLIDAY'] = df1['HOLIDAY'].astype('category')
    df1['weather_main'] = df1['weather_main'].astype('category')
    df1['PROGRNUMBER'] = df1['PROGRNUMBER'].astype('int64')
    df1['clouds_all'] = df1['clouds_all'].astype('float64')

    df1 = df1[['DAYOFSERVICE',
    'LINEID',
    'ROUTEID',
    'DIRECTION',
    'TRIPID',
    'PROGRNUMBER',
    'STOPPOINTID',
    'PLANNEDTIME_ARR',
    'ACTUALTIME_ARR',
    'VEHICLEID',
    'TRIPS_PLANNEDTIME_DEP',
    'timestamp',
    'DAYOFWEEK',
    'DAY',
    'HOLIDAY',
    'temp',
    'feels_like',
    # 'pressure',
    # 'humidity',
    # 'wind_speed',
    'clouds_all',
    'weather_main'
    #  'weather_id'
    ]]

    df_rev = df1.copy()
    df_rev = df_rev.drop(['DAYOFSERVICE','TRIPID','PLANNEDTIME_ARR','STOPPOINTID','timestamp','DAY','VEHICLEID'], axis=1)
    numeric_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', StandardScaler())])

    categorical_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='constant', fill_value='missing')),
        ('onehot', OneHotEncoder(handle_unknown='ignore'))])

    preprocessor = ColumnTransformer(transformers=[
        ('num', numeric_transformer, selector(dtype_exclude="category")),
        ('cat', categorical_transformer, selector(dtype_include="category"))
    ])

    # X_train, X_test, y_train, y_test = train_test_split(df_rev.drop(['ACTUALTIME_ARR'], axis=1), df_rev['ACTUALTIME_ARR'], test_size=0.1, shuffle=False, stratify = None)

    param_grid = {'colsample_bytree': [0.1, 0.5, 0.8, 1], 'learning_rate': [0.001, 0.01, 0.1, 1], 'max_depth' : [5, 10, 15], 'n_estimators' : [50, 100, 150, 200]}

    grid_search = Pipeline(steps=[('preprocessor', preprocessor),
                        ('grid_search', GridSearchCV(XGBRegressor(), param_grid, cv = 5))])
    grid_search.fit(df_rev.drop(['ACTUALTIME_ARR'], axis=1), df_rev['ACTUALTIME_ARR'])

    result=pd.DataFrame(grid_search['grid_search'].cv_results_).sort_values('mean_test_score', ascending=False)[0:5].apply(lambda x: x.reset_index(drop=True))

    param_learning_rate = result.loc[0]['param_learning_rate']
    param_max_depth = result.loc[0]['param_max_depth']
    param_n_estimators = result.loc[0]['param_n_estimators']
    param_colsample_bytree = result.loc[0]['param_colsample_bytree']

    clf_XG = Pipeline(steps=[('preprocessor', preprocessor),
                        ('classifier', XGBRegressor(colsample_bytree = param_colsample_bytree, learning_rate = param_learning_rate,
                        max_depth = param_max_depth, n_estimators = param_n_estimators))])

    # clf_XG = Pipeline(steps=[('preprocessor', preprocessor),
    #                     ('classifier', XGBRegressor(colsample_bytree = 1, learning_rate = 0.1,max_depth = 10, n_estimators = 200))])

    clf_XG.fit(df_rev.drop(['ACTUALTIME_ARR'], axis=1), df_rev['ACTUALTIME_ARR'])

    # print("model score: %.7f" % clf_XG.score(X_test, y_test))

    joblib.dump(clf_XG, './pickle_file_XG/XG_' + df_rev.iloc[0]['LINEID'] + '.pkl') 
