import pandas as pd
import pickle
import os
from sqlalchemy import create_engine, event
import pymysql

cnx = create_engine('mysql+pymysql://root:' + os.environ.get('MYSQL_PWD') + '@localhost:3306/dublin_bus')

@event.listens_for(cnx, 'before_cursor_execute')
def receive_before_cursor_execute(conn, cursor, statement, params, context, executemany):
    if executemany:
        cursor.fast_executemany = True
        try:
            cursor.commit()
        except:
            pass

count = 1
chunksize = 10000
cols2drop = ['DATASOURCE', 'SUPPRESSED', 'JUSTIFICATIONID', 'NOTE']

for chunk in pd.read_csv(r'rt_leavetimes_DB_2018.txt', chunksize=chunksize, sep=";"):
    try:
        chunk.drop(cols2drop, axis=1, inplace=True)
        chunk['DAYOFSERVICE'] = chunk['DAYOFSERVICE'].map(lambda x: x[:10])

        date_cache = {k: pd.to_datetime(k) for k in chunk['DAYOFSERVICE'].unique()}
        chunk['DAYOFSERVICE'] = chunk['DAYOFSERVICE'].map(date_cache)

        date_cache = {k: pd.to_datetime(k) for k in chunk['LASTUPDATE'].unique()}
        chunk['LASTUPDATE'] = chunk['LASTUPDATE'].map(date_cache)
        
        chunk.to_sql('leave_times', con=cnx, if_exists='append', index=False)
        print("DONE {} CHUNK".format(count))
        count += 1
    except Exception as e:
        print(str(e))

print("DUNZO!!!")

