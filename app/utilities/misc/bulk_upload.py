import pymysql
from sqlalchemy import create_engine
import os

cnx = create_engine('mysql+pymysql://root:' + os.environ.get('MYSQL_PWD') + '@localhost:3306/dublin_bus')

with cnx.connect() as connection:
    try:
        result = connection.execute("""
                                    LOAD DATA LOCAL INFILE 'rt_leavetimes_DB_2018.txt' INTO TABLE leave_times
                                    FIELDS TERMINATED BY ';' 
                                    ENCLOSED BY '\"' 
                                    LINES TERMINATED BY '\n'
                                    IGNORE 1 LINES""")
    except Exception as e:
        print(str(e))

print("DONE!")
