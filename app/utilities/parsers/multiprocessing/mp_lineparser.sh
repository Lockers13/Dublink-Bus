#!/bin/bash


int_cleanup() {
    cat /dev/null > finished.txt 2>&1
    pkill -P $2 2>&1
    rm ~/dublink_bus/text_data/line_trips/${1}*.txt 2>&1
    exit 
}

suffixes=('aa' 'ab' 'ac' 'ad' 'ae' 'af' 'ag' 'ah')
hexes=('0x1' '0x2' '0x4' '0x8')
count=0

read -p "Enter line number you wish to filter by: " lineid

if [ -f ~/dublink_bus/text_data/line_trips/${lineid}.txt ]; then
    read -p "WARNING: A file for that line already exists.
Are you sure you want to overwrite? (y/n) : " resp
    if [ "$resp" != 'y' ] && [ "$resp" != 'Y' ]; then
        exit 0
    fi
    cat /dev/null > ~/dublink_bus/text_data/line_trips/${lineid}.txt
fi

trap "int_cleanup $lineid $$" INT

printf "DATASOURCE;DAYOFSERVICE;TRIPID;PROGRNUMBER;STOPPOINTID;PLANNEDTIME_ARR;PLANNEDTIME_DEP;ACTUALTIME_ARR;ACTUALTIME_DEP;VEHICLEID;PASSENGERS;PASSENGERSIN;PASSENGERSOUT;DISTANCE;SUPPRESSED;JUSTIFICATIONID;LASTUPDATE;NOTE;ROUTEID\n" >> ~/dublink_bus/text_data/line_trips/${lineid}.txt


for i in "${suffixes[@]}";
do
   python3 parse_by_line.py -l "$lineid" -s "$i" & 
   taskset -p "${hexes[$count]}" $! > /dev/null 2>&1

   ((count=count+1))

   if [[ $count -gt 3 ]]; then
       count=0;
   fi
done

finished=$(wc -l < finished.txt)

printf "File Write in Progress..."

while [ $finished -ne 8 ]
do
    printf '.'
    sleep 2
    finished=$(wc -l < finished.txt)
done


for i in "${suffixes[@]}";
do
    cat  ~/dublink_bus/text_data/line_trips/${lineid}${i}.txt >> ~/dublink_bus/text_data/line_trips/${lineid}.txt
    rm ~/dublink_bus/text_data/line_trips/${lineid}${i}.txt 
done

cat /dev/null > finished.txt
printf '\n'
