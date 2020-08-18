import os
import sys
import time
import os.path

trip_file = os.environ['HOME'] + '/dublink_bus/text_data/rt_trips_DB_2018.txt'
leavetimes_file = os.environ['HOME'] + '/dublink_bus/text_data/rt_leavetimes_DB_2018.txt'

route_id = str(input('Please enter the route_id you wish to search for: '))

save_file = os.environ['HOME'] + '/dublink_bus/text_data/route_leavetimes/' + route_id + '.txt'

if os.path.exists(save_file):
    resp = str(input("Warning! That route already has a generated text file. Are you sure you wish to continue? - (y/n): "))
    if resp == 'y':
        pass
    else:
        sys.exit(0)

trip_ids = {}

start = time.time()

with open(trip_file, 'r') as f1:
    try:
        print('Getting trip_ids corresponding to chosen route...')
        for line in f1:
            if line.split(';')[4] == route_id:
                trip_ids[line.split(';')[2]] = ""
        print('Successfully obtained trip_ids!')
    except Exception as e:
        print(str(e))
        sys.exit(1)

count = 0
with open(leavetimes_file, 'r') as f2:
    try:
        print('Processing leavetimes file...')
        print("Use 'tail -f " + save_file \
                + " | cut -d\";\" -f\"2\"' in another shell window " + \
                "to check the progress of the file write" + \
                "...the end is near 31-DEC-18")

        for line in f2:
            if count == 0:
                with open(save_file, 'a') as f3:
                    f3.write(line)
                    count = 1
            if str(line.split(';')[2]) in trip_ids:
                with open(save_file, 'a') as f3:
                    f3.write(line)          

    except Exception as e:
        print(str(e))
        os.remove(save_file)
        sys.exit(1)

end = time.time()
print("DONE! Time Taken =", (end - start))


