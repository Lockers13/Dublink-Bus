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

dir_name = 'pickled_data/stoppoint_leavetimes'

count = 1
for i in range(1, 7780):
    try:
        df_lt = pd.read_pickle(dir_name +'/splt_' + str(i) + '.pkl')
        df_lt.to_sql('leave_times', con=cnx, if_exists='append', index=False)
        print("DONE {} DF".format(count))
        count += 1
    except Exception as e:
        print(str(e))

