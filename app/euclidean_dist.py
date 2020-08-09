import math


def lat_long_prox(lat1, long1, lat2, long2):
    R = 6373.0
    lat1 = math.radians(lat1)

    long1 = math.radians(long1)
    lat2 = math.radians(lat2)
    long2 = math.radians(long2)

    dlat = lat2 - lat1
    dlong = long2 - long1



    a = math.sin(dlat / 2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlong / 2)**2

    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    distance = R * c

    return distance